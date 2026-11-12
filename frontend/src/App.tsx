// App Root Component — Router, React Query Provider, and Shell
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import ForecastPage from './pages/ForecastPage'
import PlanPage from './pages/PlanPage'
import ProofPage from './pages/ProofPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20">
      <span className="text-6xl font-extrabold font-sans text-gray-400 mb-2">404</span>
      <h1 className="text-xl font-bold text-gray-200 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-400 mb-5">The requested BreatheWise screen does not exist.</p>
      <a
        href="/"
        className="px-4 py-2 bg-[#2D6A5F] text-white rounded-lg text-xs font-semibold hover:bg-[#3E8E7E] transition-colors"
      >
        Return to Home
      </a>
    </main>
  )
}

export default function App() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en')

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Navbar language={language} onLanguageChange={setLanguage} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/plan" element={<PlanPage language={language} />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/proof" element={<ProofPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
