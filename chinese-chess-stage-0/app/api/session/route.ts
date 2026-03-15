import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomId = String(body.roomId || "");
    const name = String(body.name || "");

    const { room, player } = joinRoom(roomId, name);

    return NextResponse.json({
      ok: true,
      roomId: room.id,
      player,
      players: room.players,
      game: room.game,
      updatedAt: room.updatedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "登录失败" },
      { status: 400 },
    );
  }
}
