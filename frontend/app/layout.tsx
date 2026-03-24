import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/components/language-provider'
import { ReactScan } from '@/components/react-scan'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: 'Langoer',
  description: 'Nền tảng học tập tiếng Anh với công nghệ AI cho học sinh trung học',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/browser-tab/langoer-favicon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/browser-tab/langoer-favicon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/browser-tab/langoer-favicon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/browser-tab/lingify-favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnamPro.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ReactScan />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
            <Toaster position="top-right" />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
