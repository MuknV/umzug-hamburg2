import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";

const db2 = new Database("./data.db");
db2.exec(`CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY, slotId TEXT, date TEXT, contact TEXT, details TEXT, km INTEGER, floorsA INTEGER, floorsB INTEGER, price INTEGER, email TEXT, createdAt TEXT);`);

async function verifyRecaptcha(token?: string){
  if(!process.env.RECAPTCHA_SECRET) return true;
  if(!token) return false;
  try{
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify",{method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: new URLSearchParams({secret: process.env.RECAPTCHA_SECRET, response: token})});
    const j = await r.json();
    return !!j.success && j.score >= 0.5;
  }catch{ return false; }
}

export async function POST(req: NextRequest){
  const body = await req.json();
  const ok = await verifyRecaptcha(body.token);
  if(!ok) return NextResponse.json({error:"Подозрение на спам"},{status:400});

  const slot = db2.prepare("SELECT * FROM slots WHERE id=? AND disabled=0").get(body.slotId);
  if(!slot || slot.booked >= slot.capacity){
    return NextResponse.json({error:"Слот недоступен"},{status:400});
  }
  const price = Math.round(49 + Number(body.km||0)*1.2 + 10*(Number(body.floorsA||0)+Number(body.floorsB||0)));
  const id = crypto.randomUUID();
  db2.prepare("INSERT INTO bookings (id, slotId, date, contact, details, km, floorsA, floorsB, price, email, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .run(id, body.slotId, body.date, body.contact, body.details, body.km, body.floorsA, body.floorsB, price, body.email||"", new Date().toISOString());
  db2.prepare("UPDATE slots SET booked = booked + 1 WHERE id=?").run(body.slotId);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT||587), secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }
  });
  const summary = `Новая бронь\nДата: ${body.date} ${slot.start}-${slot.end}\nКонтакт: ${body.contact}\nДетали: ${body.details}\nКм: ${body.km}\nЭтажи A/B: ${body.floorsA}/${body.floorsB}\nСумма (оценка): ${price} €`;
  await transporter.sendMail({ from:"no-reply@example.de", to: process.env.OWNER_EMAIL!, subject:"Новая бронь (переезд)", text: summary });
  if(body.email){ await transporter.sendMail({ from:"no-reply@example.de", to: body.email, subject:"Термин подтверждён (предварительно)", text: summary }); }

  return NextResponse.json({ id, price, slot, date: body.date });
}
