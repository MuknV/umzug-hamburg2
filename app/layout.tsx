import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Переезды и перевозки в Гамбурге | Гидроборт, фикс/час",
  description:
    "Квартирные переезды и грузоперевозки в Гамбурге и пригородах. Кастенваген + тентованный грузовик с гидробортом. Быстро, аккуратно, по фикс-цене/час. Звонок, WhatsApp, онлайн-термин.",
  alternates: { canonical: "https://example.de/" },
  keywords: [
    "Переезд Гамбург",
    "Мебельный транспорт Гамбург",
    "Грузовик с гидробортом",
    "Квартирный переезд"
  ],
  openGraph: {
    title: "Переезды и перевозки — Гамбург и пригороды",
    description:
      "Кастенваген + LKW с гидробортом. Быстро, аккуратно. Онлайн-запись.",
    locale: "ru_RU",
    type: "website",
    url: "https://example.de/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="container" style={{display:"flex",gap:12,alignItems:"center",justifyContent:"space-between",paddingTop:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="/logo.svg" alt="Логотип" width={40} height={40} />
            <strong>Переезды Гамбург</strong>
          </div>
          <nav style={{display:"flex",gap:12,alignItems:"center"}}>
            <a className="btn btn-ghost" href="#termin">Онлайн‑запись</a>
            <a className="btn btn-primary" href={`tel:${process.env.CALL_E164 || "+49401234567"}`}>Позвонить</a>
            <a className="btn btn-whatsapp" href={`https://wa.me/${(process.env.WHATSAPP_E164||"+491701234567").replace(/\+/g,"")}?text=${encodeURIComponent("Hallo! Ich brauche einen Umzug in Hamburg.")}`}>Написать в WhatsApp</a>
          </nav>
        </header>
        {children}
        <div className="sticky-cta">
          <div className="container">
            <div className="cta-row">
              <a className="btn btn-primary btn-block" href={`tel:${process.env.CALL_E164 || "+49401234567"}`}>Позвонить</a>
              <a className="btn btn-whatsapp btn-block" href={`https://wa.me/${(process.env.WHATSAPP_E164||"+491701234567").replace(/\+/g,"")}?text=${encodeURIComponent("Hallo! Ich brauche einen Umzug in Hamburg.")}`}>WhatsApp</a>
              <a className="btn btn-ghost btn-block" href="#termin">Термин</a>
            </div>
          </div>
        </div>
        <script defer src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}></script>
      </body>
    </html>
  );
}
