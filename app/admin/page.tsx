"use client";
import { useState } from "react";

export default function Admin(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [from,setFrom]=useState("08:00");
  const [to,setTo]=useState("20:00");
  const [dur,setDur]=useState(90);
  const [key,setKey]=useState("");
  const [disabled,setDisabled]=useState<string>("");

  function buildBlocks(){
    const blocks:any[]=[];
    function addMinutes(hm:string, m:number){
      const [h,mi]=hm.split(":").map(Number); const d=new Date(); d.setHours(h,mi+m,0,0);
      return d.toTimeString().slice(0,5);
    }
    for(let cur=from; cur<to; cur=addMinutes(cur,dur)){
      const end=addMinutes(cur,dur);
      blocks.push({id: `${date}_${cur.replace(":","")}`, date, start:cur, end, capacity:1});
    }
    return blocks;
  }

  async function save(){
    const res = await fetch("/api/slots",{method:"POST", headers:{"Content-Type":"application/json","x-admin-key":key}, body: JSON.stringify({ blocks: buildBlocks() })});
    alert(res.ok?"Слоты сохранены":"Ошибка");
  }
  async function disable(){
    const ids = disabled.split(/\s|,|;/).filter(Boolean);
    const res = await fetch("/api/slots",{method:"POST", headers:{"Content-Type":"application/json","x-admin-key":key}, body: JSON.stringify({ disable: ids })});
    alert(res.ok?"Деактивировано":"Ошибка");
  }

  return (
    <main className="container card">
      <h2>Управление слотами</h2>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
        <label>Дата<input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        <label>Admin-Key<input className="input" type="password" value={key} onChange={e=>setKey(e.target.value)}/></label>
        <label>С<input className="input" type="time" value={from} onChange={e=>setFrom(e.target.value)}/></label>
        <label>До<input className="input" type="time" value={to} onChange={e=>setTo(e.target.value)}/></label>
        <label>Длительность (мин.)<input className="input" type="number" value={dur} onChange={e=>setDur(Number(e.target.value))}/></label>
      </div>
      <div className="grid" style={{marginTop:12, gridTemplateColumns:"1fr 1fr"}}>
        <button className="btn btn-primary" onClick={save}>Создать слоты</button>
      </div>
      <h3>Отключить слоты</h3>
      <textarea className="input" placeholder="ID через пробел/запятую" value={disabled} onChange={e=>setDisabled(e.target.value)} />
      <button className="btn btn-ghost" onClick={disable}>Отключить</button>
    </main>
  );
}
