import { type QueryClient, queryOptions } from "@tanstack/react-query"
import { redirect } from "@tanstack/react-router"
import { AxiosError } from "axios"

import {
    type Body_login_login_access_token as AccessToken,
    LoginService,
    type UpdatePassword,
    type UserPublic,
    type UserRegister,
    UsersService,
} from "@/client"
import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "@/lib/authToken"

export const keys = {
    currentUser: ["currentUser"],
}

export function isLoggedIn() {
    return getAccessToken() !== null
}

export function currentUserQuery() {
    return queryOptions<UserPublic | null>({
        queryKey: keys.currentUser,
        queryFn: async () => (await UsersService.readUserMe()).data,
        enabled: isLoggedIn(),
    })
}

export async function login(body: AccessToken) {
    const { data } = await LoginService.loginAccessToken({ body })
    setAccessToken(data.access_token)
}

// Revokes the token server-side, but logs out locally even if that fails
export async function logout() {
    try {
        await LoginService.logout()
    } catch {}
    clearAccessToken()
}

export function register(body: UserRegister) {
    return UsersService.registerUser({ body })
}

export function recoverPassword(email: string) {
    return LoginService.recoverPassword({ path: { email } })
}

export function resetPassword(token: string, newPassword: string) {
    return LoginService.resetPassword({
        body: { token, new_password: newPassword },
    })
}

// The change revokes every older token, this tab's included, so keep the new one
export async function changePassword(body: UpdatePassword) {
    const { data } = await UsersService.updatePasswordMe({ body })
    setAccessToken(data.access_token)
}

// The token is invalid (expired, revoked, or its user is gone) or the account is disabled
export function isAuthError(error: unknown) {
    if (!(error instanceof AxiosError)) {
        return false
    }
    const status = error.response?.status
    const code = error.response?.data?.code
    return (
        status === 401 ||
        (status === 403 &&
            (code === "user_inactive" || code === "company_inactive"))
    )
}

// Route guards for `beforeLoad`

// A stored token can be stale (e.g. after a database reset), so confirm it
// before rendering the app; the user is cached for useAuth
export async function requireLogin({
    context,
}: {
    context: { queryClient: QueryClient }
}) {
    if (!isLoggedIn()) {
        throw redirect({ to: "/login" })
    }
    if (context.queryClient.getQueryData(keys.currentUser)) {
        return
    }
    try {
        const { data: user } = await UsersService.readUserMe()
        context.queryClient.setQueryData(keys.currentUser, user)
    } catch (error) {
        if (!isAuthError(error)) {
            throw error
        }
        clearAccessToken()
        throw redirect({ to: "/login" })
    }
}

export function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        throw redirect({ to: "/" })
    }
}

export async function requireRole(allowed: (user: UserPublic) => boolean) {
    const { data: user } = await UsersService.readUserMe()
    if (!allowed(user)) {
        throw redirect({ to: "/" })
    }
}
