import { Button } from "@/components/ui/Button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { LoadingButton } from "@/components/ui/LoadingButton"

interface ConfirmDialogProps {
    // Opens the dialog on click; omit to open it only through `open`
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title: string
    description: React.ReactNode
    confirmLabel?: string
    destructive?: boolean
    pending?: boolean
    onConfirm: () => void
}

export function ConfirmDialog({
    trigger,
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    destructive,
    pending,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={pending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <LoadingButton
                        variant={destructive ? "destructive" : "default"}
                        loading={pending}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
