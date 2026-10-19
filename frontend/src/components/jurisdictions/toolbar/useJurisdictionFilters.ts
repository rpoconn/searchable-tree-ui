import { useSuspenseQuery } from "@tanstack/react-query"
import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
} from "react"

import type { RegionType } from "@/client"
import * as Service from "@/components/jurisdictions/grid/jurisdictionGridService"
import type {
    JurisdictionFilters,
    JurisdictionMode,
    StatusFilter,
    TypeFilters,
} from "@/components/jurisdictions/jurisdictionTypes"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

const noFilters: JurisdictionFilters = {
    search: "",
    byType: {},
    status: "all",
}

const searchDelay = 300
const searchSettled = (prev: JurisdictionFilters, next: JurisdictionFilters) =>
    prev.search === next.search || next.search === ""

// The toolbar's filters, and the facets the server works out for them.
// `filters` is what the toolbar shows. `queried` is what the server filters by,
// so the current rows and counts stay up meanwhile: typing waits for a pause,
// everything else, clearing included, goes now.
// Kept across scope switches, so the same slice can be compared in both.
export function useJurisdictionFilters(mode: JurisdictionMode) {
    const [filters, setFilters] = useState<JurisdictionFilters>(noFilters)
    const queried = useDeferredValue(
        useDebouncedValue(filters, searchDelay, searchSettled),
    )
    const { data: facets } = useSuspenseQuery(
        Service.facetsQuery(mode, queried),
    )

    // Picks the server dropped, because a coarser facet no longer covers them,
    // leave the filters too, so they don't come back with the coarser pick
    useEffect(() => {
        const pruned = facets.by_type as TypeFilters
        if (Service.sameTypeFilters(pruned, queried.byType)) return
        setFilters((f) =>
            f.byType === queried.byType ? { ...f, byType: pruned } : f,
        )
    }, [facets, queried.byType])

    const toolbarFacets = useMemo(
        () => Service.liveFacets(facets.facets, filters.byType),
        [facets, filters.byType],
    )

    const setSearch = useCallback(
        (search: string) => setFilters((f) => ({ ...f, search })),
        [],
    )
    const setStatus = useCallback(
        (status: StatusFilter) => setFilters((f) => ({ ...f, status })),
        [],
    )
    const setFacet = useCallback(
        (type: RegionType, ids: string[]) =>
            setFilters((f) => ({ ...f, byType: { ...f.byType, [type]: ids } })),
        [],
    )
    const clear = useCallback(() => setFilters(noFilters), [])

    return {
        filters,
        queried,
        facets,
        toolbarFacets,
        setSearch,
        setStatus,
        setFacet,
        clear,
    }
}
