import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans"; // import font
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/shibplay/header";
import Footer from "@/components/shibplay/footer";
import Providers from "./providers";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Play Shib",
  description: "Play Shib",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");

  return (
    // add font to className, also add antialiased and dark mode
    <html
      lang="en"
      className={`${GeistSans.className} antialiased dark:bg-gray-950`}
      suppressHydrationWarning
    >
      <body className="bg-gray-100 dark:bg-gray-950 relative">
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js');
  });
}
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers cookie={cookie}>
            <Header />
            <section className="max-w-lg mx-auto min-h-screen flex flex-col justify-between items-center pt-16">
              {children}
              <Footer />
            </section>
            {/* <Tutorial /> */}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
