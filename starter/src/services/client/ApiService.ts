import type {
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import AxiosBase from "./axios/AxiosBase";

type ApiConfig = Omit<
  AxiosRequestConfig,
  "url" | "method" | "data" | "params"
>;

const ApiService = {
  /**
   * متد پایه برای تمام درخواست‌ها.
   * در حالت عادی از متدهای get/post/put/patch/delete استفاده کن.
   */
  async fetchDataWithAxios<
    TResponse = unknown,
    TRequest = unknown
  >(config: AxiosRequestConfig<TRequest>): Promise<TResponse> {
    const response: AxiosResponse<TResponse> = await AxiosBase(config);

    return response.data;
  },

  /**
   * GET /api/resource
   *
   * مثال:
   * ApiService.get<TrainerListItemResponse[]>("/api/trainers")
   */
  get<TResponse = unknown, TParams = Record<string, unknown>>(
    url: string,
    params?: TParams,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse>({
      ...config,
      url,
      method: "GET",
      params,
    });
  },

  /**
   * GET /api/resource/{id}
   *
   * مثال:
   * ApiService.getById<TrainerDetailsResponse>("/api/trainers", trainerId)
   */
  getById<TResponse = unknown, TId extends string | number = number>(
    baseUrl: string,
    id: TId,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.get<TResponse>(
      `${baseUrl}/${id}`,
      undefined,
      config
    );
  },

  /**
   * POST /api/resource
   *
   * مثال:
   * ApiService.post<boolean, CreateTrainerRequest>("/api/trainers", payload)
   */
  post<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse, TRequest>({
      ...config,
      url,
      method: "POST",
      data,
    });
  },

  /**
   * PUT /api/resource/{id}
   *
   * URL را کامل بده:
   * ApiService.put<void, UpdateTrainerRequest>(
   *   `/api/trainers/${id}`,
   *   payload
   * )
   */
  put<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse, TRequest>({
      ...config,
      url,
      method: "PUT",
      data,
    });
  },

  /**
   * PATCH /api/resource/{id}
   */
  patch<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse, TRequest>({
      ...config,
      url,
      method: "PATCH",
      data,
    });
  },

  /**
   * DELETE /api/resource/{id}
   *
   * مثال:
   * ApiService.delete<void>(`/api/trainers/${id}`)
   */
  delete<TResponse = void>(
    url: string,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse>({
      ...config,
      url,
      method: "DELETE",
    });
  },

  /**
   * DELETE همراه با Query String
   *
   * مثال:
   * ApiService.deleteWithParams<void>(
   *   "/api/trainers",
   *   { force: true }
   * )
   */
  deleteWithParams<
    TResponse = unknown,
    TParams = Record<string, unknown>
  >(
    url: string,
    params?: TParams,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse>({
      ...config,
      url,
      method: "DELETE",
      params,
    });
  },

  /**
   * DELETE همراه با Body
   *
   * نکته: در Axios بدنهٔ DELETE باید در data باشد، نه params.
   *
   * مثال:
   * ApiService.deleteWithBody<void, { reason: string }>(
   *   `/api/trainers/${id}`,
   *   { reason: "Duplicate record" }
   * )
   */
  deleteWithBody<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: ApiConfig
  ): Promise<TResponse> {
    return ApiService.fetchDataWithAxios<TResponse, TRequest>({
      ...config,
      url,
      method: "DELETE",
      data,
    });
  },
};

export default ApiService;
