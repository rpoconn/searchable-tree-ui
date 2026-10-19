import { createFileRoute } from "@tanstack/react-router"

import * as AuthService from "@/components/auth/authService"
import { JurisdictionPage } from "@/components/jurisdictions/JurisdictionPage"

export const Route = createFileRoute("/_layout/companyAdmin")({
    component: () => (
        <JurisdictionPage
            mode="company"
            title="Admin View - changes licensing for a given company"
            description="Manage which jurisdictions this company operates in"
        />
    ),
    beforeLoad: () =>
        AuthService.requireRole(
            (user) => user.is_superuser || user.company_role === "admin",
        ),
    head: () => ({
        meta: [
            {
                title: "Company Admin - Daptic",
            },
        ],
    }),
})
