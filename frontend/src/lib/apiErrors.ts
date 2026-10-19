import { AxiosError } from "axios"

// The API's `detail` when it sent one, else the transport error
export function getApiErrorMessage(err: unknown): string {
    if (err instanceof AxiosError) {
        const detail = (err.response?.data as any)?.detail
        if (typeof detail === "string") {
            return detail
        }
        return err.message
    }
    return "Something went wrong."
}
