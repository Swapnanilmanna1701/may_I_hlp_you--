import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat Genai",
  description: "Introducing modern chatbot technology with Gemini AI.",
  openGraph: {
    images: [
      {
        url: "https://i.postimg.cc/NffF6Sm0/Gemini-scaled.webp",
        width: 1000,
        height: 600,
      },
    ],
  },
  icons: {
    icon: "./favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}