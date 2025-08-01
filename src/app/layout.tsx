import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // import font
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WarpBackground } from "@/components/magicui/warp-background";
import Header from "@/components/shibplay/header";
import Footer from "@/components/shibplay/footer";
import FullParticles from "@/components/shibplay/full-particles";
import Providers from "./providers";
import { headers } from "next/headers";
import { Tutorial } from "@/components/shibplay/tutorial";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Play Shib",
  description: "Play Shib",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers cookie={cookie}>
            <section className="max-w-lg mx-auto min-h-screen flex flex-col justify-between items-center">
              <Header />
              {children}
              <Footer />
            </section>
            <Tutorial />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
