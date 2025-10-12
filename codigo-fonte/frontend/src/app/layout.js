import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { validateSession } from "@/lib/serverAuth"; 
import "./globals.css";

// configuração das fontes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadados da página
export const metadata = {
  title: "GranaLivre",
  description: "Sua plataforma de finanças pessoais de código aberto.",
};


export default async function RootLayout({ children }) {

  const initialUser = await validateSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}