import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ElMessage } from "element-plus";
import { ResultData } from "./modules/type";



const config: any = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
};

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    this.service = axios.create(config);
    this.service.interceptors.request.use(
      (config: any) => {
        return {
          ...config,
        };
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        return data;
      },
      async (error: AxiosError) => {
        const { response }: any = error;
        if (response?.data.status === 500) {
          ElMessage.error("接口请求异常!");
        } else if (response?.data.status === 400) {
          ElMessage.error(response?.data.message);
        } else {
          ElMessage.error("服务器错误或接口请求超时，请稍后重试!");
        }
        return Promise.reject(response);
      }
    );
  }

  // 常用方法封装
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }

  post<T>(
    url: string,
    params?: object,
    _object = {},
    paramsFlag = true
  ): Promise<ResultData<T>> {
    if (!paramsFlag) {
      return this.service.post(url, "", { params: { ...params } });
    }
    return this.service.post(url, params, _object);
  }

  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }

  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
}

export default new RequestHttp(config);
