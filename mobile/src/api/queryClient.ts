import { QueryClient } from '@tanstack/react-query';

/**
 * Single shared QueryClient. Server-state (aircraft lists, component
 * details, verification logs, etc. in later modules) goes through
 * react-query rather than ad hoc useState+useEffect fetching, so loading/
 * error/caching behavior is consistent across every screen.
 *
 * Retries are conservative: a failed request due to a real 4xx (bad
 * request, forbidden, not found) should surface immediately rather than
 * retry blindly — retry is really only useful for transient network
 * blips, which is what a small retry count with backoff approximates here.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
