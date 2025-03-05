import 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _requestId?: string;
  }
}
