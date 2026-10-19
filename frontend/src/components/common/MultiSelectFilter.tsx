import { Check, ChevronDown, X } from "lucide-react"
import { useRef, useState } from "react"

import { InfoTooltip } from "@/components/common/InfoTooltip"
import { Badge } from "@/components/ui/Badge"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/Command"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
    id: string
    label: string
    // Dimmed text after the label, e.g. the parent it belongs to
    context?: string | null
}

// Case- and accent-insensitive, so "sao" finds "São Paulo"
const fold = (text: string) =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()

// A field that shows the picks; clicking anywhere on it opens a panel with
// the search box on top, so the chips never compete with the input for room
export function MultiSelectFilter<T extends MultiSelectOption>({
    label,
    options,
    value,
    getIconUrl,
    onChange,
}: {
    label: string
    options: T[]
    // Ids of the picked options
    value: string[]
    // Small image before each option's label, such as a flag
    getIconUrl?: (option: T) => string | undefined
    onChange: (ids: string[]) => void
}) {
    const anchorRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const picked = options.filter((o) => value.includes(o.id))
    const first = picked[0]
    const firstIcon = first && getIconUrl?.(first)
    const matches = search
        ? options.filter((o) => fold(o.label).includes(fold(search)))
        : options
    const name = label.toLowerCase()
    const openPanel = (next: boolean) => {
        // Each opening starts a fresh search
        if (next) setSearch("")
        setOpen(next)
    }
    const toggle = (id: string) =>
        onChange(
            value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
        )

    return (
        <Popover open={open} onOpenChange={openPanel}>
            <PopoverAnchor asChild>
                {/* Not a <button>: the chips inside have their own remove buttons */}
                {/* biome-ignore lint/a11y/useSemanticElements: see above */}
                <div
                    ref={anchorRef}
                    role="button"
                    tabIndex={0}
                    aria-label={`${label} filter`}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    data-open={open}
                    className={cn(
                        "flex h-10 w-full min-w-0 cursor-pointer items-center gap-1 rounded-md border border-input bg-transparent pr-1.5 pl-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] select-none sm:w-72 dark:bg-input/30",
                        "hover:border-ring/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        "data-[open=true]:border-ring data-[open=true]:ring-[3px] data-[open=true]:ring-ring/50",
                    )}
                    onClick={() => openPanel(!open)}
                    onKeyDown={(e) => {
                        // Keys on the remove buttons inside are theirs
                        if (e.target !== e.currentTarget) return
                        if (
                            e.key === "Enter" ||
                            e.key === " " ||
                            e.key === "ArrowDown"
                        ) {
                            e.preventDefault()
                            openPanel(true)
                        }
                    }}
                >
                    <span className="shrink-0 pr-1 text-muted-foreground">
                        {label}
                    </span>
                    {first ? (
                        <Badge
                            variant="secondary"
                            className="h-6 min-w-0 max-w-40 shrink gap-1 rounded-sm border-border pr-1 pl-1.5"
                        >
                            {firstIcon && (
                                <img
                                    src={firstIcon}
                                    alt=""
                                    className="h-[11px] w-4 shrink-0 rounded-[2px] object-cover"
                                />
                            )}
                            <span className="truncate">{first.label}</span>
                            <button
                                type="button"
                                aria-label={`Remove ${first.label}`}
                                className="shrink-0 rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground"
                                onClick={(e) => {
                                    // Removing a pick shouldn't also toggle the panel
                                    e.stopPropagation()
                                    onChange(
                                        value.filter((id) => id !== first.id),
                                    )
                                }}
                            >
                                <X className="size-3.5" />
                            </button>
                        </Badge>
                    ) : (
                        // No pick means no filter: show that as a value, not a hint
                        <Badge
                            variant="secondary"
                            className="h-6 rounded-sm border-border px-1.5"
                        >
                            Any
                        </Badge>
                    )}
                    {picked.length > 1 && (
                        <InfoTooltip
                            content={picked
                                .slice(1)
                                .map((o) => o.label)
                                .join(", ")}
                            side="bottom"
                        >
                            <Badge
                                variant="secondary"
                                className="h-6 rounded-sm border-border px-1.5"
                            >
                                +{picked.length - 1}
                            </Badge>
                        </InfoTooltip>
                    )}
                    <span className="ml-auto flex shrink-0 items-center">
                        {picked.length > 0 && (
                            <button
                                type="button"
                                aria-label={`Clear ${name}`}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onChange([])
                                }}
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        <ChevronDown
                            className={cn(
                                "m-1 size-4 text-muted-foreground transition-transform",
                                open && "rotate-180",
                            )}
                        />
                    </span>
                </div>
            </PopoverAnchor>
            <PopoverContent
                align="start"
                sideOffset={6}
                className="w-80 overflow-hidden rounded-lg p-0 shadow-lg"
                // Clicks on the field toggle it themselves
                onInteractOutside={(e) => {
                    if (anchorRef.current?.contains(e.target as Node)) {
                        e.preventDefault()
                    }
                }}
                onCloseAutoFocus={(e) => {
                    e.preventDefault()
                    anchorRef.current?.focus()
                }}
            >
                <Command shouldFilter={false} label={`Search ${name}`}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={`Search ${name}`}
                    />
                    <CommandList className="max-h-80 p-1">
                        <CommandEmpty className="py-5 text-center text-sm text-muted-foreground">
                            No {name} matches
                        </CommandEmpty>
                        {matches.map((o) => {
                            const selected = value.includes(o.id)
                            const icon = getIconUrl?.(o)
                            return (
                                <CommandItem
                                    key={o.id}
                                    value={o.id}
                                    aria-checked={selected}
                                    className="min-h-[34px] gap-2.5"
                                    onSelect={() => toggle(o.id)}
                                >
                                    {icon ? (
                                        <img
                                            src={icon}
                                            alt=""
                                            className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_var(--border)]"
                                        />
                                    ) : (
                                        <span className="w-5 shrink-0" />
                                    )}
                                    <span className="truncate">{o.label}</span>
                                    {o.context && (
                                        <span className="truncate text-xs text-muted-foreground">
                                            {o.context}
                                        </span>
                                    )}
                                    <Check
                                        className={cn(
                                            "ml-auto size-4 shrink-0 text-primary",
                                            !selected && "invisible",
                                        )}
                                    />
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
