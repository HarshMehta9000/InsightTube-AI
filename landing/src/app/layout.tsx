import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InsightTube AI — Semantic Search & Intelligence over YouTube",
  description:
    "Turn YouTube videos into a queryable vector knowledge base. Ingest video, extract transcripts, embed them, and ask natural-language questions with grounded, source-cited answers.",
  keywords: [
    "InsightTube",
    "RAG",
    "semantic search",
    "vector search",
    "LangChain",
    "ChromaDB",
    "YouTube analytics",
  ],
  openGraph: {
    title: "InsightTube AI",
    description:
      "Semantic search and AI analysis over YouTube — video → transcript → vector → grounded answers.",
    type: "website",
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
