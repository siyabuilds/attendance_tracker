import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { readAdminSession } from "@/lib/auth";
import { NavBar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
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
  let isSuperuser = false;

  if (session) {
    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { isSuperuser: true },
    });
    isSuperuser = admin?.isSuperuser ?? false;
  }

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body
        className={`${poppins.className} min-h-full flex flex-col bg-background text-foreground`}
      >
        <NavBar email={session?.email} isSuperuser={isSuperuser} />
        {children}
      </body>
    </html>
  );
}
