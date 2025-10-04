import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest){
  const host = req.headers.get("host")||"";
  if(process.env.FORCE_DE === "1" && !host.endsWith(".de")){
    const url = new URL(req.url);
    url.host = host.replace(/\.[^.]+$/, ".de");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
