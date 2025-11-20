import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), "public/floormaps/" + file.name);

  await writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    url: "/floormaps/" + file.name,
  });
}
