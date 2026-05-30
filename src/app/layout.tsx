import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/components/layout/language-context";
import { cookies } from "next/headers";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Innoversity LMS",
  description: "An AI-powered learning environment for adaptive and project-based capability building.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "de") as "de" | "en";

  return (
    <html lang={lang}>
      <body className={`${archivo.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}>
        <LanguageProvider initialLanguage={lang}>
          {children}
        </LanguageProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
