// API access, cache keys and row mapping for the jurisdiction grid
import { queryOptions } from "@tanstack/react-query"

import {
    type JurisdictionFilters as ApiFilters,
    CompaniesService,
    type CompanyAdmin,
    type JurisdictionFacet,
    type JurisdictionGridRow,
    type JurisdictionRowsQuery,
    JurisdictionsService,
    type SelectionChange,
    type UserPublic,
    UsersService,
    ViewsService,
} from "@/client"
import { flagUrlForKeys } from "@/components/jurisdictions/flags"
import type {
    JurisdictionFilters,
    JurisdictionMode,
    JurisdictionRow,
    JurisdictionSort,
    RowInputs,
    TypeFilters,
    Unlock,
} from "@/components/jurisdictions/jurisdictionTypes"

const pickedTypes = (byType: TypeFilters) =>
    Object.entries(byType).filter(([, ids]) => ids?.length)

export const defaultSort: JurisdictionSort = {
    sort_by: "name",
    sort_dir: "asc",
}

export const keys = {
    tree: ["jurisdictions", "tree"],
    facets: ["jurisdictions", "facets"],
    facetsFor: (mode: JurisdictionMode, filters: JurisdictionFilters) => [
        "jurisdictions",
        "facets",
        mode,
        filters,
    ],
    company: (companyId: string) => ["company", companyId],
    companyIds: (companyId: string) => ["companyJurisdictions", companyId],
    myIds: ["myJurisdictions"],
    admins: (companyId: string) => ["companyAdmins", companyId],
}

// Whether any filter is set; the server does the filtering itself
export function hasFilters({ search, byType, status }: JurisdictionFilters) {
    return (
        search.trim() !== "" ||
        pickedTypes(byType).length > 0 ||
        status !== "all"
    )
}

export function sameTypeFilters(a: TypeFilters, b: TypeFilters) {
    const key = (t: TypeFilters) => JSON.stringify(pickedTypes(t).sort())
    return key(a) === key(b)
}

// The facets with the live picks, so the toolbar doesn't wait on the server;
// drops any pick no longer among a facet's options
export function liveFacets(
    facets: JurisdictionFacet[],
    byType: TypeFilters,
): JurisdictionFacet[] {
    return facets.map((f) => ({
        ...f,
        value: (byType[f.type] ?? []).filter((id) =>
            f.options.some((o) => o.id === id),
        ),
    }))
}

// An empty Available tab under no other filter: every licensed row is on
export function allLicensedTaken(
    filters: JurisdictionFilters,
    licensedCount: number,
) {
    return (
        filters.status === "available" &&
        licensedCount > 0 &&
        !hasFilters({ ...filters, status: "all" })
    )
}

export function toApiFilters(filters: JurisdictionFilters): ApiFilters {
    return {
        search: filters.search,
        by_type: filters.byType,
        status: filters.status,
    }
}

// Every jurisdiction; only the selection sheet still needs the whole tree
export function treeQuery() {
    return queryOptions({
        queryKey: keys.tree,
        queryFn: async () =>
            (await JurisdictionsService.readJurisdictionTree()).data.data,
    })
}

// Filter options, status tab counts and row totals
export function facetsQuery(
    mode: JurisdictionMode,
    filters: JurisdictionFilters,
) {
    return queryOptions({
        queryKey: keys.facetsFor(mode, filters),
        queryFn: async () =>
            (
                await ViewsService.readJurisdictionFacets({
                    body: {
                        scope: mode,
                        filters: toApiFilters(filters),
                    },
                })
            ).data,
    })
}

export async function fetchRows(body: JurisdictionRowsQuery) {
    return (await ViewsService.readJurisdictionRows({ body })).data
}

export function companyQuery(companyId: string) {
    return queryOptions({
        queryKey: keys.company(companyId),
        queryFn: async () =>
            (
                await CompaniesService.readCompany({
                    path: { company_id: companyId },
                })
            ).data,
    })
}

// The company's opt-ins and the version they're at
export function companyIdsQuery(companyId: string) {
    return queryOptions({
        queryKey: keys.companyIds(companyId),
        queryFn: async () =>
            (
                await CompaniesService.readCompanyJurisdictions({
                    path: { company_id: companyId },
                })
            ).data,
    })
}

