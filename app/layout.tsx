import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KnowYourLineage - Family Tree Builder',
  description: 'A beautiful, modern family tree application built with Next.js and Supabase',
  keywords: ['family tree', 'genealogy', 'ancestry', 'family history'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}