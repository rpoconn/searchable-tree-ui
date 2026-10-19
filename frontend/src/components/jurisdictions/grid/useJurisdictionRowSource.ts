import type { AgGridReact } from "ag-grid-react"
import { type RefObject, useCallback, useEffect, useState } from "react"

import {
    type RowInputs,
    JurisdictionGridService as Service,
} from "@/components/jurisdictions/grid/JurisdictionGridService"
import {
    JurisdictionRowSource,
    type RowMapper,
} from "@/components/jurisdictions/grid/JurisdictionRowSource"
import type {
    JurisdictionFilters,
    JurisdictionRow,
} from "@/components/jurisdictions/jurisdictionTypes"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

// The grid's row source, kept in step with the filters and with what the row
// mapping reads. One source for the component's life, so expansion survives.
export function useJurisdictionRowSource(
    gridRef: RefObject<AgGridReact<JurisdictionRow> | null>,
    queried: JurisdictionFilters,
    { mode, company, user, canEditCompany, admins }: RowInputs,
) {
    const { showErrorToast } = useCustomToast()

    const toRow = useCallback<RowMapper>(
        (r, highlight) =>
            Service.toRow(
                r,
                { mode, company, user, canEditCompany, admins },
                highlight,
            ),
        [mode, company, user, canEditCompany, admins],
    )
    const [source] = useState(
        () =>
            new JurisdictionRowSource(mode, queried, toRow, (err) =>
                handleError.call(showErrorToast, err as Error),
            ),
    )

    // New filters reload the rows from the top
    useEffect(() => {
        if (!source.setQuery(mode, queried)) return
        const api = gridRef.current?.api
        if (!api) return
        if (api.getDisplayedRowCount() > 0) api.ensureIndexVisible(0, "top")
        api.purgeInfiniteCache()
    }, [gridRef, source, mode, queried])

    // Loaded rows are mapped again when what the mapping reads changes
    useEffect(() => {
        if (source.toRow === toRow) return
        source.toRow = toRow
        gridRef.current?.api.forEachNode((node) => {
            if (node.data) {
                node.setData(toRow(node.data.jurisdiction, node.data.highlight))
            }
        })
    }, [gridRef, source, toRow])

    // Refetches the loaded rows in place, keeping the scroll position
    const refresh = useCallback(
        () => gridRef.current?.api.refreshInfiniteCache(),
        [gridRef],
    )

    const toggleExpanded = useCallback(
        (id: string) => {
            if (source.toggleExpanded(id)) refresh()
        },
        [source, refresh],
    )
    const expandAll = useCallback(() => {
        source.expandAll()
        refresh()
    }, [source, refresh])
    const collapseAll = useCallback(() => {
        source.collapseAll()
        refresh()
    }, [source, refresh])

    return { source, refresh, toggleExpanded, expandAll, collapseAll }
}

export default useJurisdictionRowSource
