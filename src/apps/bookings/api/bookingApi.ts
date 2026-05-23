import api from '@/common/api/baseApi';
import type { BookingCheckoutRequest, BookingCheckoutResponse, BookingCursorPage, BookingDTO } from '@/apps/bookings/model';
import type { InvoiceDetailDTO } from '@/apps/invoices/model';

const BOOKING_URL = `/bookings`;

/**
 * Fetch bookings with cursor-based pagination.
 * Mirrors the pattern used in serviceApi.getServices().
 */
export const getBookings = async (
    size = 20,
    cursor: number | null = null,
    keyword: string = "",
    status: string = "",
    createDate: string | undefined = undefined,
    appointmentDate: string | undefined = undefined,
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
    if (createDate) {
        params.createDate = createDate;
    }
    if (appointmentDate) {
        params.appointmentDate = appointmentDate;
    }
    return api.get<BookingCursorPage>(BOOKING_URL, { params });
};

export const getBookingsByDay = async (currentDate: string) => {
    return api.get<BookingDTO[]>(`${BOOKING_URL}/by-day`, {
        params: { currentDate },
    });
};

/**
 * Get a single booking by ID.
 */
export const getBookingById = async (id: number) => {
    return api.get<BookingDTO>(`${BOOKING_URL}/${id}`);
};

/**
 * Update booking status (accept, reject, next step, etc.).
 */
export const updateBookingStatus = async (id: number, status: string, note?: string) => {
    return api.put<any>(`${BOOKING_URL}/${id}/status`, { status, note });
};

export const checkoutBooking = async (bookingId: number, data: BookingCheckoutRequest) => {
    return api.post<BookingCheckoutResponse>(`${BOOKING_URL}/${bookingId}/checkout`, data);
};

export const getBookingInvoice = async (bookingId: number) => {
    return api.get<InvoiceDetailDTO>(`${BOOKING_URL}/${bookingId}/invoice`);
};
