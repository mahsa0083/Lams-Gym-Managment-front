import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
// import type { ForgotPassword, ResetPassword } from '@/@types/auth'
import type {
    ForgotPassword,
    ResetPassword,
    SendOtpCredential,
    SendOtpResponse,
    SignInCredential,
    SignInResponse,
    RegisterCredential,
    RegisterResponse,
} from '@/@types/auth'

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function apiSendOtp(data: SendOtpCredential) {
    return ApiService.fetchDataWithAxios<SendOtpResponse>({
        url: endpointConfig.sendOtp,
        method: 'post',
        data: {
            nationalCode: data.nationalCode,
        },
    })
}
export async function apiLogin(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<SignInResponse>({
        url: endpointConfig.login,
        method: 'post',
        data: {
            nationalCode: data.nationalCode,
            code: data.code,
        },
    })
}
const formatGregorianDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export async function apiRegister(data: RegisterCredential) {
    return ApiService.fetchDataWithAxios<RegisterResponse>({
        url: endpointConfig.signUp,
        method: 'post',
        data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phoneNumber: data.phoneNumber.trim(),
            nationalCode: data.nationalCode.trim(),
            birthDate: data.birthDate
                ? formatGregorianDate(data.birthDate)
                : null,
        },
    })
}

