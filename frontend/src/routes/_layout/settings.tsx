import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/common/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import ChangePassword from "@/components/userSettings/ChangePassword"
import DeleteAccount from "@/components/userSettings/DeleteAccount"
import UserInformation from "@/components/userSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

const tabsConfig = [
    { value: "my-profile", title: "My profile", component: UserInformation },
    { value: "password", title: "Password", component: ChangePassword },
    { value: "danger-zone", title: "Danger zone", component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
    component: UserSettings,
    head: () => ({
        meta: [
            {
                title: "Settings - Daptic",
            },
        ],
    }),
})

function UserSettings() {
    const { user: currentUser } = useAuth()
    if (!currentUser) {
        return null
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="User Settings"
                description="Manage your account settings and preferences"
            />

            <Tabs defaultValue="my-profile">
                <TabsList>
                    {tabsConfig.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabsConfig.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <tab.component />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
