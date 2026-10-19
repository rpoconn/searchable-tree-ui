import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import type { AgGridReact } from "ag-grid-react"
import { useMemo, useRef, useState } from "react"

import type { UserPublic } from "@/client"
import { JurisdictionTable } from "@/components/jurisdictions/grid/JurisdictionTable"
import * as Service from "@/components/jurisdictions/grid/jurisdictionGridService"
import { useJurisdictionRowSource } from "@/components/jurisdictions/grid/useJurisdictionRowSource"
import type {
    JurisdictionGridContext,
    JurisdictionMode,
    JurisdictionRow,
} from "@/components/jurisdictions/jurisdictionTypes"
import { NoMatches } from "@/components/jurisdictions/NoMatches"
import { ScopeBanner } from "@/components/jurisdictions/ScopeBanner"
import { ConfirmDisableDialog } from "@/components/jurisdictions/selection/ConfirmDisableDialog"
import { SelectionSheet } from "@/components/jurisdictions/selection/SelectionSheet"
import { selectionEntriesFor } from "@/components/jurisdictions/selection/selectionSummary"
import { useSelectionEditor } from "@/components/jurisdictions/selection/useSelectionEditor"
import { JurisdictionToolbar } from "@/components/jurisdictions/toolbar/JurisdictionToolbar"
import { useJurisdictionFilters } from "@/components/jurisdictions/toolbar/useJurisdictionFilters"

// The jurisdiction picker for one scope: the company's license, or a user's
// own picks within it
export function JurisdictionGrid({
    mode,
    user,
}: {
    mode: JurisdictionMode
    user: UserPublic
}) {
    const companyId = user.company_id
    const canEditCompany = user.is_superuser || user.company_role === "admin"
    const gridRef = useRef<AgGridReact<JurisdictionRow>>(null)
    const [selectionOpen, setSelectionOpen] = useState(false)

    const {
        filters,
        queried,
        facets,
        toolbarFacets,
        setSearch,
        setStatus,
        setFacet,
        clear,
    } = useJurisdictionFilters(mode)

    const { data: company } = useSuspenseQuery(Service.companyQuery(companyId))
    const {
        data: { jurisdiction_ids: companyIds },
    } = useSuspenseQuery(Service.companyIdsQuery(companyId))
    const {
        data: { jurisdiction_ids: myIds },
    } = useSuspenseQuery(Service.myIdsQuery())
    // Members only; locked rows offer to email them
    const { data: admins } = useQuery({
        ...Service.adminsQuery(companyId),
        enabled: mode === "user" && !canEditCompany,
    })
    // The sheet needs the whole tree; loaded only once it's opened
    const { data: tree } = useQuery({
        ...Service.treeQuery(),
        enabled: selectionOpen,
    })

    const rows = useJurisdictionRowSource(gridRef, queried, {
        mode,
        company,
        user,
        canEditCompany,
        admins,
    })
    // Ancestors' select-all counts and user counts change too, so refresh after saving
    const editor = useSelectionEditor(gridRef, mode, companyId, rows.refresh)

    const { toggleExpanded } = rows
    const { toggleEnabled, toggleSubtree } = editor
    const context = useMemo<JurisdictionGridContext>(
        () => ({ toggleExpanded, toggleEnabled, toggleSubtree }),
        [toggleExpanded, toggleEnabled, toggleSubtree],
    )

    const enabledIds = mode === "company" ? companyIds : myIds
    const selectionEntries = useMemo(
        () => tree && selectionEntriesFor(tree, mode, enabledIds, companyIds),
        [tree, mode, enabledIds, companyIds],
    )

    return (
        <div className="flex flex-col gap-4">
            <ScopeBanner
                mode={mode}
                canEditCompany={canEditCompany}
                lockedCount={facets.summary.locked ?? 0}
            />
            <JurisdictionToolbar
                mode={mode}
                search={filters.search}
                onSearchChange={setSearch}
                status={filters.status}
                counts={facets.status_counts}
                onStatusChange={setStatus}
                facets={toolbarFacets}
                onFacetChange={setFacet}
                filtering={Service.hasFilters(filters)}
                onClear={clear}
                onExpandAll={rows.expandAll}
                onCollapseAll={rows.collapseAll}
                onViewSelection={() => setSelectionOpen(true)}
            />
            <div className="relative overflow-hidden rounded-md">
                <JurisdictionTable
                    gridRef={gridRef}
                    datasource={rows.source}
                    mode={mode}
                    showUserCounts={mode === "company" && canEditCompany}
                    context={context}
                />
                {/* Ancestors only show above a match, so no matches means no rows */}
                {Service.hasFilters(queried) && facets.summary.shown === 0 && (
                    <NoMatches
                        allTaken={Service.allLicensedTaken(
                            queried,
                            companyIds.length,
                        )}
                        onClear={clear}
                    />
                )}
            </div>
            <SelectionSheet
                open={selectionOpen}
                onOpenChange={setSelectionOpen}
                mode={mode}
                entries={selectionEntries}
                count={enabledIds.length}
            />
            <ConfirmDisableDialog
                open={editor.disableDialog.open}
                pending={editor.disableDialog.item}
                companyName={company.name}
                onCancel={editor.cancelDisable}
                onConfirm={editor.confirmDisable}
            />
        </div>
    )
}
