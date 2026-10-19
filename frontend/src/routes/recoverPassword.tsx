import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthForm } from "@/components/auth/AuthForm"
import * as AuthService from "@/components/auth/authService"
import { emailField } from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import useCustomToast from "@/hooks/useCustomToast"

const formSchema = z.object({
    email: emailField,
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/recoverPassword")({
    component: RecoverPassword,
    beforeLoad: AuthService.redirectIfLoggedIn,
    head: () => ({
        meta: [
            {
                title: "Recover Password - Daptic",
            },
        ],
    }),
})

function RecoverPassword() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })
    const { showSuccessToast, showApiError } = useCustomToast()

    const mutation = useMutation({
        mutationFn: (data: FormData) => AuthService.recoverPassword(data.email),
        onSuccess: () => {
            showSuccessToast("Password recovery email sent successfully")
            form.reset()
        },
        onError: showApiError,
    })

    return (
        <AuthForm
            form={form}
            onSubmit={(data) => mutation.mutate(data)}
            title="Password Recovery"
            submitLabel="Continue"
            pending={mutation.isPending}
            footerPrompt="Remember your password?"
            footerLink={{ to: "/login", label: "Log in" }}
        >
            <TextFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="user@example.com"
                testId="email-input"
            />
        </AuthForm>
    )
}
