import { CircleOff } from "lucide-react"

import { InfoTooltip } from "@/components/common/InfoTooltip"
import { cn } from "@/lib/utils"

const SUPPORT_EMAIL = "support@daptic.ai"

// Marks a jurisdiction the license doesn't cover, and points to support
export function LockedIcon({ className }: { className?: string }) {
    return (
        <InfoTooltip
            content={
                <span>
                    Contact{" "}
                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="font-medium underline underline-offset-2"
                    >
                        Daptic
                    </a>{" "}
                    to add more jurisdictions to your license.
                </span>
            }
            side="top"
            delay={150}
        >
            <span
                role="img"
                aria-label={`Not enabled for your license. Contact Daptic to add more jurisdictions to your license.`}
                className={cn("flex shrink-0 items-center", className)}
            >
                <CircleOff className="size-3.5 text-muted-foreground" />
            </span>
        </InfoTooltip>
    )
}
