import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET() {
  revalidateTag("products");
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
