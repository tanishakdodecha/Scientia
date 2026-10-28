import type { Metadata } from "next";
import Link from "next/link";
import { SettingsPanel } from "@/components/Settings";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Scientia",
  description: "Reliable news written in plain, human English.",
};

const themeInit = `(function(){try{var d=document.documentElement;d.dataset.theme=localStorage.getItem("scientia:theme")||"paper";d.dataset.size=localStorage.getItem("scientia:size")||"m";d.dataset.font=localStorage.getItem("scientia:font")||"serif";d.dataset.width=localStorage.getItem("scientia:width")||"comfortable";}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />

        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark">
              <span className="logo">S</span>
              <span className="wordmark-text">Scientia</span>
            </Link>

            <form className="searchform" action={`${base}/search`} method="get">
              <input name="q" placeholder="Search" aria-label="Search" />
              <button type="submit" aria-label="Search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            </form>

            <nav className="top-nav">
              <Link href="/">Today</Link>
              <Link href="/learn">Learn</Link>
              <Link href="/saved">Saved</Link>
            </nav>

            <SettingsPanel />
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Scientia · Personal reading</span>
            <span>Compiled automatically</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
