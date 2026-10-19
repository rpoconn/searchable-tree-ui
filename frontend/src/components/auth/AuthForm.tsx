import { type LinkProps, Link as RouterLink } from "@tanstack/react-router"
import type { FieldValues, UseFormReturn } from "react-hook-form"

import { AuthLayout } from "@/components/common/AuthLayout"
import { Form } from "@/components/ui/Form"
import { LoadingButton } from "@/components/ui/LoadingButton"

interface AuthFormProps<T extends FieldValues> {
    form: UseFormReturn<T>
    onSubmit: (data: T) => void
    title: string
    submitLabel: string
    pending: boolean
    // The line under the form, e.g. "Already have an account? Log in"
    footerPrompt: string
    footerLink: { to: LinkProps["to"]; label: string }
    children: React.ReactNode
}

// The page shell shared by the login, sign-up and password routes
export function AuthForm<T extends FieldValues>({
    form,
    onSubmit,
    title,
    submitLabel,
    pending,
    footerPrompt,
    footerLink,
    children,
}: AuthFormProps<T>) {
    return (
        <AuthLayout>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) => {
                        if (!pending) onSubmit(data)
                    })}
                    className="flex flex-col gap-6"
                >
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">{title}</h1>
                    </div>

                    <div className="grid gap-4">
                        {children}
                        <LoadingButton
                            type="submit"
                            className="w-full"
                            loading={pending}
                        >
                            {submitLabel}
                        </LoadingButton>
                    </div>

                    <div className="text-center text-sm">
                        {footerPrompt}{" "}
                        <RouterLink
                            to={footerLink.to}
                            className="underline underline-offset-4"
                        >
                            {footerLink.label}
                        </RouterLink>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    )
}
