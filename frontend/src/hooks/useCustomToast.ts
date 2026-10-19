import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/apiErrors"

const useCustomToast = () => {
    const showSuccessToast = (description: string) => {
        toast.success("Success!", {
            description,
        })
    }

    const showErrorToast = (description: string) => {
        toast.error("Something went wrong!", {
            description,
        })
    }

    const showApiError = (err: unknown) => {
        showErrorToast(getApiErrorMessage(err))
    }

    return { showSuccessToast, showErrorToast, showApiError }
}

export default useCustomToast
