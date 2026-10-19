import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { AuthForm } from "@/components/auth/AuthForm"
import * as AuthService from "@/components/auth/authService"
import { emailField, passwordField } from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import useAuth from "@/hooks/useAuth"

const formSchema = z.object({
    username: emailField,
    password: passwordField,
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
    component: Login,
    beforeLoad: AuthService.redirectIfLoggedIn,
    head: () => ({
        meta: [
            {
                title: "Log In - Daptic",
            },
        ],
    }),
})

function Login() {
    const { loginMutation } = useAuth()
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            username: "",
            password: "",
        },
    })

    return (
        <AuthForm
            form={form}
            onSubmit={(data) => loginMutation.mutate(data)}
            title="Login to your account"
            submitLabel="Log In"
            pending={loginMutation.isPending}
            footerPrompt="Don't have an account yet?"
            footerLink={{ to: "/signup", label: "Sign up" }}
        >
            <TextFormField
                control={form.control}
                name="username"
                label="Email"
                type="email"
                placeholder="user@example.com"
                testId="email-input"
            />
            <TextFormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Password"
                testId="password-input"
                password
                labelExtra={
                    <RouterLink
                        to="/recoverPassword"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                        Forgot your password?
                    </RouterLink>
                }
            />
        </AuthForm>
    )
}
