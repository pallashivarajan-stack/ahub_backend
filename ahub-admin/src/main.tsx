import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Always refetch when a component mounts to ensure fresh data after login
      refetchOnMount: true,
      // Don't refetch on window focus - prevents aggressive re-fetching
      refetchOnWindowFocus: false,
      // Reconnect should refetch to handle internet reconnection scenarios
      refetchOnReconnect: true,
      // Data is considered fresh for 5 minutes (increased from 30s for stability)
      staleTime: 5 * 60 * 1000,
      // Retry once on failure before showing error
      retry: 1,
      // Retry after 2 seconds
      retryDelay: 2000,
    },
  },
})

// Expose queryClient globally so LoginPage can clear cache on login
export { queryClient }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  </StrictMode>,
)
