import type { Spa } from "@/common/util/mock-data"
import { useEffect, useMemo, useRef } from "react"

import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import OSM from "ol/source/OSM"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import Overlay from "ol/Overlay"
import XYZ from "ol/source/XYZ"
import { fromLonLat, toLonLat } from "ol/proj"
import Style from "ol/style/Style"
import CircleStyle from "ol/style/Circle"
import Fill from "ol/style/Fill"
import Stroke from "ol/style/Stroke"

interface InteractiveMapProps {
  spas: Spa[]
  onSpaSelect: (spa: Spa) => void
  userLocation?: { lat: number; lng: number }
}

function buildGoogleDirectionsUrl(opts: {
  dest: { lat: number; lng: number }
  origin?: { lat: number; lng: number }
}) {
  const destination = `${opts.dest.lat},${opts.dest.lng}`

  if (opts.origin) {
    const origin = `${opts.origin.lat},${opts.origin.lng}`
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}&travelmode=driving`
}

function circleStyle(color: string, radiusPx: number) {
  return new Style({
    image: new CircleStyle({
      radius: radiusPx,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: "#fff", width: 2 }),
    }),
  })
}

export function InteractiveMap({ spas, onSpaSelect, userLocation }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // OpenLayers instances
  const mapRef = useRef<Map | null>(null)
  const spaLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const userLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const popupOverlayRef = useRef<Overlay | null>(null)

  // Popup DOM
  const popupRef = useRef<HTMLDivElement | null>(null)
  const popupContentRef = useRef<HTMLDivElement | null>(null)
  const popupCloserRef = useRef<HTMLButtonElement | null>(null)

  const defaultCenter = useMemo(() => ({ lat: 10.7769, lng: 106.7009 }), [])
  const center = userLocation ?? defaultCenter

  const spaStyle = useMemo(() => circleStyle("#f97316", 9), [])
  const userStyle = useMemo(() => circleStyle("#22c55e", 7), [])

  // 1) Init map once
  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) return

    // Base layer
    const base = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attributions: '© OpenStreetMap contributors',
        crossOrigin: "anonymous",
      }),
    })

    // Vector layers
    const spaSource = new VectorSource()
    const spaLayer = new VectorLayer({ source: spaSource })
    spaLayerRef.current = spaLayer

    const userSource = new VectorSource()
    const userLayer = new VectorLayer({ source: userSource })
    userLayerRef.current = userLayer

    // Popup overlay
    const popupEl = popupRef.current
    if (!popupEl) return

    const overlay = new Overlay({
      element: popupEl,
      autoPan: { animation: { duration: 250 } },
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -12],
    })
    popupOverlayRef.current = overlay

    // View
    const view = new View({
      center: fromLonLat([center.lng, center.lat]),
      zoom: 13,
    })

    // Map
    const map = new Map({
      target: containerRef.current,
      layers: [base, spaLayer, userLayer],
      overlays: [overlay],
      view,
    })
    mapRef.current = map

    // Close button
    const closer = popupCloserRef.current
    if (closer) {
      closer.onclick = () => {
        overlay.setPosition(undefined)
        return false
      }
    }

    // Click handler: detect feature -> show popup + call onSpaSelect
    map.on("singleclick", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f as Feature) as
        | Feature
        | undefined

      if (!feature) {
        overlay.setPosition(undefined)
        return
      }

      const spa: Spa | undefined = feature.get("spa")
      const kind: string | undefined = feature.get("kind")

      if (kind === "user") {
        if (popupContentRef.current) {
          popupContentRef.current.innerHTML = `<div style="padding:8px;max-width:260px;">
            <div style="font-weight:700;margin-bottom:6px;">Your location</div>
          </div>`
        }
        overlay.setPosition(evt.coordinate)
        return
      }

      if (!spa) return

      onSpaSelect(spa)

      const directionsUrl = buildGoogleDirectionsUrl({
        dest: { lat: spa.lat, lng: spa.lng },
        origin: userLocation,
      })

      if (popupContentRef.current) {
        popupContentRef.current.innerHTML = `
          <div style="padding:8px;max-width:260px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.2;">${escapeHtml(
          spa.name
        )}</h3>
            </div>

            <p style="margin:0 0 8px;font-size:14px;color:#666;">${escapeHtml(
          spa.address
        )}</p>

            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
              <span style="color:#f97316;">★</span>
              <b>${escapeHtml(String(spa.rating))}</b>
              <span style="color:#666;">(${escapeHtml(String(spa.reviews))})</span>
            </div>

            <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#f97316;">
              ${escapeHtml(spa.priceRange)}
            </p>

            <a
              href="${directionsUrl}"
              target="_blank"
              rel="noreferrer"
              style="
                display:inline-flex;align-items:center;justify-content:center;gap:8px;
                padding:8px 10px;border-radius:10px;background:#2563eb;color:#fff;
                font-weight:600;font-size:14px;text-decoration:none;width:100%;
              "
            >
              Get directions on Google Maps
            </a>

            ${!userLocation
            ? `<p style="margin:8px 0 0;font-size:12px;color:#666;">
                    (Enable location so Google Maps can auto-fill your origin)
                   </p>`
            : ""
          }
          </div>
        `
      }

      overlay.setPosition(evt.coordinate)
    })

    return () => {
      map.setTarget(undefined)
      mapRef.current = null
      spaLayerRef.current = null
      userLayerRef.current = null
      popupOverlayRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Recenter when center changes (like Recenter component)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getView().setCenter(fromLonLat([center.lng, center.lat]))
  }, [center.lat, center.lng])

  // 3) Update spa markers when spas change
  useEffect(() => {
    const spaLayer = spaLayerRef.current
    if (!spaLayer) return

    const source = spaLayer.getSource()
    if (!source) return

    source.clear()

    const features = spas.map((spa) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([spa.lng, spa.lat])),
      })
      f.set("spa", spa)
      f.setStyle(spaStyle)
      return f
    })

    source.addFeatures(features)
  }, [spas, spaStyle])

  // 4) Update user marker when userLocation changes
  useEffect(() => {
    const userLayer = userLayerRef.current
    if (!userLayer) return

    const source = userLayer.getSource()
    if (!source) return

    source.clear()

    if (!userLocation) return

    const f = new Feature({
      geometry: new Point(fromLonLat([userLocation.lng, userLocation.lat])),
    })
    f.set("kind", "user")
    f.setStyle(userStyle)
    source.addFeature(f)
  }, [userLocation, userStyle])

  return (
    <div className="w-full h-[600px] rounded-lg border border-border overflow-hidden relative">
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Popup overlay element */}
      <div
        ref={popupRef}
        style={{
          position: "absolute",
          background: "white",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          minWidth: 240,
        }}
      >
        <button
          ref={popupCloserRef}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "26px",
          }}
        >
          ×
        </button>
        <div ref={popupContentRef} />
      </div>
    </div>
  )
}

// chống XSS nhẹ cho popup HTML
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
