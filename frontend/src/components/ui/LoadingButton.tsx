import { Loader2 } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/Button"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

function LoadingButton({
  loading = false,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </Button>
  )
}

export { LoadingButton }
