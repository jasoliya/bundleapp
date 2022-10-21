import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "react-query";

export function QueryProvider({ children }) {
    const client = new QueryClient({
        queryCache: new QueryCache(),
        mutationCache: new MutationCache()
    });

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}