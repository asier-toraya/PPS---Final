import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenantDesk Min",
  description: "MVP minimo de service desk multi-tenant seguro"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
