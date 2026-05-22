import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import NetworkHelper from '@/components/NetworkHelper'
import NotificationContainer from '@/components/Notification'
import Navbar from '@/components/Navbar'

// Initialize modern Plus Jakarta Sans font supporting Latin characters
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'VeloChain - Blockchain Supply Chain Management',
  description: 'Transparent and Secure Supply Chain Management System Powered by Blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col">
        <NetworkHelper />
        <NotificationContainer />
        {/* Global Web3 Navigation Bar */}
        <Navbar />
        {/* Main Content Container with standard centering and padding */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}


