import type { ReactElement, ReactNode } from "react"

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/Tooltip"

// A hover or focus hint on a single element. The content stays open while the
// pointer moves onto it, so links inside it can be clicked. Empty content shows
// nothing. A disabled child gets no pointer events, so wrap it in a <span>.
export function InfoTooltip({
    content,
    side = "top",
    delay = 100,
    children,
}: {
    content: ReactNode
    side?: "top" | "right" | "bottom" | "left"
    // Milliseconds of hover before it opens
    delay?: number
    children: ReactElement
}) {
    if (!content) return children
    return (
        <Tooltip delayDuration={delay}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side} className="max-w-xs">
                {content}
            </TooltipContent>
        </Tooltip>
    )
}
