import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { JurisdictionGridService as Service } from "@/components/jurisdictions/grid/JurisdictionGridService"
import type { JurisdictionMode } from "@/components/jurisdictions/jurisdictionTypes"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

export type SubtreeChange = {
    rootId: string
    enabled: boolean
    // Whether the click was on the row's select-all button
    subtree: boolean
    // The previewed version a confirmed change commits against; plain toggles
    // send none
    version?: number
}

// Turns a jurisdiction, or it and everything selectable under it, on or off in
// this scope, then refetches what the change affects.
// A change made against a version that has since moved on goes to onConflict.
export function useSelectionMutation(
    mode: JurisdictionMode,
    companyId: string,
    onSettled: () => void,
    onConflict: (change: SubtreeChange) => void,
) {
    const queryClient = useQueryClient()
    const { showErrorToast } = useCustomToast()

    return useMutation({
        mutationFn: ({ rootId, enabled, subtree, version }: SubtreeChange) =>
            Service.saveSelection(
                mode,
                companyId,
                rootId,
                enabled,
                subtree,
                version,
            ),
        onError: (err, change) => {
            if (err instanceof AxiosError && err.response?.status === 412) {
                showErrorToast(
                    "The license changed while you were reviewing. Showing the latest.",
                )
                onConflict(change)
                return
            }
            handleError.call(showErrorToast, err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: Service.keys.facets })
            queryClient.invalidateQueries({
                queryKey: Service.keys.companyIds(companyId),
            })
            // Dropping a company opt-in also drops it for every user in the company
            queryClient.invalidateQueries({ queryKey: Service.keys.myIds })
            onSettled()
        },
    })
}

export default useSelectionMutation
