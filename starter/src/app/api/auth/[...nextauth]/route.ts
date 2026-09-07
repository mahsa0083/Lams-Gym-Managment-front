import NextAuth from 'next-auth'
import authConfig from '@/configs/auth.config'

const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
})

export const { GET, POST } = handlers

export {
    auth,
    signIn,
    signOut,
}