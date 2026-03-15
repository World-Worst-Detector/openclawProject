import { NextResponse } from "next/server";
import { getRoom } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId") || "";
  const room = getRoom(roomId);

  if (!room) {
    return NextResponse.json({ ok: false, error: "房间不存在" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    roomId: room.id,
    players: room.players,
    game: room.game,
    updatedAt: room.updatedAt,
  });
}
