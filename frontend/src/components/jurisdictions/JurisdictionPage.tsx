import { Suspense } from "react"

import { PageHeader } from "@/components/common/PageHeader"
import { JurisdictionGrid } from "@/components/jurisdictions/JurisdictionGrid"
import { JurisdictionGridSkeleton } from "@/components/jurisdictions/JurisdictionGridSkeleton"
import type { JurisdictionMode } from "@/components/jurisdictions/jurisdictionTypes"
import useAuth from "@/hooks/useAuth"

interface JurisdictionPageProps {
    mode: JurisdictionMode
    title: string
    description: string
}

// A page holding the grid, which waits on the current user before it can load
export function JurisdictionPage({
    mode,
    title,
    description,
}: JurisdictionPageProps) {
    const { user } = useAuth()

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title={title} description={description} />
            {user ? (
                <Suspense fallback={<JurisdictionGridSkeleton />}>
                    <JurisdictionGrid mode={mode} user={user} />
                </Suspense>
            ) : (
                <JurisdictionGridSkeleton />
            )}
        </div>
    )
}
