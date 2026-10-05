// ApiHelper = Common utility class for API requests.
// It supports GET, POST, PUT, PATCH and DELETE.
// Main purpose: Write HTTP request logic once and reuse it.

import{Page, APIRequestContext, APIResponse} from "playwright/test";
// Page → Browser page
// APIRequestContext → Playwright API request object
// APIResponse → API response object

// ApiContext can be either Page or APIRequestContext.
export type ApiContext= Page | APIRequestContext;

// Supported HTTP methods.
export type HttpMethod= 'GET'| 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Defines all options required to make an API request.
export interface ApiRequestOptions {
    url: string;                         // API URL
    method: HttpMethod;                  // HTTP method
    headers?: Record<string, string>;    // Request headers
    data?: unknown;                      // Request body / payload
    params?: Record<string, string>;     // Query parameters
    timeout?: number;                    // Request timeout
}

// Defines retry configuration.
export interface RetryOptions {
    condition: (response: APIResponse) => Promise<boolean> | boolean
    pollingInterval?: number;            // Wait time between retries
    retryCount?: number;                 // Number of retry attempts
}

// Common API helper class.
export class ApiHelper {

    // Stores Page or APIRequestContext.
    private context: ApiContext;

    constructor(context: ApiContext) {
        this.context = context;
    }

    // Gets the API request object from the provided context.
    private getRequest(): APIRequestContext {
        if ('request' in this.context) {
            return this.context.request;
        }
        return this.context;
    }

    // Builds the complete URL with query parameters.
    // Example:
    // /booking + { firstname: 'John' }
    // → /booking?firstname=John
    private buildUrl(url: string, params?: Record<string, string>): string {
        if (!params) return url;
        const searchParams = new URLSearchParams(params);
        return `${url}?${searchParams.toString()}`;
    }

    // Performs any supported HTTP request.
    async callApi(options: ApiRequestOptions): Promise<APIResponse> {
        const { url, method, headers, data, params, timeout } = options;
        const request = this.getRequest();
        const fullUrl = this.buildUrl(url, params);

        // Selects the correct Playwright method based on HTTP method.
        switch (method) {
            case 'GET':
                return await request.get(fullUrl, { headers, timeout });
            case 'POST':
                return await request.post(fullUrl, { headers, data, timeout });
            case 'PUT':
                return await request.put(fullUrl, { headers, data, timeout });
            case 'DELETE':
                return await request.delete(fullUrl, { headers, timeout });
            case 'PATCH':
                return await request.patch(fullUrl, { headers, data, timeout });
            default:
                throw new Error(`Unsupported HTTP method: ${String(method)}`);
        }
    }

    // Calls an API repeatedly until the condition is satisfied
    // or the retry count is completed.
    async callApiWithRetry(
        options: ApiRequestOptions,
        retryOptions: RetryOptions,
    ): Promise<APIResponse> {
        const { condition, pollingInterval = 5000, retryCount = 3 } = retryOptions;
        let lastResponse: APIResponse | null = null;

        // Repeat API call according to retryCount.
        for (let attempt = 1; attempt <= retryCount; attempt++) {
            lastResponse = await this.callApi(options);

            // Stop retrying when the condition becomes true.
            if (await condition(lastResponse)) {
                return lastResponse;
            }

            // Wait before the next retry.
            if (attempt < retryCount) {
                await new Promise(resolve => setTimeout(resolve, pollingInterval));
            }
        }

        // Return the last API response.
        return lastResponse!;
    }

    // Convenience method for GET.
    // Instead of callApi({ url, method: 'GET' }),
    // we can simply use get(url).
    async get(url: string, options?: Omit<ApiRequestOptions, 'url' | 'method'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'GET', ...options });
    }

    // Convenience method for POST.
    // `data` represents the request payload.
    async post(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'POST', data, ...options });
    }

    // Convenience method for PUT.
    async put(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'PUT', data, ...options });
    }

    // Convenience method for DELETE.
    async delete(url: string, options?: Omit<ApiRequestOptions, 'url' | 'method'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'DELETE', ...options });
    }

    // Convenience method for PATCH.
    async patch(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'PATCH', data, ...options });
    }

    // Converts JSON response into the required TypeScript type.
    // T = generic type defined by the caller.
    async parseJsonResponse<T>(response: APIResponse): Promise<T> {
        return await response.json() as T;
    }

    // Checks whether response status is successful (2xx).
    isSuccess(response: APIResponse): boolean {
        const status = response.status();
        return status >= 200 && status < 300;
    }

    // Checks whether response status is a client error (4xx).
    isFailureClient(response: APIResponse): boolean {
        const status = response.status();
        return status >= 400 && status < 500;
    }
}

// ============================================================
// SIMPLE SUMMARY
// ============================================================

// ApiHelper
// → Common API request utility.
//
// callApi()
// → Handles GET, POST, PUT, PATCH, DELETE.
//
// callApiWithRetry()
// → Repeats API request based on condition.
//
// get()
// → GET request.
//
// post()
// → POST request.
//
// put()
// → PUT request.
//
// patch()
// → PATCH request.
//
// delete()
// → DELETE request.
//
// buildUrl()
// → Adds query parameters to URL.
//
// parseJsonResponse()
// → Converts JSON response to TypeScript type.
//
// isSuccess()
// → Checks 2xx response.
//
// isFailureClient()
// → Checks 4xx response.
//
// Main flow:
//
// API Test
//    ↓
// BookingApi
//    ↓
// ApiHelper
//    ↓
// callApi()
//    ↓
// Playwright API Request
//    ↓
// API Response