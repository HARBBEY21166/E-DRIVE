// Base URL for API requests
const BASE_URL = "https://api.example.com"

// Default headers
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
}

// Interface for API response
interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Generic fetch function with error handling
 */
export const fetchApi = async <T>(\
  endpoint: string,
  options: RequestInit = {},
  token?: string
)
: Promise<ApiResponse<T>> =>
{
  try {
    // Prepare headers
    const headers = new Headers(DEFAULT_HEADERS)

    // Add authorization token if provided
    if (token) {
      headers.append("Authorization", `Bearer ${token}`)
    }

    // Merge headers with options
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...Object.fromEntries(headers.entries()),
        ...options.headers,
      },
    }

    // Make the request
    const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions)
    const status = response.status

    // Parse JSON response
    const data = await response.json()

    // Check if response is ok
    if (!response.ok) {
      return {
        data: null,
        error: data.message || 'An error occurred',
        status,
      };
    }

    return {
      data,
      error: null,
      status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
    };
  }
}

/**
 * GET request
 */
export const get = async <T>(
  endpoint: string,
  token?: string
)
: Promise<ApiResponse<T>> =>
{
  return fetchApi<T>(endpoint, { method: 'GET' }, token);
}

/**
 * POST request
 */
export const post = async <T>(
  endpoint: string,
  body: any,
  token?: string
)
: Promise<ApiResponse<T>> =>
{
  return fetchApi<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    token
  );
}

/**
 * PUT request
 */
export const put = async <T>(
  endpoint: string,
  body: any,
  token?: string
)
: Promise<ApiResponse<T>> =>
{
  return fetchApi<T>(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
    token
  );
}

/**
 * DELETE request
 */
export const del = async <T>(
  endpoint: string,
  token?: string
)
: Promise<ApiResponse<T>> =>
{
  return fetchApi<T>(endpoint, { method: 'DELETE' }, token);
}

