import type { AgGridReact } from "ag-grid-react"
import { type RefObject, useCallback, useRef, useState } from "react"

import { JurisdictionGridService as Service } from "@/components/jurisdictions/grid/JurisdictionGridService"
import type {
    JurisdictionMode,
    JurisdictionRow,
} from "@/components/jurisdictions/jurisdictionTypes"
import type { PendingDisable } from "@/components/jurisdictions/selection/ConfirmDisableDialog"
import { useSelectionMutation } from "@/components/jurisdictions/selection/useSelectionMutation"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

// The item is kept after closing so the dialog text doesn't blank out while
// animating away
type DisableDialog = { open: boolean; item: PendingDisable | null }

// Turning rows on and off from the grid. Turning company opt-ins off asks first
// when users would lose them.
export function useSelectionEditor(
    gridRef: RefObject<AgGridReact<JurisdictionRow> | null>,
    mode: JurisdictionMode,
    companyId: string,
    // Runs once a save settles, to refresh what it changed in the grid
    onSaved: () => void,
) {
    const { showErrorToast } = useCustomToast()
    const [disableDialog, setDisableDialog] = useState<DisableDialog>({
        open: false,
        item: null,
    })

    const mutation = useSelectionMutation(
        mode,
        companyId,
        onSaved,
        // The license moved on while the dialog was open: review it again
        ({ rootId, enabled, subtree }) => apply(rootId, enabled, subtree),
    )

    // Saves a row, or the row and everything under it. A single row's switch
    // flips right away; the refresh after saving settles the rest. A version
    // only commits if the license is still at it.
    const save = (
        rootId: string,
        enabled: boolean,
        subtree: boolean,
        version?: number,
    ) => {
        const node = gridRef.current?.api.getRowNode(rootId)
        if (!subtree && node?.data) {
            node.setData({ ...node.data, checked: enabled })
        }
        mutation.mutate({ rootId, enabled, subtree, version })
    }

    // The grid may keep the first context it is given, so the handlers handed
    // to it never change and read live state through this ref
    const latest = useRef({ mode, companyId, save, showErrorToast })
    latest.current = { mode, companyId, save, showErrorToast }

    const apply = useCallback(
        async (rowId: string, enabled: boolean, subtree: boolean) => {
            const { mode, companyId, save, showErrorToast } = latest.current
            if (mode === "company" && !enabled) {
                // Fetch fresh: someone may have opted in since the page loaded
                const preview = await Service.previewDisable(
                    companyId,
                    rowId,
                    subtree,
                ).catch((err: Error) => {
                    handleError.call(showErrorToast, err)
                    return null
                })
                if (!preview) return
                if (preview.users.length > 0) {
                    const name =
                        gridRef.current?.api.getRowNode(rowId)?.data
                            ?.jurisdiction.name ?? ""
                    setDisableDialog({
                        open: true,
                        item: { rootId: rowId, subtree, name, ...preview },
                    })
                    return
                }
            }
            save(rowId, enabled, subtree)
        },
        [gridRef],
    )

    const toggleEnabled = useCallback(
        (id: string, enabled: boolean) => apply(id, enabled, false),
        [apply],
    )
    const toggleSubtree = useCallback(
        (id: string, enabled: boolean) => apply(id, enabled, true),
        [apply],
    )

    const cancelDisable = () => setDisableDialog((d) => ({ ...d, open: false }))
    const confirmDisable = (item: PendingDisable) => {
        cancelDisable()
        save(item.rootId, false, item.subtree, item.version)
    }

    return {
        toggleEnabled,
        toggleSubtree,
        disableDialog,
        cancelDisable,
        confirmDisable,
    }
}