export function myIdsQuery() {
    return queryOptions({
        queryKey: keys.myIds,
        queryFn: async () => (await UsersService.readMyJurisdictions()).data,
    })
}

export function adminsQuery(companyId: string) {
    return queryOptions({
        queryKey: keys.admins(companyId),
        queryFn: async () =>
            (
                await CompaniesService.readCompanyAdmins({
                    path: { company_id: companyId },
                })
            ).data.data,
    })
}

// Turns a jurisdiction on or off, or with subtree, it and everything selectable
// under it. With a version, the save only lands if nothing changed since then
// (412 otherwise).
export function saveSelection(
    mode: JurisdictionMode,
    companyId: string,
    rootId: string,
    enabled: boolean,
    subtree: boolean,
    version?: number,
) {
    const body = changeFor(rootId, enabled, subtree)
    const headers =
        version === undefined ? undefined : { "If-Match": String(version) }
    return mode === "company"
        ? CompaniesService.patchCompanyJurisdictions({
              path: { company_id: companyId },
              body,
              headers,
          })
        : UsersService.patchMyJurisdictions({ body, headers })
}

// Who would lose an opt-in if the company dropped the row (or its subtree),
// and the version to commit exactly that against; always fresh
export async function previewDisable(
    companyId: string,
    rootId: string,
    subtree: boolean,
) {
    const { data } = await CompaniesService.previewCompanyJurisdictions({
        path: { company_id: companyId },
        body: changeFor(rootId, false, subtree),
    })
    return { version: data.version, users: data.affected_users.data }
}

function changeFor(
    rootId: string,
    enabled: boolean,
    subtree: boolean,
): SelectionChange {
    if (subtree) {
        return enabled
            ? { add_subtrees: [rootId] }
            : { remove_subtrees: [rootId] }
    }
    return enabled ? { add: [rootId] } : { remove: [rootId] }
}

// Asks the company's admins to turn a jurisdiction on, linking to where they'd do it
export function requestUnlock(
    admins: CompanyAdmin[],
    jurisdiction: string,
    company: string,
    user: UserPublic,
): Unlock | undefined {
    if (admins.length === 0) return undefined
    const to = admins
        .map((a) => encodeURIComponent(a.email).replace("%40", "@"))
        .join(",")
    const subject = `Please enable ${jurisdiction} for ${company}`
    const body = [
        "Hi,",
        "",
        `Could you turn on ${jurisdiction} for ${company}? It has to be enabled company-wide before I can select it.`,
        "",
        `You can turn it on here: ${window.location.origin}/companyAdmin`,
        "",
        "Thanks,",
        user.full_name || user.email,
    ].join("\n")
    const [only] = admins
    return {
        kind: "email",
        href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        label:
            admins.length === 1
                ? `Email ${only.full_name || only.email} to request it`
                : "Email your company admins to request it",
    }
}

// A server row as the grid shows it in this scope
export function toRow(
    r: JurisdictionGridRow,
    { mode, company, user, canEditCompany, admins }: RowInputs,
    highlight?: string,
): JurisdictionRow {
    const base = {
        jurisdiction: r,
        mode,
        depth: r.display_depth,
        flagUrl: flagUrlForKeys(r.flag_keys),
        expanded: r.expanded,
        hasChildren: r.has_children,
        checked: r.enabled,
        highlight,
        subtree: r.subtree ?? undefined,
    }
    if (mode === "company") {
        return {
            ...base,
            disabled: !canEditCompany,
            disabledReason: canEditCompany
                ? undefined
                : "Only company admins can change this",
            locked: false,
            userCount: r.user_count ?? undefined,
        }
    }
    // A grouping is locked when nothing under it can be enabled
    const locked = r.locked || (!!r.is_structural && r.subtree?.total === 0)
    return {
        ...base,
        disabled: !r.licensed,
        disabledReason: r.licensed
            ? undefined
            : "Not enabled for your license.",
        locked,
        unlock: !locked
            ? undefined
            : canEditCompany
              ? { kind: "company" }
              : requestUnlock(admins ?? [], r.name, company.name, user),
    }
}
