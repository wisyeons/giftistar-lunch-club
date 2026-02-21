import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "기프티스타 런치 클럽",
  description: "선결제 식사 쿠폰 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 flex justify-center min-h-screen text-slate-900`}>
        {/* Mobile View Wrapper */}
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl overflow-x-hidden relative flex flex-col border-x border-slate-200">
          {children}
        </div>
      </body>
    </html>
  );
}
