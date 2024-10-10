import { Inter } from 'next/font/google'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ui/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Publisher Database',
  description: 'Manage your publisher database with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background min-h-screen`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <div className="flex flex-col overflow-x-auto">
            <Header />
            <main className="flex-1 p-6 w-full">
              <div className="max-w-full">
                {children}
              </div>
              <Toaster />
            </main>
          </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}