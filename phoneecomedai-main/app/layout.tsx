import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { DrEchoProvider } from '@/components/ai-assistant/dr-echo-context';
import { DrEchoButton, DrEchoStyles } from '@/components/ai-assistant/dr-echo-button';
import { Toaster as SonnerToaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EchoMed - AI-Powered Healthcare',
  description: 'Transform your smartphone into a powerful diagnostic tool with EchoMed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DrEchoProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <DrEchoButton />
            <DrEchoStyles />
            <Toaster />
            <SonnerToaster position="top-right" closeButton theme="dark" richColors />
          </DrEchoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}