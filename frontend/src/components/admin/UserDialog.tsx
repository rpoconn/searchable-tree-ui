import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { UserPublic } from "@/client"
import * as UserAdminService from "@/components/admin/userAdminService"
import { CheckboxFormField } from "@/components/common/CheckboxFormField"
import {
    confirmPasswordField,
    emailField,
    passwordField,
    passwordsMatch,
} from "@/components/common/formSchemas"
import { TextFormField } from "@/components/common/TextFormField"
import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { Form } from "@/components/ui/Form"
import { LoadingButton } from "@/components/ui/LoadingButton"
import useCustomToast from "@/hooks/useCustomToast"

// Editing leaves the password alone unless a new one is typed
const userSchema = (passwordRequired: boolean) =>
    passwordsMatch(
        z.object({
            email: emailField,
            full_name: z.string().optional(),
            password: passwordRequired
                ? passwordField
                : z.string().refine((p) => p === "" || p.length >= 8, {
                      message: "Password must be at least 8 characters",
                  }),
            confirm_password: passwordRequired
                ? confirmPasswordField
                : z.string(),
            is_superuser: z.boolean(),
            is_active: z.boolean(),
        }),
        "password",
        "confirm_password",
    )

const addSchema = userSchema(true)
const editSchema = userSchema(false)

type FormData = z.infer<typeof addSchema>

interface UserDialogProps {
    // The user to edit; omit to add a new one
    user?: UserPublic
    // Opens the dialog on click
    trigger: React.ReactNode
    onSuccess?: () => void
}

export function UserDialog({ user, trigger, onSuccess }: UserDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showApiError } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(user ? editSchema : addSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            email: user?.email ?? "",
            full_name: user?.full_name ?? "",
            password: "",
            confirm_password: "",
            is_superuser: user?.is_superuser ?? false,
            is_active: user?.is_active ?? false,
        },
    })

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            user
                ? UserAdminService.updateUser(user.id, data)
                : UserAdminService.createUser(data),
        onSuccess: () => {
            showSuccessToast(
                user
                    ? "User updated successfully"
                    : "User created successfully",
            )
            if (!user) form.reset()
            setIsOpen(false)
            onSuccess?.()
        },
        onError: showApiError,
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: UserAdminService.keys.users,
            })
        },
    })

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
                    <DialogDescription>
                        {user
                            ? "Update the user details below."
                            : "Fill in the form below to add a new user to the system."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) =>
                            mutation.mutate(data),
                        )}
                    >
                        <div className="grid gap-4 py-4">
                            <TextFormField
                                control={form.control}
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Email"
                                required
                            />
                            <TextFormField
                                control={form.control}
                                name="full_name"
                                label="Full Name"
                                placeholder="Full name"
                            />
                            <TextFormField
                                control={form.control}
                                name="password"
                                label="Set Password"
                                type="password"
                                placeholder="Password"
                                required={!user}
                            />
                            <TextFormField
                                control={form.control}
                                name="confirm_password"
                                label="Confirm Password"
                                type="password"
                                placeholder="Password"
                                required={!user}
                            />
                            <CheckboxFormField
                                control={form.control}
                                name="is_superuser"
                                label="Is superuser?"
                            />
                            <CheckboxFormField
                                control={form.control}
                                name="is_active"
                                label="Is active?"
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    disabled={mutation.isPending}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton
                                type="submit"
                                loading={mutation.isPending}
                            >
                                Save
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
