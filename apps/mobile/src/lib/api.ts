import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail || error.title);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data: any,
    idempotencyKey?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: idempotencyKey
        ? { 'Idempotency-Key': idempotencyKey }
        : {},
    });
  }

  async patch<T>(
    endpoint: string,
    data: any,
    ifMatch?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: ifMatch ? { 'If-Match': ifMatch } : {},
    });
  }

  async delete(endpoint: string, ifMatch?: string): Promise<void> {
    return this.request<void>(endpoint, {
      method: 'DELETE',
      headers: ifMatch ? { 'If-Match': ifMatch } : {},
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
