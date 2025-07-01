import {ClerkProvider} from "@clerk/nextjs";
import type {Metadata} from "next";
import {Geist, Geist_Mono, Inter} from "next/font/google";
import {cn} from "@/lib/utils";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {Toaster} from "sonner";

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
      <html lang="en">
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            "antialiased flex flex-col min-h-screen relative overflow-x-hidden bg-white"
          )}
        >
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors theme="light" />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}