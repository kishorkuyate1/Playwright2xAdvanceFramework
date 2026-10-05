// Import APIResponse to work with raw API responses.
// Import ApiHelper for common API request operations.
import { APIResponse } from '@playwright/test';
import { ApiHelper, ApiContext } from '@utils/ApiHelper';

// Defines the booking date structure.
export interface BookingDates {
    checkin: string;
    checkout: string;
}

// Defines the complete Booking payload.
export interface Booking {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: BookingDates;
    additionalneeds?: string;
}

// Defines the response received after creating a booking.
export interface CreateBookingResponse {
    bookingid: number;
    booking: Booking;
}

// Defines the booking ID response.
export interface BookingId {
    bookingid: number;
}

// Defines optional filters for searching bookings.
export interface BookingFilters {
    firstname?: string;
    lastname?: string;
    checkin?: string;
    checkout?: string;
}

// Common headers used for JSON API requests.
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };
// API returns 403 when the authentication token is rejected.
const TOKEN_REJECTED = 403;
// BookingApi contains all Booking API operations.
export class BookingApi {

    // ApiHelper handles common HTTP operations.
    private apiHelper: ApiHelper;
    // Base URL of the API.
    private baseUrl: string;
    // Authentication username.
    private username: string;
    // Authentication password.
    private password: string;
    // Stores the generated token for reuse.
    private cachedToken?: string;

    // Constructor initializes API helper, URL and credentials.
    constructor(
        context: ApiContext,
        baseUrl = 'https://restful-booker.herokuapp.com',
        credentials: { username?: string; password?: string } = {},
    ) {
        this.apiHelper = new ApiHelper(context);
        this.baseUrl = baseUrl;
        this.username = credentials.username ?? 'admin';
        this.password = credentials.password ?? 'password123';
    }

    // Creates headers required for authenticated requests.
    // Token is sent using the Cookie header.
    private authHeaders(token: string): Record<string, string> {
        return { ...JSON_HEADERS, Cookie: `token=${token}` };
    }

    // ---------- TOKEN MANAGEMENT ----------

    // Gets a cached token or generates a new token.
    // forceRefresh = true forces a new authentication.
    async getToken(forceRefresh = false): Promise<string> {
        if (forceRefresh) this.invalidateToken();
        return (this.cachedToken ??= await this.auth());
    }

    // Removes the cached token.
    // Next API call will generate a new token.
    invalidateToken(): void {
        this.cachedToken = undefined;
    }

    // Sends an authenticated request.
    // If token is rejected with 403, it generates a new token and retries.
    private async sendAuthed(
        send: (token: string) => Promise<APIResponse>,
        explicitToken?: string,
    ): Promise<APIResponse> {
        if (explicitToken !== undefined) return send(explicitToken);
        const res = await send(await this.getToken());
        return res.status() === TOKEN_REJECTED ? send(await this.getToken(true)) : res;
    }

    // ---------- GET BOOKINGS ----------

    // GET /booking
    // Returns booking IDs.
    // Optional filters can be used to search bookings.
    async getAllBookings(filters?: BookingFilters): Promise<BookingId[]> {
        const response = await this.apiHelper.get(`${this.baseUrl}/booking`, {
            params: filters as Record<string, string> | undefined,
        });
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] GET /booking failed: ${response.status()}`);
        }
        return this.apiHelper.parseJsonResponse<BookingId[]>(response);
    }

    // GET /booking/{id}
    // Returns complete booking details.
    async getBooking(id: number): Promise<Booking> {
        const response = await this.getBookingResponse(id);
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] GET /booking/${id} failed: ${response.status()}`);
        }
        return this.apiHelper.parseJsonResponse<Booking>(response);
    }

    // GET /booking/{id}
    // Returns the raw API response.
    // Useful when the test needs to verify status codes such as 404.
    async getBookingResponse(id: number): Promise<APIResponse> {
        return this.apiHelper.get(`${this.baseUrl}/booking/${id}`);
    }

    // ---------- AUTHENTICATION ----------

    // POST /auth
    // Generates an authentication token.
    async auth(username = this.username, password = this.password): Promise<string> {
        const response = await this.apiHelper.post(`${this.baseUrl}/auth`, { username, password }, {
            headers: JSON_HEADERS,
        });
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] POST /auth failed: ${response.status()}`);
        }
        const body = await this.apiHelper.parseJsonResponse<{ token?: string; reason?: string }>(response);
        if (!body.token) {
            throw new Error(`[BookingApi] /auth returned no token. Reason: ${body.reason ?? 'unknown'}`);
        }
        return body.token;
    }

    // ---------- CREATE BOOKING ----------

    // POST /booking
    // Returns raw response.
    // Useful when testing negative scenarios/status codes.
    async createBookingResponse(payload: unknown): Promise<APIResponse> {
        return this.apiHelper.post(`${this.baseUrl}/booking`, payload, { headers: JSON_HEADERS });
    }

    // POST /booking
    // Creates a booking and returns booking ID + booking details.
    async createBooking(payload: Booking): Promise<CreateBookingResponse> {
        const response = await this.createBookingResponse(payload);
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] POST /booking failed: ${response.status()}`);
        }
        return this.apiHelper.parseJsonResponse<CreateBookingResponse>(response);
    }

    // ---------- UPDATE BOOKING ----------

    // PUT /booking/{id}
    // Updates the complete booking.
    // Requires authentication.
    async updateBookingResponse(id: number, payload: unknown, token?: string): Promise<APIResponse> {
        return this.sendAuthed(
            (t) => this.apiHelper.put(`${this.baseUrl}/booking/${id}`, payload, {
                headers: this.authHeaders(t),
            }),
            token,
        );
    }

    // PUT /booking/{id}
    // Updates the booking and returns the updated booking.
    async updateBooking(id: number, payload: Booking, token?: string): Promise<Booking> {
        const response = await this.updateBookingResponse(id, payload, token);
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] PUT /booking/${id} failed: ${response.status()}`);
        }
        return this.apiHelper.parseJsonResponse<Booking>(response);
    }

    // ---------- PARTIAL UPDATE ----------

    // PATCH /booking/{id}
    // Updates only selected booking fields.
    // Uses Partial<Booking> because all booking fields are optional here.
    async patchBooking(id: number, partial: Partial<Booking>, token?: string): Promise<Booking> {
        const response = await this.sendAuthed(
            (t) => this.apiHelper.patch(`${this.baseUrl}/booking/${id}`, partial, {
                headers: this.authHeaders(t),
            }),
            token,
        );
        if (!this.apiHelper.isSuccess(response)) {
            throw new Error(`[BookingApi] PATCH /booking/${id} failed: ${response.status()}`);
        }
        return this.apiHelper.parseJsonResponse<Booking>(response);
    }

    // ---------- DELETE BOOKING ----------

    // DELETE /booking/{id}
    // Deletes a booking and returns the HTTP status code.
    // Requires authentication.
    async deleteBooking(id: number, token?: string): Promise<number> {
        const response = await this.sendAuthed(
            (t) => this.apiHelper.delete(`${this.baseUrl}/booking/${id}`, {
                headers: this.authHeaders(t),
            }),
            token,
        );
        return response.status();
    }
}