import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import type { UserPublic } from "@/client"
import { UserDialog } from "@/components/admin/UserDialog"
import * as UserAdminService from "@/components/admin/userAdminService"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"

interface UserActionsMenuProps {
    user: UserPublic
}

export const UserActionsMenu = ({ user }: UserActionsMenuProps) => {
    const [open, setOpen] = useState(false)
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const { user: currentUser } = useAuth()
    const queryClient = useQueryClient()
    const { showSuccessToast, showApiError } = useCustomToast()

    const deleteMutation = useMutation({
        mutationFn: () => UserAdminService.deleteUser(user.id),
        onSuccess: () => {
            showSuccessToast("The user was deleted successfully")
            setConfirmingDelete(false)
            setOpen(false)
        },
        onError: showApiError,
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: UserAdminService.keys.users,
            })
        },
    })

    if (user.id === currentUser?.id) {
        return null
    }

    // Menu items keep the menu open (preventDefault) so their dialogs can mount
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <UserDialog
                    user={user}
                    onSuccess={() => setOpen(false)}
                    trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil />
                            Edit User
                        </DropdownMenuItem>
                    }
                />
                <ConfirmDialog
                    open={confirmingDelete}
                    onOpenChange={setConfirmingDelete}
                    trigger={
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={(e) => e.preventDefault()}
                        >
                            <Trash2 />
                            Delete User
                        </DropdownMenuItem>
                    }
                    title="Delete User"
                    description={
                        <>
                            All items associated with this user will also be{" "}
                            <strong>permanently deleted.</strong> Are you sure?
                            You will not be able to undo this action.
                        </>
                    }
                    confirmLabel="Delete"
                    destructive
                    pending={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate()}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
