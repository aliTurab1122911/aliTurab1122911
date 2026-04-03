import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/ui/LogoutButton";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Titan+One&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="container">
          <header className="topnav">
            <strong>CSV Team Board</strong>
            <nav>
              {user ? (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/projects">Projects</Link>
                  <Link href="/calendar">Calendar</Link>
                  <Link href="/profile">Profile</Link>
                </>
              ) : (
                <Link href="/login">Login</Link>
              )}
            </nav>
            <div>{user ? <LogoutButton /> : <small className="muted">Guest</small>}</div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
