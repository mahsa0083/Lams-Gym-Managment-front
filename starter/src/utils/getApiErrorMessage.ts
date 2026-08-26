import axios from "axios";

type ApiValidationErrors = Record<string, string[] | undefined>;

interface ApiProblemDetails {
  title?: string;
  detail?: string;
  message?: string;
  errors?: ApiValidationErrors;
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = "ارتباط با سرور با خطا مواجه شد."
): string => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallbackMessage;
  }

  const responseData = error.response?.data as ApiProblemDetails | undefined;

  if (!responseData) {
    if (error.code === "ECONNABORTED") {
      return "زمان پاسخ‌گویی سرور به پایان رسید. لطفاً دوباره تلاش کنید.";
    }

    if (!error.response) {
      return "اتصال به سرور برقرار نشد. اینترنت یا آدرس API را بررسی کنید.";
    }

    return fallbackMessage;
  }

  if (responseData.detail?.trim()) {
    return responseData.detail;
  }

  if (responseData.message?.trim()) {
    return responseData.message;
  }

  const validationMessages = Object.values(responseData.errors ?? {})
    .flatMap((messages) => messages ?? [])
    .filter(Boolean);

  if (validationMessages.length > 0) {
    return validationMessages.join("\n");
  }

  if (responseData.title?.trim()) {
    return responseData.title;
  }

  return fallbackMessage;
};
