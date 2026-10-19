import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import * as AuthService from "@/components/auth/authService"
import {
    confirmPasswordField,
    passwordField,
    passwordsMatch,
} from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import { Form } from "@/components/ui/Form"
import { LoadingButton } from "@/components/ui/LoadingButton"
import useCustomToast from "@/hooks/useCustomToast"

const formSchema = passwordsMatch(
    z.object({
        current_password: passwordField,
        new_password: passwordField,
        confirm_password: confirmPasswordField,
    }),
    "new_password",
    "confirm_password",
)

type FormData = z.infer<typeof formSchema>

const ChangePassword = () => {
    const { showSuccessToast, showApiError } = useCustomToast()
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onSubmit",
        criteriaMode: "all",
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    })

    const mutation = useMutation({
        mutationFn: AuthService.changePassword,
        onSuccess: () => {
            showSuccessToast("Password updated successfully")
            form.reset()
        },
        onError: showApiError,
    })

    return (
        <div className="max-w-md">
            <h3 className="text-lg font-semibold py-4">Change Password</h3>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((data) =>
                        mutation.mutate(data),
                    )}
                    className="flex flex-col gap-4"
                >
                    <TextFormField
                        control={form.control}
                        name="current_password"
                        label="Current Password"
                        placeholder="••••••••"
                        testId="current-password-input"
                        password
                    />
                    <TextFormField
                        control={form.control}
                        name="new_password"
                        label="New Password"
                        placeholder="••••••••"
                        testId="new-password-input"
                        password
                    />
                    <TextFormField
                        control={form.control}
                        name="confirm_password"
                        label="Confirm Password"
                        placeholder="••••••••"
                        testId="confirm-password-input"
                        password
                    />
                    <LoadingButton
                        type="submit"
                        loading={mutation.isPending}
                        className="self-start"
                    >
                        Update Password
                    </LoadingButton>
                </form>
            </Form>
        </div>
    )
}

export default ChangePassword
