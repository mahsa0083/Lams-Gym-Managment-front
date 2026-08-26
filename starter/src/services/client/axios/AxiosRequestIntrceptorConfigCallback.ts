import type { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const AxiosRequestIntrceptorConfigCallback = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
};

export default AxiosRequestIntrceptorConfigCallback;
