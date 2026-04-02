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
