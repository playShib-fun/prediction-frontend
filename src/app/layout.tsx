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
  metadataBase: new URL("https://playshib.fun"),
  title: {
    default: "ShibPlay — Predict BONE price on Shibarium",
    template: "%s | ShibPlay",
  },
  description:
    "Play Shib on Shibarium: predict BONE price in 5‑minute rounds. Place bullish or bearish bets, view live odds and claim rewards.",
  applicationName: "ShibPlay",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    title: "ShibPlay — Predict BONE price on Shibarium",
    description:
      "Predict BONE price in 5‑minute rounds on Shibarium. Live odds, history, claims.",
    url: "/",
    siteName: "ShibPlay",
    images: [{ url: "/images/shibplay-logo.png", width: 512, height: 512 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShibPlay — Predict BONE price on Shibarium",
    description:
      "Predict BONE price in 5‑minute rounds on Shibarium. Live odds, history, claims.",
    images: ["/images/shibplay-logo.png"],
  },
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
