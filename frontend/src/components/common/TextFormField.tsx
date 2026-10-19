import type { Control, FieldPath, FieldValues } from "react-hook-form"

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/Form"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"

interface TextFormFieldProps<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
    type?: React.HTMLInputTypeAttribute
    placeholder?: string
    // Marks the label with an asterisk and the input as required
    required?: boolean
    testId?: string
    // Renders a PasswordInput with a show/hide toggle
    password?: boolean
    // Shown at the end of the label row, e.g. a "Forgot your password?" link
    labelExtra?: React.ReactNode
}

export function TextFormField<T extends FieldValues>({
    control,
    name,
    label,
    type = "text",
    placeholder,
    required,
    testId,
    password,
    labelExtra,
}: TextFormFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center">
                        <FormLabel>
                            {label}
                            {required && (
                                <>
                                    {" "}
                                    <span className="text-destructive">*</span>
                                </>
                            )}
                        </FormLabel>
                        {labelExtra}
                    </div>
                    <FormControl>
                        {password ? (
                            <PasswordInput
                                data-testid={testId}
                                placeholder={placeholder}
                                required={required}
                                {...field}
                            />
                        ) : (
                            <Input
                                data-testid={testId}
                                placeholder={placeholder}
                                type={type}
                                required={required}
                                {...field}
                            />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
