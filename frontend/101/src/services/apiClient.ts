import axios, { AxiosError, type AxiosInstance } from 'axios';
export interface Response<T> {
  data: T | undefined;
  error: AxiosError | null;
}

class ApiClient {
  public apiClient: AxiosInstance | undefined;

  private getClient(): AxiosInstance {
    let baseurl = "http://localhost:5093";
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



  async get<T>(url: string): Promise<Response<T>> {
    try {
      const response = await this.getClient().get<T>(`${url}`, {
        headers: this.getHeaders()
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: undefined, error: error.message };
    }
  }

  async post<TBody, TReturn>(url: string, body: TBody): Promise<Response<TReturn>> {
    try {
      const response = await this.getClient().post<TReturn>(`${url}`, body, {
        headers: this.getHeaders(),
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("Error making POST request:", error);
      return { data: undefined, error: error };
    }
  }


  // put method
  async put<TBody, TReturn>(url: string, body: TBody): Promise<Response<TReturn>> {
    try {
      const response = await this.getClient().put<TReturn>(`${url}`, body, {
        headers: this.getHeaders()
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: undefined, error: error.message };
    }
  }

  async delete<T>(url: string): Promise<Response<T>> {
    try {
      const response = await this.getClient().delete(`${url}`, {
        headers: this.getHeaders()
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: undefined, error: error.message };
    }
  }
}

export default ApiClient;