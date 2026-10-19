import { queryOptions } from "@tanstack/react-query"
import { redirect } from "@tanstack/react-router"

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

// Route guards for `beforeLoad`

export function requireLogin() {
    if (!isLoggedIn()) {
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
