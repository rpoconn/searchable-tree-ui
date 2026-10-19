import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import * as AuthService from "@/components/auth/authService"
import useCustomToast from "./useCustomToast"

const useAuth = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { showApiError } = useCustomToast()

    const { data: user } = useQuery(AuthService.currentUserQuery())

    const signUpMutation = useMutation({
        mutationFn: AuthService.register,
        onSuccess: () => {
            navigate({ to: "/login" })
        },
        onError: showApiError,
    })

    const loginMutation = useMutation({
        mutationFn: AuthService.login,
        onSuccess: () => {
            navigate({ to: "/" })
        },
        onError: showApiError,
    })

    const logout = async () => {
        await AuthService.logout()
        // Drop cached data so the next user doesn't see the previous user's
        queryClient.clear()
        navigate({ to: "/login" })
    }

    return {
        signUpMutation,
        loginMutation,
        logout,
        user,
    }
}

export default useAuth
