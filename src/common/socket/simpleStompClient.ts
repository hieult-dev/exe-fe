type StompHeaders = Record<string, string>

export type StompFrame = {
  command: string
  headers: StompHeaders
  body: string
}

type StompMessageHandler = (body: string, frame: StompFrame) => void

type SimpleStompClientOptions = {
  url: string
  connectHeaders?: StompHeaders
  reconnectDelayMs?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

type SubscriptionRecord = {
  id: string
  destination: string
  callback: StompMessageHandler
}

export type StompSubscription = {
  unsubscribe: () => void
}

const frameTerminator = "\0"

function escapeHeader(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/:/g, "\\c")
}

function unescapeHeader(value: string) {
  return value.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\c/g, ":").replace(/\\\\/g, "\\")
}

function parseFrame(rawFrame: string): StompFrame | null {
  const normalizedFrame = rawFrame.replace(/^\n+/, "")
  if (!normalizedFrame.trim()) return null

  const headerEndIndex = normalizedFrame.indexOf("\n\n")
  const headerText = headerEndIndex >= 0 ? normalizedFrame.slice(0, headerEndIndex) : normalizedFrame
  const body = headerEndIndex >= 0 ? normalizedFrame.slice(headerEndIndex + 2) : ""
  const [commandLine, ...headerLines] = headerText.split("\n")
  const command = commandLine.trim()
  if (!command) return null

  const headers = headerLines.reduce<StompHeaders>((result, line) => {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex <= 0) return result

    const key = unescapeHeader(line.slice(0, separatorIndex))
    const value = unescapeHeader(line.slice(separatorIndex + 1))
    result[key] = value
    return result
  }, {})

  return { command, headers, body }
}

export class SimpleStompClient {
  private readonly subscriptions = new Map<string, SubscriptionRecord>()
  private readonly reconnectDelayMs: number
  private socket: WebSocket | null = null
  private connected = false
  private shouldReconnect = false
  private reconnectTimer: number | null = null
  private buffer = ""
  private nextSubscriptionId = 1

  constructor(private readonly options: SimpleStompClientOptions) {
    this.reconnectDelayMs = options.reconnectDelayMs ?? 3000
  }

  connect() {
    this.shouldReconnect = true

    if (!this.options.url) {
      this.reportError(new Error("Missing WebSocket URL. Check VITE_GATEWAY."))
      return
    }

    if (this.socket?.readyState === WebSocket.CONNECTING || this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    this.clearReconnectTimer()
    this.socket = new WebSocket(this.options.url)

    this.socket.onopen = () => {
      this.writeFrame("CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "0,0",
        ...this.options.connectHeaders,
      })
    }

    this.socket.onmessage = (event) => {
      if (typeof event.data !== "string") return
      this.handleSocketMessage(event.data)
    }

    this.socket.onerror = () => {
      this.reportError(new Error("WebSocket connection error."))
    }

    this.socket.onclose = () => {
      const wasConnected = this.connected
      this.connected = false
      this.socket = null
      this.buffer = ""

      if (wasConnected) {
        this.options.onDisconnect?.()
      }

      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.clearReconnectTimer()

    if (this.connected) {
      this.writeFrame("DISCONNECT", {})
    }

    const socket = this.socket
    this.connected = false
    this.buffer = ""
    this.socket = null

    if (!socket) return

    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null

    if (socket.readyState === WebSocket.CONNECTING) {
      socket.onopen = () => socket.close()
      return
    }

    socket.onopen = null
    if (socket.readyState === WebSocket.OPEN) {
      socket.close()
    }
  }

  subscribe(destination: string, callback: StompMessageHandler): StompSubscription {
    const id = `sub-${this.nextSubscriptionId}`
    this.nextSubscriptionId += 1

    const subscription: SubscriptionRecord = { id, destination, callback }
    this.subscriptions.set(id, subscription)

    if (this.connected) {
      this.sendSubscribeFrame(subscription)
    }

    return {
      unsubscribe: () => {
        if (!this.subscriptions.has(id)) return

        if (this.connected) {
          this.writeFrame("UNSUBSCRIBE", { id })
        }

        this.subscriptions.delete(id)
      },
    }
  }

  private handleSocketMessage(data: string) {
    this.buffer += data

    let terminatorIndex = this.buffer.indexOf(frameTerminator)
    while (terminatorIndex >= 0) {
      const rawFrame = this.buffer.slice(0, terminatorIndex)
      this.buffer = this.buffer.slice(terminatorIndex + frameTerminator.length)
      this.handleFrame(rawFrame)
      terminatorIndex = this.buffer.indexOf(frameTerminator)
    }
  }

  private handleFrame(rawFrame: string) {
    const frame = parseFrame(rawFrame)
    if (!frame) return

    if (frame.command === "CONNECTED") {
      this.connected = true
      this.subscriptions.forEach((subscription) => this.sendSubscribeFrame(subscription))
      this.options.onConnect?.()
      return
    }

    if (frame.command === "MESSAGE") {
      const subscriptionId = frame.headers.subscription
      const subscription = subscriptionId ? this.subscriptions.get(subscriptionId) : undefined
      subscription?.callback(frame.body, frame)
      return
    }

    if (frame.command === "ERROR") {
      this.reportError(new Error(frame.body || frame.headers.message || "STOMP error."))
    }
  }

  private sendSubscribeFrame(subscription: SubscriptionRecord) {
    this.writeFrame("SUBSCRIBE", {
      id: subscription.id,
      destination: subscription.destination,
      ack: "auto",
    })
  }

  private writeFrame(command: string, headers: StompHeaders, body = "") {
    if (this.socket?.readyState !== WebSocket.OPEN) return

    const headerLines = Object.entries(headers).map(([key, value]) => `${escapeHeader(key)}:${escapeHeader(value)}`)
    const headerBlock = headerLines.length > 0 ? `${command}\n${headerLines.join("\n")}` : command
    this.socket.send(`${headerBlock}\n\n${body}${frameTerminator}`)
  }

  private scheduleReconnect() {
    this.clearReconnectTimer()
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.reconnectDelayMs)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer === null) return
    window.clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private reportError(error: Error) {
    this.options.onError?.(error)
  }
}
