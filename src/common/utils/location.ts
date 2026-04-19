export type LocationCoords = {
    lat: number
    lng: number
}

export function getBrowserGeoLocation(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Trình duyệt không hỗ trợ lấy vị trí."))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
            },
            (error) => {
                reject(new Error(`Không thể lấy vị trí: ${error.message}`))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        )
    })
}
