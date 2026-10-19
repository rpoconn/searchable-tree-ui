import { Check } from "lucide-react"

import { Switch } from "@/components/ui/Switch"

// A white knob that shows a check when on, over a track in the app's colors
export function ToggleSwitch({
    checked,
    disabled,
    label,
    onChange,
}: {
    checked: boolean
    disabled?: boolean
    label: string
    onChange: (checked: boolean) => void
}) {
    return (
        <Switch
            checked={checked}
            disabled={disabled}
            aria-label={label}
            onCheckedChange={onChange}
            // No pointer events when disabled, so a wrapper can carry a tooltip
            className="disabled:pointer-events-none disabled:opacity-45 data-[state=unchecked]:bg-muted-foreground/45 dark:data-[state=unchecked]:bg-muted-foreground/45"
            thumbClassName="bg-white text-primary shadow-sm ring-1 ring-black/10 dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-white"
            thumbContent={
                checked && <Check className="size-3" strokeWidth={3.5} />
            }
        />
    )
}
