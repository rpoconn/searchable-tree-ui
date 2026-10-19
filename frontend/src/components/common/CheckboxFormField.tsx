import type { Control, FieldPath, FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/Checkbox"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/Form"

interface CheckboxFormFieldProps<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
}

export function CheckboxFormField<T extends FieldValues>({
    control,
    name,
    label,
}: CheckboxFormFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="font-normal">{label}</FormLabel>
                </FormItem>
            )}
        />
    )
}
