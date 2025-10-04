"use client";
import { useMemo, useState } from "react";
export function PriceCalculator(){
  const [km,setKm]=useState(10);const [a,setA]=useState(1);const [b,setB]=useState(1);
  const base=49, perKm=1.2, perFloor=10;
  const total = useMemo(()=>Math.round(base+km*perKm+perFloor*(a+b)),[km,a,b]);
  return (
    <div className="grid" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
      <label>Км<input className="input" type="number" min={0} value={km} onChange={e=>setKm(Number(e.target.value))}/></label>
      <label>Этажи A<input className="input" type="number" min={0} value={a} onChange={e=>setA(Number(e.target.value))}/></label>
      <label>Этажи B<input className="input" type="number" min={0} value={b} onChange={e=>setB(Number(e.target.value))}/></label>
      <div className="kpi">≈ <strong>{total} €</strong><div className="small">оценка</div></div>
    </div>
  );
}
