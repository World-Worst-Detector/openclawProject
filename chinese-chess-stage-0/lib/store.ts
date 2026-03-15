import { applyMove, createInitialGameState, GameState, isLegalMove, Side } from "./xiangqi";

export interface Player {
  id: string;
  name: string;
  side: Side;
}

export interface Room {
  id: string;
  players: Player[];
  game: GameState;
  updatedAt: number;
}

type Store = Map<string, Room>;

declare global {
  var __xiangqiStore: Store | undefined;
}

const store: Store = global.__xiangqiStore ?? new Map<string, Room>();
if (!global.__xiangqiStore) global.__xiangqiStore = store;

function now() {
  return Date.now();
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function joinRoom(roomId: string, name: string) {
  const cleanRoomId = roomId.trim().toUpperCase();
  if (!cleanRoomId) throw new Error("房间号不能为空");

  let room = store.get(cleanRoomId);
  if (!room) {
    room = {
      id: cleanRoomId,
      players: [],
      game: createInitialGameState(),
      updatedAt: now(),
    };
    store.set(cleanRoomId, room);
  }

  if (room.players.length >= 2) throw new Error("房间已满（最多2人）");

  const usedSides = new Set(room.players.map((p) => p.side));
  const side: Side = usedSides.has("red") ? "black" : "red";

  const player: Player = { id: randomId(), name: name.trim() || "玩家", side };
  room.players.push(player);
  room.updatedAt = now();

  return { room, player };
}

export function getRoom(roomId: string) {
  return store.get(roomId.trim().toUpperCase()) ?? null;
}

export function makeMove(params: {
  roomId: string;
  playerId: string;
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
}) {
  const room = getRoom(params.roomId);
  if (!room) throw new Error("房间不存在");

  const player = room.players.find((p) => p.id === params.playerId);
  if (!player) throw new Error("玩家身份无效，请重新登录");

  if (room.game.winner) throw new Error("本局已结束");
  if (room.game.turn !== player.side) throw new Error("还没轮到你走");

  const legal = isLegalMove(
    room.game,
    params.fromR,
    params.fromC,
    params.toR,
    params.toC,
    player.side,
  );

  if (!legal.ok) throw new Error(legal.reason || "非法走子");

  room.game = applyMove(room.game, params.fromR, params.fromC, params.toR, params.toC);
  room.updatedAt = now();

  return room;
}
