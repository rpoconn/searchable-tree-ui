import { z } from "zod"

export const emailField = z.email({ message: "Invalid email address" })

export const passwordField = z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })

export const confirmPasswordField = z
    .string()
    .min(1, { message: "Password confirmation is required" })

// Flags `confirm` when it differs from `password`; empty and missing count as equal
export function passwordsMatch<T extends z.ZodObject>(
    schema: T,
    password: keyof z.output<T> & string,
    confirm: keyof z.output<T> & string,
) {
    return schema.refine(
        (data) => (data[password] || "") === (data[confirm] || ""),
        { message: "The passwords don't match", path: [confirm] },
    )
}
