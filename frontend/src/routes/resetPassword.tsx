import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthForm } from "@/components/auth/AuthForm"
import * as AuthService from "@/components/auth/authService"
import {
    confirmPasswordField,
    passwordField,
    passwordsMatch,
} from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import useCustomToast from "@/hooks/useCustomToast"

const searchSchema = z.object({
    token: z.string().catch(""),
})

const formSchema = passwordsMatch(
    z.object({
        new_password: passwordField,
        confirm_password: confirmPasswordField,
    }),
    "new_password",
    "confirm_password",
)

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/resetPassword")({
    component: ResetPassword,
    validateSearch: searchSchema,
    beforeLoad: ({ search }) => {
        AuthService.redirectIfLoggedIn()
        if (!search.token) {
            throw redirect({ to: "/login" })
        }
    },
    head: () => ({
        meta: [
            {
                title: "Reset Password - Daptic",
            },
        ],
    }),
})

function ResetPassword() {
    const { token } = Route.useSearch()
    const { showSuccessToast, showApiError } = useCustomToast()
    const navigate = useNavigate()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            new_password: "",
            confirm_password: "",
        },
    })

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            AuthService.resetPassword(token, data.new_password),
        onSuccess: () => {
            showSuccessToast("Password updated successfully")
            form.reset()
            navigate({ to: "/login" })
        },
        onError: showApiError,
    })

    return (
        <AuthForm
            form={form}
            onSubmit={(data) => mutation.mutate(data)}
            title="Reset Password"
            submitLabel="Reset Password"
            pending={mutation.isPending}
            footerPrompt="Remember your password?"
            footerLink={{ to: "/login", label: "Log in" }}
        >
            <TextFormField
                control={form.control}
                name="new_password"
                label="New Password"
                placeholder="New Password"
                testId="new-password-input"
                password
            />
            <TextFormField
                control={form.control}
                name="confirm_password"
                label="Confirm Password"
                placeholder="Confirm Password"
                testId="confirm-password-input"
                password
            />
        </AuthForm>
    )
}
