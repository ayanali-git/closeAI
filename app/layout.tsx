import './globals.css';
import 'katex/dist/katex.min.css';
import 'goey-toast/styles.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { ToasterProvider } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { SubscriptionProvider } from '@/components/subscription-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'CloseAI | Research & More',
  description: 'AI assistant for research, coding, writing, and creating.',
  keywords: 'AI assistant, artificial intelligence, chat, productivity, generative AI',
  authors: [{ name: 'CloseAI' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/closeai-app-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'CloseAI',
    description: 'AI assistant for research, coding, writing, and creating.',
    url: 'https://closeai.com',
    siteName: 'CloseAI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloseAI',
    description: 'AI assistant for research, coding, writing, and creating.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const initialPlan = cookieStore.get('user_plan')?.value || 'free';
  const initialHasAuth = cookieStore.getAll().some(
    (c) =>
      !c.name.includes('code-verifier') &&
      !c.name.includes('csrf') &&
      !c.name.includes('state') &&
      (c.name === AUTH_COOKIE_NAME ||
        c.name.startsWith(`${AUTH_COOKIE_NAME}.`) ||
        (c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))) &&
      c.value &&
      c.value.length > 30 &&
      c.value !== 'deleted'
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={150}>
            <AuthProvider initialHasAuth={initialHasAuth}>
              <SubscriptionProvider initialPlan={initialPlan}>
                {children}
                <ToasterProvider />
              </SubscriptionProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
