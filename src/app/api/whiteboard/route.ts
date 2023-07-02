import { NextResponse } from "next/server";
import { Message } from "../../types/whiteboard-types";


export async function GET(req: Request) {
  return NextResponse.json({ name: 'John Doe' });
}

export async function POST(req: Request) {
  const message = await req.json();
  console.log(message);
  return NextResponse.json({ name: 'John Doe' });
}