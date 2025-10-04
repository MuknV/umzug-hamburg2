export default function Schema(){
  const ld = {
    "@context":"https://schema.org",
    "@type":"LocalBusiness",
    name:"Переезды и перевозки — Гамбург",
    areaServed:["Hamburg","Umland"],
    telephone: process.env.CALL_E164,
    url: "https://example.de/",
    address: {"@type":"PostalAddress", addressLocality:"Hamburg", addressCountry:"DE"},
    sameAs: []
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld)}}/>;
}
