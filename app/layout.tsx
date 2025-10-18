import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/components/common/LoadingProvider";
import { Footer } from "@/components/common/Footer";
import { GlobalModalHost } from "@/components/common/GlobalModalHost";
import { ModalProvider } from "./context/ModalContext";
import { AppToaster } from "@/components/ui/toaster";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { CartRealtimeBridge } from "@/components/common/CartRealtimeBridge";
import { ReactQueryProvider } from "@/lib/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepXwear",
  description: "DeepXwear is a e-commerce platform for T-shirts",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {" "}
        <ReactQueryProvider>
          <LoadingProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <CartProvider>
                  <ModalProvider>
                    <AppToaster />
                    <GlobalModalHost />
                    {/* Mount realtime bridge to keep CartContext in sync with backend */}
                    <CartRealtimeBridge />
                    <div>
                      <Header />
                      <main className="min-h-screen flex flex-col pb-[12rem]">
                        {children}
                      </main>
                      <Footer />
                    </div>
                  </ModalProvider>
                </CartProvider>
              </ThemeProvider>
            </AuthProvider>
          </LoadingProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
