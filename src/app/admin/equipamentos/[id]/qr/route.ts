import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPublicEquipmentUrl, renderQrPng, renderQrSvg } from "@/lib/equipment";

function safeFilename(value: string) {
  return value.normalize("NFD").replace(/[^\w.-]+/g, "_").slice(0, 60) || "equipamento";
}

/** QR Code image (PNG or SVG) for printing/downloading. Admin only. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const equipment = await db.equipment.findUnique({
    where: { id },
    select: { qrIdentifier: true, codigoSap: true },
  });
  if (!equipment) return new NextResponse("Equipamento não encontrado.", { status: 404 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "svg" ? "svg" : "png";
  const url = await getPublicEquipmentUrl(equipment.qrIdentifier);

  const headers: Record<string, string> = {
    "Content-Type": format === "svg" ? "image/svg+xml" : "image/png",
    "Cache-Control": "private, no-store",
  };
  if (searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="qrcode-${safeFilename(equipment.codigoSap)}.${format}"`;
  }

  const body = format === "svg" ? await renderQrSvg(url) : new Uint8Array(await renderQrPng(url));
  return new NextResponse(body, { headers });
}
