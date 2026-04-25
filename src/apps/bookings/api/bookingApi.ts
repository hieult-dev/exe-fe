import api from '@/common/api/baseApi';
import { GATEWAY_URL } from '@/common/config/api';
import type { BookingCursorPage } from '@/apps/bookings/model';

const BOOKING_URL = `${GATEWAY_URL}/api/bookings`;

/**
 * Fetch bookings with cursor-based pagination.
 * Mirrors the pattern used in serviceApi.getServices().
 */
export const getBookings = async (
    size = 20,
    cursor: number | null = null,
    keyword: string = "",
    status: string = "",
) => {
    const params: Record<string, any> = { size };
    if (cursor) {
        params.cursor = cursor;
    }
    if (keyword) {
        params.customerName = keyword;
    }
    if (status && status !== "ALL") {
        params.status = status;
    }
    return api.get<BookingCursorPage>(BOOKING_URL, { params });
};

/**
 * Get a single booking by ID.
 */
export const getBookingById = async (id: number) => {
    return api.get<any>(`${BOOKING_URL}/${id}`);
};

/**
 * Update booking status (accept, reject, next step, etc.).
 */
export const updateBookingStatus = async (id: number, status: string, note?: string) => {
    return api.put<any>(`${BOOKING_URL}/${id}/status`, { status, note });
};

/**
 * Assign staff members to a booking.
 */
export const assignBooking = async (bookingId: number, staffUserIds: number[]) => {
    return api.put<any>(`${BOOKING_URL}/${bookingId}/staff`, { staffUserIds });
};
