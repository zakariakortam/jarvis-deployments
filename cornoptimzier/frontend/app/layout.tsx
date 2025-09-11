import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Corn Optimizer - Acid Setpoint Optimization',
  description: 'Industrial optimization platform for corn dry thinning processes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}