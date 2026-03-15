export type Side = "red" | "black";
export type PieceType =
  | "general"
  | "advisor"
  | "elephant"
  | "horse"
  | "chariot"
  | "cannon"
  | "soldier";

export interface Piece {
  type: PieceType;
  side: Side;
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  turn: Side;
  winner: Side | null;
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 10 }, () => Array(9).fill(null));

  const put = (r: number, c: number, piece: Piece) => {
    board[r][c] = piece;
  };

  // Black (top)
  put(0, 0, { type: "chariot", side: "black" });
  put(0, 1, { type: "horse", side: "black" });
  put(0, 2, { type: "elephant", side: "black" });
  put(0, 3, { type: "advisor", side: "black" });
  put(0, 4, { type: "general", side: "black" });
  put(0, 5, { type: "advisor", side: "black" });
  put(0, 6, { type: "elephant", side: "black" });
  put(0, 7, { type: "horse", side: "black" });
  put(0, 8, { type: "chariot", side: "black" });
  put(2, 1, { type: "cannon", side: "black" });
  put(2, 7, { type: "cannon", side: "black" });
  [0, 2, 4, 6, 8].forEach((c) => put(3, c, { type: "soldier", side: "black" }));

  // Red (bottom)
  put(9, 0, { type: "chariot", side: "red" });
  put(9, 1, { type: "horse", side: "red" });
  put(9, 2, { type: "elephant", side: "red" });
  put(9, 3, { type: "advisor", side: "red" });
  put(9, 4, { type: "general", side: "red" });
  put(9, 5, { type: "advisor", side: "red" });
  put(9, 6, { type: "elephant", side: "red" });
  put(9, 7, { type: "horse", side: "red" });
  put(9, 8, { type: "chariot", side: "red" });
  put(7, 1, { type: "cannon", side: "red" });
  put(7, 7, { type: "cannon", side: "red" });
  [0, 2, 4, 6, 8].forEach((c) => put(6, c, { type: "soldier", side: "red" }));

  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    turn: "red",
    winner: null,
  };
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 10 && c >= 0 && c < 9;
}

function countBetweenStraight(board: Board, fromR: number, fromC: number, toR: number, toC: number): number {
  let count = 0;
  if (fromR === toR) {
    const [start, end] = fromC < toC ? [fromC + 1, toC] : [toC + 1, fromC];
    for (let c = start; c < end; c++) if (board[fromR][c]) count++;
    return count;
  }
  if (fromC === toC) {
    const [start, end] = fromR < toR ? [fromR + 1, toR] : [toR + 1, fromR];
    for (let r = start; r < end; r++) if (board[r][fromC]) count++;
    return count;
  }
  return -1;
}

function inPalace(side: Side, r: number, c: number): boolean {
  const rows = side === "red" ? [7, 9] : [0, 2];
  return r >= rows[0] && r <= rows[1] && c >= 3 && c <= 5;
}

function crossedRiver(side: Side, r: number): boolean {
  return side === "red" ? r <= 4 : r >= 5;
}

function findGeneral(board: Board, side: Side): [number, number] | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p?.type === "general" && p.side === side) return [r, c];
    }
  }
  return null;
}

function generalsFacing(board: Board): boolean {
  const red = findGeneral(board, "red");
  const black = findGeneral(board, "black");
  if (!red || !black) return false;
  if (red[1] !== black[1]) return false;
  return countBetweenStraight(board, red[0], red[1], black[0], black[1]) === 0;
}

