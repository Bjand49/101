import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { loadingService } from './loadingService';
export interface Response<T> {
  data: T | undefined;
  error: AxiosError | null;
}

interface RequestOptions {
  showSpinner?: boolean;
}

class ApiClient {
  public apiClient: AxiosInstance | undefined;

  private getClient(): AxiosInstance {
    let baseurl = "http://192.168.4.23:5000";
    const envBaseUrl = import.meta.env.VITE_BASE_URL;

    if (envBaseUrl) {
      baseurl = envBaseUrl;
    }


    this.apiClient ??= axios.create({
      baseURL: baseurl,
      timeout: 10000,
      headers: this.getHeaders()

    });
    return this.apiClient;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "test-header": "test-header-value"
    };
    return headers;
  }

  private async sendRequest<TReturn>(
    request: () => Promise<AxiosResponse<TReturn>>,
    options?: RequestOptions,
  ): Promise<Response<TReturn>> {
    const showSpinner = options?.showSpinner ?? true;

    if (showSpinner) {
      loadingService.startRequest();
    }

    try {
      const response = await request();
      return { data: response.data, error: null };
    } catch (error: any) {
      const axiosError = error as AxiosError;
      console.error('Error making API request:', axiosError);
      return { data: undefined, error: axiosError };
    } finally {
      if (showSpinner) {
        loadingService.endRequest();
      }
    }
  }

  async get<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.sendRequest<T>(
      () =>
        this.getClient().get<T>(`${url}`, {
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  async post<TBody, TReturn>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<Response<TReturn>> {
    return this.sendRequest<TReturn>(
      () =>
        this.getClient().post<TReturn>(`${url}`, body, {
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  // put method
  async put<TBody, TReturn>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<Response<TReturn>> {
    return this.sendRequest<TReturn>(
      () =>
        this.getClient().put<TReturn>(`${url}`, body, {
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<Response<T>> {
    return this.sendRequest<T>(
      () =>
        this.getClient().delete<T>(`${url}`, {
          headers: this.getHeaders(),
        }),
      options,
    );
  }
}

export default ApiClient;