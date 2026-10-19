import { createFileRoute } from "@tanstack/react-router"

import { JurisdictionPage } from "@/components/jurisdictions/JurisdictionPage"

export const Route = createFileRoute("/_layout/jurisdictions")({
    component: () => (
        <JurisdictionPage
            mode="user"
            title="Jurisdictions"
            description="Choose the jurisdictions you personally manage"
        />
    ),
    head: () => ({
        meta: [
            {
                title: "Jurisdictions - Daptic",
            },
        ],
    }),
})
