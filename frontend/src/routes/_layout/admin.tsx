import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense } from "react"

import { UserDialog } from "@/components/admin/UserDialog"
import * as UserAdminService from "@/components/admin/userAdminService"
import { type UserTableData, userColumns } from "@/components/admin/userColumns"
import * as AuthService from "@/components/auth/authService"
import { DataTable } from "@/components/common/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import PendingUsers from "@/components/pending/PendingUsers"
import { Button } from "@/components/ui/Button"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/admin")({
    component: Admin,
    beforeLoad: () => AuthService.requireRole((user) => !!user.is_superuser),
    head: () => ({
        meta: [
            {
                title: "Admin - Daptic",
            },
        ],
    }),
})

function UsersTableContent() {
    const { user: currentUser } = useAuth()
    const { data: users } = useSuspenseQuery(UserAdminService.usersQuery())

    const tableData: UserTableData[] = users.data.map((user) => ({
        ...user,
        isCurrentUser: currentUser?.id === user.id,
    }))

    return <DataTable columns={userColumns} data={tableData} />
}

function Admin() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Users"
                description="Manage user accounts and permissions"
                actions={
                    <UserDialog
                        trigger={
                            <Button className="my-4">
                                <Plus className="mr-2" />
                                Add User
                            </Button>
                        }
                    />
                }
            />
            <Suspense fallback={<PendingUsers />}>
                <UsersTableContent />
            </Suspense>
        </div>
    )
}
