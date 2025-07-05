import {ClerkProvider} from "@clerk/nextjs";
import {Geist, Geist_Mono} from "next/font/google";
import {cn} from "@/lib/utils";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {Toaster} from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            "antialiased flex flex-col min-h-screen relative overflow-x-hidden"
          )}
        >
          <ThemeProvider
            defaultTheme="system"
            storageKey="ui-theme"
          >
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster position="top-right" richColors />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}