import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Le Jardin des Devoirs',
  description: 'Une PWA qui transforme les additions du soir en collection de créatures féériques.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Jardin Devoirs', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#8fd86a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="app-shell">
          <div className="container">
            <Header />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
