import "./globals.css";

export const metadata = {
  title: "Cloud Print — Sistem Layanan Percetakan Online",
  description: "Platform pemesanan dan manajemen percetakan online berbasis Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
