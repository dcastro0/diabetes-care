import { API_URL } from "@/constants/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T; status: number; ok: boolean }> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMsg =
          (typeof data === "object" && (data?.error || data?.message)) ||
          `Requisição falhou com status ${response.status}`;
        throw new ApiError(errorMsg, response.status, data);
      }

      return { data: data as T, status: response.status, ok: response.ok };
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err.message || "Erro de rede ao conectar ao servidor",
        0,
      );
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options: RequestOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new HttpClient(API_URL);
