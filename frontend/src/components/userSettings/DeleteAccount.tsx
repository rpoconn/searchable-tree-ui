import { useMutation } from "@tanstack/react-query"

import { UsersService } from "@/client"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/Button"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"

const DeleteAccount = () => {
    const { showSuccessToast, showApiError } = useCustomToast()
    const { logout } = useAuth()

    // logout() clears the query cache, so there's nothing to invalidate
    const mutation = useMutation({
        mutationFn: () => UsersService.deleteUserMe(),
        onSuccess: () => {
            showSuccessToast("Your account has been successfully deleted")
            logout()
        },
        onError: showApiError,
    })

    return (
        <div className="max-w-md mt-4 rounded-lg border border-destructive/50 p-4">
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
            </p>
            <ConfirmDialog
                trigger={
                    <Button variant="destructive" className="mt-3">
                        Delete Account
                    </Button>
                }
                title="Confirmation Required"
                description={
                    <>
                        All your account data will be{" "}
                        <strong>permanently deleted.</strong> If you are sure,
                        please click <strong>"Delete"</strong> to proceed. This
                        action cannot be undone.
                    </>
                }
                confirmLabel="Delete"
                destructive
                pending={mutation.isPending}
                onConfirm={() => mutation.mutate()}
            />
        </div>
    )
}

export default DeleteAccount
