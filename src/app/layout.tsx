import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Lexend } from "next/font/google";

  const lexend = Lexend({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lexend",
  });

export const metadata: Metadata = {
  title: "Mr. Nobody",
  description: "A Narrative-Based Story Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} font-lexend antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          // forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
