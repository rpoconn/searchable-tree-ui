import { Skeleton } from "@/components/ui/Skeleton"

const rows = ["a", "b", "c", "d", "e", "f", "g", "h"]

export function JurisdictionGridSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {rows.map((key) => (
                <Skeleton key={key} className="h-8 w-full" />
            ))}
        </div>
    )
}
