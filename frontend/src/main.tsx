import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { client } from "./client/client.gen"
import { isAuthError } from "./components/auth/authService"
import { ThemeProvider } from "./components/ThemeProvider"
import { Toaster } from "./components/ui/Sonner"
import "./index.css"
import { clearAccessToken, getAccessToken } from "./lib/authToken"
import { routeTree } from "./routeTree.gen"

client.setConfig({
    baseURL: import.meta.env.VITE_API_URL ?? "",
    auth: () => getAccessToken() || "",
})

const handleApiError = (error: Error) => {
    if (isAuthError(error)) {
        clearAccessToken()
        window.location.href = "/login"
    }
}
const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: handleApiError,
    }),
    mutationCache: new MutationCache({
        onError: handleApiError,
    }),
})

const router = createRouter({ routeTree, context: { queryClient } })
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <Toaster richColors closeButton />
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
)
