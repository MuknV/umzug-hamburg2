"use client";
import { useMemo } from "react";

function fmtDateISO(d: Date){ return d.toISOString().slice(0,10); }
function addDays(iso: string, n: number){ const d=new Date(iso); d.setDate(d.getDate()+n); return fmtDateISO(d); }

export function SlotsBoard({ start, onNavigate, data, onPick }:{ start:string; onNavigate:(s:string)=>void; data:Record<string, any[]>; onPick:(date:string, slot:any)=>void; }){
  const days = useMemo(()=>{ const arr:string[]=[]; for(let i=0;i<5;i++) arr.push(addDays(start,i)); return arr; },[start]);
  const weekday = (iso:string)=> new Date(iso).toLocaleDateString("ru-RU", { weekday:"short" });
  const daynum = (iso:string)=> new Date(iso).toLocaleDateString("ru-RU", { day:"2-digit", month:"short" });
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <button className="btn btn-ghost" onClick={()=>onNavigate(addDays(start,-5))}>←</button>
        <div style={{opacity:.7}}>Выберите день и время</div>
        <button className="btn btn-ghost" onClick={()=>onNavigate(addDays(start,5))}>→</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {days.map(d=> (
          <div key={d} className="slot-col">
            <div style={{textAlign:"center",marginBottom:8}}>
              <div className="small" style={{fontWeight:700}}>{weekday(d)}</div>
              <div><strong>{daynum(d)}</strong></div>
            </div>
            <div className="grid" style={{gap:10}}>
              {(data[d]||[]).length===0 && <div className="small" style={{textAlign:"center",opacity:.6}}>Нет слотов</div>}
              {(data[d]||[]).map(s=> (
                <button key={s.id} className="btn btn-ghost" onClick={()=>onPick(d,s)}>{s.start}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
