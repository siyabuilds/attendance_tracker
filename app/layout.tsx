import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { readAdminSession } from "@/lib/auth";
import { NavBar } from "@/components/navbar";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Attendance Tracker Admin",
  description: "Admin dashboard and authentication for the attendance tracker.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body
        className={`${poppins.className} min-h-full flex flex-col bg-background text-foreground`}
      >
        <NavBar email={session?.email} />
        {children}
      </body>
    </html>
  );
}
