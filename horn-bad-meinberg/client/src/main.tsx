import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always refetch
      cacheTime: 0, // Don't cache
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Extract tenant from URL query parameter
const getTenantSlug = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('tenant') || 'hornbadmeinberg'; // Default to schieder
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Read tenant from URL on EVERY request
        const params = new URLSearchParams(window.location.search);
        const tenant = params.get('tenant') || 'hornbadmeinberg';
        console.log('[tRPC] Sending request with tenant:', tenant);
        return {
          'X-Tenant': tenant,
        };
      },
      fetch(input, init) {
        // Also add tenant as query parameter to the URL
        const params = new URLSearchParams(window.location.search);
        const tenant = params.get('tenant') || 'hornbadmeinberg';
        
        let url = input as string;
        if (url.includes('?')) {
          url += `&tenant=${tenant}`;
        } else {
          url += `?tenant=${tenant}`;
        }
        
        return globalThis.fetch(url, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
