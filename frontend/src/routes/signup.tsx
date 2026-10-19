import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthForm } from "@/components/auth/AuthForm"
import * as AuthService from "@/components/auth/authService"
import {
    confirmPasswordField,
    emailField,
    passwordField,
    passwordsMatch,
} from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import useAuth from "@/hooks/useAuth"

const formSchema = passwordsMatch(
    z.object({
        email: emailField,
        full_name: z.string().min(1, { message: "Full Name is required" }),
        password: passwordField,
        confirm_password: confirmPasswordField,
    }),
    "password",
    "confirm_password",
)

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/signup")({
    component: SignUp,
    beforeLoad: AuthService.redirectIfLoggedIn,
    head: () => ({
        meta: [
            {
                title: "Sign Up - Daptic",
            },
        ],
    }),
})

function SignUp() {
    const { signUpMutation } = useAuth()
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            email: "",
            full_name: "",
            password: "",
            confirm_password: "",
        },
    })

    const onSubmit = ({ confirm_password: _, ...data }: FormData) => {
        signUpMutation.mutate(data)
    }

    return (
        <AuthForm
            form={form}
            onSubmit={onSubmit}
            title="Create an account"
            submitLabel="Sign Up"
            pending={signUpMutation.isPending}
            footerPrompt="Already have an account?"
            footerLink={{ to: "/login", label: "Log in" }}
        >
            <TextFormField
                control={form.control}
                name="full_name"
                label="Full Name"
                placeholder="User"
                testId="full-name-input"
            />
            <TextFormField
                control={form.control}
                name="email"
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
