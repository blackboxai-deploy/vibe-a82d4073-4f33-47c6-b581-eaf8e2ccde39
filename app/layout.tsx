import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Todo",
  description: "A simple Next.js Todo list using localStorage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Todos</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <a href="https://nextjs.org" target="_blank" rel="noreferrer">
              Built with Next.js
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
