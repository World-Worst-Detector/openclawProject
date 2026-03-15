import { NextResponse } from "next/server";
import { makeMove } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const room = makeMove({
      roomId: String(body.roomId || ""),
      playerId: String(body.playerId || ""),
      fromR: Number(body.fromR),
      fromC: Number(body.fromC),
      toR: Number(body.toR),
      toC: Number(body.toC),
    });

    return NextResponse.json({
      ok: true,
      roomId: room.id,
      players: room.players,
      game: room.game,
      updatedAt: room.updatedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "走子失败" },
      { status: 400 },
    );
  }
}
