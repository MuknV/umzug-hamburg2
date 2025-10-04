"use client";
import { useEffect, useMemo, useState } from "react";
import { PriceCalculator } from "../components/PriceCalculator";
import { SlotsBoard } from "../components/SlotsBoard";
import { z } from "zod";

const BookingSchema = z.object({
  date: z.string(),
  slotId: z.string(),
  contact: z.string().min(5),
  details: z.string().min(5),
  km: z.coerce.number().min(0),
  floorsA: z.coerce.number().min(0),
  floorsB: z.coerce.number().min(0),
  consent: z.literal(true),
  token: z.string().optional()
});

export default function Page() {
  const [rangeStart, setRangeStart] = useState<string>(new Date().toISOString().slice(0,10));
  const [slotsByDay, setSlotsByDay] = useState<Record<string, any[]>>({});
  const [form, setForm] = useState<any>({ contact: "", details: "", km: 0, floorsA:0, floorsB:0, consent:false, slotId:"", date:"" });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<any | null>(null);

  async function fetchRange(start: string){
    const startDate = new Date(start);
    const to = new Date(startDate); to.setDate(to.getDate()+4);
    const toStr = to.toISOString().slice(0,10);
    const res = await fetch(`/api/slots?from=${start}&to=${toStr}`);
    const data = await res.json();
    setSlotsByDay(data.byDay || {});
  }
  useEffect(()=>{ fetchRange(rangeStart); },[rangeStart]);

  async function submit(e: any){
    e.preventDefault();
    setLoading(true);
    try{
      const token = await (window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "", {action:"submit"});
      const payload = {...form, token};
      BookingSchema.parse(payload);
      const res = await fetch("/api/book", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"Ошибка");
      setBooked(data);
      setForm({ contact:"", details:"", km:0, floorsA:0, floorsB:0, consent:false, slotId:"", date:"" });
    }catch(err:any){
      alert(err.message);
    }finally{ setLoading(false); }
  }

  const price = useMemo(()=>{
    const base=49; const perKm=1.2; const perFloor=10;
    const km = Number(form.km||0); const fA = Number(form.floorsA||0); const fB = Number(form.floorsB||0);
    return Math.round(Math.max(0, base + km*perKm + perFloor*(fA+fB)));
  },[form]);

  return (
    <main>
      <section className="container hero" style={{backgroundImage:"url('/peugeot-boxer.webp')", backgroundSize:"cover", backgroundPosition:"center", color:"white", borderRadius:16}}>
        <div className="overlay"></div>
        <div style={{position:"relative"}}>
          <span className="badge">Hamburg & Umland</span>
          <h1>Переезды и перевозки в Гамбурге и пригородах</h1>
          <p>Кастенваген + тентованный грузовик с гидробортом. Быстро, аккуратно, почасово/фикс.</p>
          <div className="cta-row">
            <a className="btn btn-primary" href={`tel:${process.env.NEXT_PUBLIC_CALL_E164}`}>Позвонить</a>
            <a className="btn btn-whatsapp" href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_E164 || "").replace(/\+/g, "")}?text=${encodeURIComponent("Hallo! Ich brauche einen Umzug in Hamburg.")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="btn btn-ghost" href="#termin">Онлайн‑запись</a>
          </div>
        </div>
      </section>

      <section className="container grid" aria-label="Features">
        <div className="kpis">
          <div className="kpi">🏠<div>Квартирные переезды</div></div>
          <div className="kpi">📦<div>Перевозка мебели/техники</div></div>
          <div className="kpi">🧼<div>Чистый фургон</div></div>
          <div className="kpi">🧾<div>Страховка/квитанция</div></div>
        </div>
        <div className="card">
          <h3>Чем помогаем</h3>
          <ul>
            <li>Переезды (частные и малый бизнес)</li>
            <li>Мебельные и мелкие перевозки</li>
            <li>Вывоз/утилизация — по договорённости</li>
          </ul>
        </div>
        <div className="card">
          <h3>Парк</h3>
          <ul>
            <li><strong>Кастенваген</strong>: объём ~12 м³, полезная нагрузка ~1,2 т</li>
            <li><strong>Тентованный LKW с гидробортом</strong>: тяжёлая мебель/техника, двор/рампа</li>
          </ul>
          <img src="/peugeot-boxer.webp" alt="Peugeot Boxer с тентом и гидробортом" width="100%" height="auto" loading="lazy" />
        </div>
        <div className="card">
          <h3>Зона работы</h3>
          <p>Hamburg + Umland. <em>Выезд в тот же день — если есть окно.</em></p>
          <iframe title="Сервисная зона" src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_SRC || process.env.GOOGLE_MAPS_EMBED_SRC || "https://maps.google.com"} width="100%" height="260" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div className="card">
          <h3>Как это работает</h3>
          <ol>
            <li>Звонок/WhatsApp</li>
            <li>Короткая оценка</li>
            <li>Приезжаем</li>
            <li>Аккуратная погрузка/доставка</li>
          </ol>
        </div>
        <div className="card">
          <h3>Цены</h3>
          <p>От XX € / час или фиксированные тарифы по маршрутам.</p>
          <PriceCalculator />
        </div>
      </section>

      <section className="container card" id="termin" aria-label="Онлайн‑запись">
        <h2>Выберите свободное время</h2>
        <SlotsBoard start={rangeStart} onNavigate={setRangeStart} data={slotsByDay} onPick={(d,slot)=>setForm({...form, date:d, slotId:slot.id})} />
        {form.date && form.slotId && (
          <div className="kpi" style={{marginTop:12}}>Вы выбрали: <strong>{form.date}</strong> — <strong>{(slotsByDay[form.date]||[]).find(s=>s.id===form.slotId)?.start}–{(slotsByDay[form.date]||[]).find(s=>s.id===form.slotId)?.end}</strong></div>
        )}
        <form onSubmit={submit} className="grid" style={{marginTop:12}}>
          <div>
            <div className="label">Контакт (Имя, адрес, телефон)</div>
            <input className="input" required placeholder="Иван Иванов, Musterweg 1, Hamburg, +49…" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})}/>
          </div>
          <div>
            <div className="label">Описание заказа</div>
            <textarea className="input" required placeholder="Что везём? Откуда–куда? Этаж/лифт? Нужны ремни/тележка?" value={form.details} onChange={e=>setForm({...form, details:e.target.value})}></textarea>
          </div>
          <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
            <div>
              <div className="label">Километраж (примерно)</div>
              <input className="input" type="number" min={0} value={form.km} onChange={e=>setForm({...form, km:e.target.value})} required />
            </div>
            <div>
              <div className="label">Этажей без лифта (адрес A)</div>
              <input className="input" type="number" min={0} value={form.floorsA} onChange={e=>setForm({...form, floorsA:e.target.value})} required />
            </div>
            <div>
              <div className="label">Этажей без лифта (адрес B)</div>
              <input className="input" type="number" min={0} value={form.floorsB} onChange={e=>setForm({...form, floorsB:e.target.value})} required />
            </div>
          </div>
          <div className="kpi">💶 <strong>Оценка суммы: {price} €</strong> <div className="small">необязательная оценка</div></div>
          <label style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" checked={form.consent} onChange={e=>setForm({...form, consent:e.target.checked})} required />
            <span>Согласие с <a href="/datenschutz" target="_blank">политикой конфиденциальности</a>.</span>
          </label>
          <button className="btn btn-primary" disabled={loading || !form.slotId}>{loading?"Отправка…":"Подтвердить термин"}</button>
        </form>
        {booked && (
          <div className="card" style={{marginTop:16}}>
            <h3>Термин забронирован!</h3>
            <p>Мы получили вашу заявку. Резюме отправлено на email.</p>
            <pre className="small">{JSON.stringify(booked, null, 2)}</pre>
          </div>
        )}
      </section>

      <footer className="container footer">
        <h3>Контакты</h3>
        <p>
          Тел.: <a href={`tel:${process.env.NEXT_PUBLIC_CALL_E164 || process.env.CALL_E164}`}>{process.env.NEXT_PUBLIC_CALL_E164 || process.env.CALL_E164}</a> · WhatsApp: <a href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_E164 || process.env.WHATSAPP_E164 || "+491701234567").replace(/\+/g,"")}`}>написать</a>
        </p>
        <p>Часы: Пн–Сб 8–20</p>
        <p>
          <a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a>
        </p>
      </footer>

      <script dangerouslySetInnerHTML={{__html:`window.NEXT_PUBLIC_RECAPTCHA_SITE_KEY='${process.env.RECAPTCHA_SITE_KEY}'`}} />
    </main>
  );
}
