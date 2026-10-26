import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import './garden/visitors.css'
import { Header } from '@/components/Header'
import { PwaManager } from '@/components/PwaManager'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Le Jardin des Devoirs',
  description: 'Une PWA qui transforme les additions du soir en collection de créatures féériques.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, title: 'Jardin Devoirs', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#8fd86a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="app-shell">
          <div className="container">
            <Header />
            {children}
            <PwaManager />
          </div>
        </div>
      </body>
    </html>
  )
}
