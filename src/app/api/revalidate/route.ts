import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("products");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