export function isLegalMove(
  state: GameState,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  side: Side,
): { ok: boolean; reason?: string } {
  const board = state.board;
  if (!inBounds(fromR, fromC) || !inBounds(toR, toC)) return { ok: false, reason: "坐标超出棋盘" };
  if (fromR === toR && fromC === toC) return { ok: false, reason: "不能原地不动" };

  const piece = board[fromR][fromC];
  if (!piece) return { ok: false, reason: "起点没有棋子" };
  if (piece.side !== side) return { ok: false, reason: "不能移动对方棋子" };

  const target = board[toR][toC];
  if (target?.side === side) return { ok: false, reason: "不能吃己方棋子" };

  const dr = toR - fromR;
  const dc = toC - fromC;
  const adr = Math.abs(dr);
  const adc = Math.abs(dc);

  switch (piece.type) {
    case "general": {
      if (!inPalace(side, toR, toC)) return { ok: false, reason: "将/帅不能出九宫" };
      if (adr + adc !== 1) return { ok: false, reason: "将/帅每次只能走一步直线" };
      break;
    }
    case "advisor": {
      if (!inPalace(side, toR, toC)) return { ok: false, reason: "士不能出九宫" };
      if (!(adr === 1 && adc === 1)) return { ok: false, reason: "士走斜一步" };
      break;
    }
    case "elephant": {
      if (!(adr === 2 && adc === 2)) return { ok: false, reason: "相/象走田字" };
      if (side === "red" && toR < 5) return { ok: false, reason: "红相不能过河" };
      if (side === "black" && toR > 4) return { ok: false, reason: "黑象不能过河" };
      const eyeR = fromR + dr / 2;
      const eyeC = fromC + dc / 2;
      if (board[eyeR][eyeC]) return { ok: false, reason: "象眼被堵" };
      break;
    }
    case "horse": {
      if (!((adr === 2 && adc === 1) || (adr === 1 && adc === 2))) return { ok: false, reason: "马走日" };
      const legR = adr === 2 ? fromR + dr / 2 : fromR;
      const legC = adc === 2 ? fromC + dc / 2 : fromC;
      if (board[legR][legC]) return { ok: false, reason: "马腿被别" };
      break;
    }
    case "chariot": {
      if (!(fromR === toR || fromC === toC)) return { ok: false, reason: "车走直线" };
      if (countBetweenStraight(board, fromR, fromC, toR, toC) !== 0) return { ok: false, reason: "路径被阻挡" };
      break;
    }
    case "cannon": {
      if (!(fromR === toR || fromC === toC)) return { ok: false, reason: "炮走直线" };
      const between = countBetweenStraight(board, fromR, fromC, toR, toC);
      if (target) {
        if (between !== 1) return { ok: false, reason: "炮吃子必须隔一个子" };
      } else {
        if (between !== 0) return { ok: false, reason: "炮不吃子时路径必须无阻挡" };
      }
      break;
    }
    case "soldier": {
      const forward = side === "red" ? -1 : 1;
      if (dr === forward && dc === 0) break;
      if (crossedRiver(side, fromR) && dr === 0 && adc === 1) break;
      return { ok: false, reason: "兵/卒走法不合法" };
    }
  }

  const nextBoard = board.map((row) => [...row]);
  nextBoard[toR][toC] = nextBoard[fromR][fromC];
  nextBoard[fromR][fromC] = null;

  if (generalsFacing(nextBoard)) return { ok: false, reason: "不能形成将帅照面" };

  return { ok: true };
}

export function applyMove(state: GameState, fromR: number, fromC: number, toR: number, toC: number): GameState {
  const nextBoard = state.board.map((row) => [...row]);
  const moving = nextBoard[fromR][fromC];
  const target = nextBoard[toR][toC];

  nextBoard[toR][toC] = moving;
  nextBoard[fromR][fromC] = null;

  const winner = target?.type === "general" ? moving?.side ?? null : null;

  return {
    board: nextBoard,
    turn: state.turn === "red" ? "black" : "red",
    winner,
  };
}

export function pieceLabel(piece: Piece): string {
  const redMap: Record<PieceType, string> = {
    general: "帅",
    advisor: "仕",
    elephant: "相",
    horse: "马",
    chariot: "车",
    cannon: "炮",
    soldier: "兵",
  };
  const blackMap: Record<PieceType, string> = {
    general: "将",
    advisor: "士",
    elephant: "象",
    horse: "马",
    chariot: "车",
    cannon: "炮",
    soldier: "卒",
  };
  return piece.side === "red" ? redMap[piece.type] : blackMap[piece.type];
}
