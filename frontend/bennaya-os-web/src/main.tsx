import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'

// One cache for the whole app.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30s, so moving between pages does not
      // refetch everything immediately.
      staleTime: 30_000,
      // Retrying a 401 or a 404 is pointless and just delays the error.
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        if (status !== undefined && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </LanguageProvider>
  </StrictMode>,
)
