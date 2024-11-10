"use client"

import { usePathname } from 'next/navigation'
import Header from '../Header'
import { AppSidebar } from '../AppSidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideHeaderAndSidebar = pathname === '/login' || pathname === '/signup'

  return (
    <div className="flex h-screen overflow-hidden">
      {!hideHeaderAndSidebar && (
        <AppSidebar className="hidden md:flex border-r border-gray-200 dark:border-gray-700" />
      )}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        {!hideHeaderAndSidebar && <Header />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}