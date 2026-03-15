"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Board, pieceLabel, Side } from "@/lib/xiangqi";

type Player = { id: string; name: string; side: Side };

type RoomPayload = {
  ok: boolean;
  error?: string;
  roomId: string;
  players: Player[];
  player?: Player;
  game: { board: Board; turn: Side; winner: Side | null };
};

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [self, setSelf] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<Board>([]);
  const [turn, setTurn] = useState<Side>("red");
  const [winner, setWinner] = useState<Side | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const ready = !!self;

  async function join() {
    setError("");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, roomId }),
    });
    const data: RoomPayload = await res.json();
    if (!data.ok || !data.player) {
      setError(data.error || "登录失败");
      return;
    }

    setSelf(data.player);
    setPlayers(data.players);
    setBoard(data.game.board);
    setTurn(data.game.turn);
    setWinner(data.game.winner);
    setRoomId(data.roomId);

    localStorage.setItem(
      "xiangqi-session",
      JSON.stringify({ roomId: data.roomId, playerId: data.player.id, name: data.player.name }),
    );
  }

  const refresh = useCallback(async (targetRoom?: string) => {
    const rid = (targetRoom || roomId).trim();
    if (!rid) return;

    const res = await fetch(`/api/game?roomId=${encodeURIComponent(rid)}`, { cache: "no-store" });
    if (!res.ok) return;
    const data: RoomPayload = await res.json();
    if (!data.ok) return;
    setPlayers(data.players);
    setBoard(data.game.board);
    setTurn(data.game.turn);
    setWinner(data.game.winner);
    setSelf((prev) => {
      if (!prev) return prev;
      const found = data.players.find((p) => p.id === prev.id);
      return found ?? prev;
    });
  }, [roomId]);

  async function move(fromR: number, fromC: number, toR: number, toC: number) {
    if (!self) return;
    setError("");

    const res = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, playerId: self.id, fromR, fromC, toR, toC }),
    });

    const data: RoomPayload = await res.json();
    if (!data.ok) {
      setError(data.error || "走子失败");
      return;
    }

    setPlayers(data.players);
    setBoard(data.game.board);
    setTurn(data.game.turn);
    setWinner(data.game.winner);
  }

  function onCellClick(r: number, c: number) {
    if (!self || winner) return;

    if (!selected) {
      const p = board[r]?.[c];
      if (!p || p.side !== self.side) return;
      setSelected([r, c]);
      return;
    }

    const [fromR, fromC] = selected;
    if (fromR === r && fromC === c) {
      setSelected(null);
      return;
    }

    void move(fromR, fromC, r, c);
    setSelected(null);
  }

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      void refresh();
    }, 1200);
    return () => clearInterval(id);
  }, [ready, refresh]);

  const myTurn = useMemo(() => (self ? turn === self.side : false), [turn, self]);

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">中国象棋对战（双人）</h1>
        <p className="text-sm text-gray-600">输入昵称 + 房间号，2个人进入同一个房间即可开局。</p>

        <input
          className="rounded border p-3"
          placeholder="你的昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border p-3 uppercase"
          placeholder="房间号（如 ROOM1）"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
        />
        <button
          className="rounded bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
          disabled={!name.trim() || !roomId.trim()}
          onClick={() => void join()}
        >
          登录并进入房间
        </button>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4 md:p-8">
      <h1 className="text-2xl font-bold">中国象棋对战</h1>
      <div className="rounded border p-3 text-sm">
        <p>房间：<b>{roomId}</b></p>
        <p>你是：<b>{self?.name}</b>（{self?.side === "red" ? "红方" : "黑方"}）</p>
        <p>
          当前：<b>{turn === "red" ? "红方" : "黑方"}</b>
          {winner ? ` ｜ 胜者：${winner === "red" ? "红方" : "黑方"}` : myTurn ? " ｜ 轮到你了" : " ｜ 等待对手"}
        </p>
        <p>在线玩家：{players.map((p) => `${p.name}(${p.side === "red" ? "红" : "黑"})`).join("、") || "暂无"}</p>
      </div>

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-9 gap-1 rounded border bg-amber-50 p-2">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const active = selected?.[0] === r && selected?.[1] === c;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onCellClick(r, c)}
                className={`flex aspect-square items-center justify-center rounded border text-lg font-bold transition ${
                  active ? "border-blue-600 bg-blue-100" : "border-amber-300"
                } ${cell?.side === "red" ? "text-red-600" : "text-gray-800"}`}
              >
                {cell ? pieceLabel(cell) : ""}
              </button>
            );
          }),
        )}
      </div>

      <p className="text-xs text-gray-500">
        规则说明：已实现基础象棋走法与将帅照面限制；暂未实现“将军/绝杀判定”高级规则。
      </p>
    </main>
  );
}
