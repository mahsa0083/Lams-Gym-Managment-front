export interface JwtPayload {
  role?: string
  [key: string]: unknown
}

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return null
    }

    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(
            (char) =>
              '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2),
          )
          .join(''),
      ),
    )

    return {
      ...decodedPayload,
      role: decodedPayload[ROLE_CLAIM],
    }
  } catch {
    return null
  }
}