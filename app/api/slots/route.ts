import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
const db = new Database("./data.db");
db.exec(`CREATE TABLE IF NOT EXISTS slots(id TEXT PRIMARY KEY, date TEXT, start TEXT, end TEXT, capacity INTEGER DEFAULT 1, booked INTEGER DEFAULT 0, disabled INTEGER DEFAULT 0);`);

function toRange(from?: string|null, to?: string|null){
  if(from && to) return {from, to};
  const d = from || new Date().toISOString().slice(0,10);
  const s = new Date(d); const e = new Date(s); e.setDate(e.getDate()+4);
  return { from: s.toISOString().slice(0,10), to: e.toISOString().slice(0,10) };
}

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if(date){
    const rows = db.prepare("SELECT * FROM slots WHERE date = ? AND disabled = 0 AND booked < capacity ORDER BY start").all(date);
    return NextResponse.json({ available: rows });
  }
  const r = toRange(from, to);
  const rows = db.prepare("SELECT * FROM slots WHERE date >= ? AND date <= ? AND disabled = 0 AND booked < capacity ORDER BY date, start").all(r.from, r.to);
  const byDay: Record<string, any[]> = {};
  for(const s of rows){ (byDay[s.date] ||= []).push(s); }
  return NextResponse.json({ byDay });
}

export async function POST(req: NextRequest){
  const key = req.headers.get("x-admin-key");
  if(key !== process.env.ADMIN_KEY) return NextResponse.json({error:"unauthorized"},{status:401});
  const body = await req.json();
  if(body.disable?.length){
    const stmt = db.prepare("UPDATE slots SET disabled=1 WHERE id=?");
    for(const id of body.disable) stmt.run(id);
  }
  if(body.blocks?.length){
    const ins = db.prepare("INSERT OR IGNORE INTO slots(id,date,start,end,capacity,booked,disabled) VALUES(@id,@date,@start,@end,@capacity,0,0)");
    for(const s of body.blocks) ins.run(s);
  }
  return NextResponse.json({ok:true});
}
