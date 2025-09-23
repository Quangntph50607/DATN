'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from "@/context/authStore.store";
import { useAddPoints } from "@/hooks/useAccount";
import { SuccessNotification } from "@/components/ui/success-notification";
import {
  GameBoard,
  GameStatus,
  ScoreBoard,
  GameControls,
  GameStats,
  GameHeader,
  TutorialModal,
  GameModeSelection,
  DifficultySelection
} from '@/components/layout/(components)/(caro)';

interface Cell {
  value: 'X' | 'O' | null;
  isWinning: boolean;
  isLastMove: boolean;
}

interface GameState {
  board: Cell[][];
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | 'DRAW' | null;
  gameOver: boolean;
  moveCount: number;
  gameTime: number;
  isPaused: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = '2player' | 'ai';

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;
const DAILY_CAP = 1000; // tối đa cộng 1000 điểm/ngày từ game caro

function getTodayStorageKey(userId: number): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `caro_points_${userId}_${yyyy}-${mm}-${dd}`;
}

function getAwardedToday(userId: number): number {
  try {
    const key = getTodayStorageKey(userId);
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return raw ? Math.max(0, parseInt(raw, 10)) : 0;
  } catch {
    return 0;
  }
}

function addAwardedToday(userId: number, amount: number): void {
  try {
    const key = getTodayStorageKey(userId);
    const current = getAwardedToday(userId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, String(current + amount));
    }
  } catch {
    // ignore storage errors
  }
}

const CaroGame: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const { mutate: addPoints } = useAddPoints();
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({ value: null, isWinning: false, isLastMove: false }))
    ),
    currentPlayer: 'X',
    winner: null,
    gameOver: false,
    moveCount: 0,
    gameTime: 0,
    isPaused: false,
  });

  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('2player');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [showWinNotice, setShowWinNotice] = useState(false);
  const [winMessage, setWinMessage] = useState<string>("");
  const [lastHumanMove, setLastHumanMove] = useState<[number, number] | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!gameState.gameOver && !gameState.isPaused && gameStarted) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          gameTime: prev.gameTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.gameOver, gameState.isPaused, gameStarted]);

  // Initialize board
  const initializeBoard = (): Cell[][] => {
    return Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({ value: null, isWinning: false, isLastMove: false }))
    );
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if there's a winner
  const checkWinner = (board: Cell[][], row: number, col: number, player: 'X' | 'O'): boolean => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const winningCells: [number, number][] = [[row, col]];

      // Check in positive direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          board[newRow][newCol].value === player
        ) {
          count++;
          winningCells.push([newRow, newCol]);
        } else {
          break;
        }
      }

      // Check in negative direction
      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          board[newRow][newCol].value === player
        ) {
          count++;
          winningCells.push([newRow, newCol]);
        } else {
          break;
        }
      }

      if (count >= WIN_LENGTH) {
        // Mark winning cells
        winningCells.forEach(([r, c]) => {
          board[r][c].isWinning = true;
        });
        return true;
      }
    }

    return false;
  };

  // ====== AI Heuristics ======
  // Tạo danh sách các ô trống gần quân cờ hiện có (bán kính 2) để giảm không gian tìm kiếm
  const getCandidateMoves = (board: Cell[][]): [number, number][] => {
    const candidates: Set<string> = new Set();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].value !== null) {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (
                nr >= 0 && nr < BOARD_SIZE &&
                nc >= 0 && nc < BOARD_SIZE &&
                board[nr][nc].value === null
              ) {
                candidates.add(`${nr},${nc}`);
              }
            }
          }
        }
      }
    }
    if (candidates.size === 0) {
      // Nếu ván mới, chọn trung tâm
      const mid = Math.floor(BOARD_SIZE / 2);
      return [[mid, mid]];
    }
    return Array.from(candidates).map(s => s.split(',').map(Number) as [number, number]);
  };

  // Kiểm tra thắng nhanh sau khi đặt quân tại [row,col]
  const isWinAfterMove = (board: Cell[][], row: number, col: number, player: 'X' | 'O'): boolean => {
    const clone = board.map(r => r.map(cell => ({ ...cell })));
    clone[row][col] = { value: player, isWinning: false, isLastMove: false };
    return checkWinner(clone, row, col, player);
  };

  // Kiểm tra nếu đặt tại [row,col] sẽ tạo chuỗi 4 (mối đe dọa mạnh) cho player
  const createsFourThreat = (board: Cell[][], row: number, col: number, player: 'X' | 'O'): boolean => {
    const temp = board.map(r => r.map(cell => ({ ...cell })));
    temp[row][col] = { value: player, isWinning: false, isLastMove: false };
    const directions: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];
    const opponent = player === 'X' ? 'O' : 'X';
    for (const [dx, dy] of directions) {
      let count = 1;
      // forward
      let i = 1;
      while (true) {
        const r = row + i*dx, c = col + i*dy;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (temp[r][c].value === player) { count++; i++; }
        else break;
      }
      // backward
      i = 1;
      while (true) {
        const r = row - i*dx, c = col - i*dy;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
        if (temp[r][c].value === player) { count++; i++; }
        else break;
      }
      if (count >= 4) {
        // ít nhất một đầu còn trống để có thể thành 5 ở nước sau
        const beforeR = row - (count - 1) * dx - dx;
        const beforeC = col - (count - 1) * dy - dy;
        const afterR = row + (count - 1) * dx + dx;
        const afterC = col + (count - 1) * dy + dy;
        const beforeOpen = (beforeR >= 0 && beforeR < BOARD_SIZE && beforeC >= 0 && beforeC < BOARD_SIZE) && temp[beforeR][beforeC].value === null;
        const afterOpen = (afterR >= 0 && afterR < BOARD_SIZE && afterC >= 0 && afterC < BOARD_SIZE) && temp[afterR][afterC].value === null;
        if (beforeOpen || afterOpen) return true;
      }
      // broken-four (dạng _XXX_ hoặc XX_XX): kiểm tra ô trống nằm trong đoạn 5 ô có 4 quân ta và 1 trống
      const seq: (null | 'X' | 'O')[] = [];
      for (let k = -4; k <= 4; k++) {
        const r = row + k*dx, c = col + k*dy;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { seq.push(null); continue; }
        seq.push(temp[r][c].value);
      }
      for (let start = 0; start + 4 < seq.length; start++) {
        const window = seq.slice(start, start + 5);
        const ownCount = window.filter(v => v === player).length;
        const emptyCount = window.filter(v => v === null).length;
        const oppCount = window.filter(v => v === opponent).length;
        if (oppCount === 0 && ownCount === 4 && emptyCount === 1) return true;
      }
    }
    return false;
  };

  // Tìm các ô chặn ngay sát hai đầu cho chuỗi đối thủ có độ dài >= 3
  const getImmediateBlockingEnds = (board: Cell[][], minLen: number = 3): { four: [number, number][], three: [number, number][] } => {
    const opponent: 'X' | 'O' = 'X';
    const directions: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];
    const endsFour: Set<string> = new Set();
    const endsThree: Set<string> = new Set();

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        for (const [dx, dy] of directions) {
          // chỉ xét khi là bắt đầu của một dãy đối thủ
          const prevR = r - dx, prevC = c - dy;
          if (
            r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
            board[r][c].value === opponent &&
            (prevR < 0 || prevR >= BOARD_SIZE || prevC < 0 || prevC >= BOARD_SIZE || board[prevR][prevC].value !== opponent)
          ) {
            // đếm độ dài dãy
            let len = 0;
            let rr = r, cc = c;
            while (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE && board[rr][cc].value === opponent) {
              len++;
              rr += dx; cc += dy;
            }
            if (len >= minLen) {
              const beforeR = r - dx;
              const beforeC = c - dy;
              const afterR = r + len * dx;
              const afterC = c + len * dy;
              const beforeOpen = beforeR >= 0 && beforeR < BOARD_SIZE && beforeC >= 0 && beforeC < BOARD_SIZE && board[beforeR][beforeC].value === null;
              const afterOpen = afterR >= 0 && afterR < BOARD_SIZE && afterC >= 0 && afterC < BOARD_SIZE && board[afterR][afterC].value === null;
              if (len >= 4) {
                if (beforeOpen) endsFour.add(`${beforeR},${beforeC}`);
                if (afterOpen) endsFour.add(`${afterR},${afterC}`);
              } else if (len === 3) {
                if (beforeOpen) endsThree.add(`${beforeR},${beforeC}`);
                if (afterOpen) endsThree.add(`${afterR},${afterC}`);
              }
            }
          }
        }
      }
    }

    const parse = (s: string): [number, number] => s.split(',').map(Number) as [number, number];
    return { four: Array.from(endsFour).map(parse), three: Array.from(endsThree).map(parse) };
  };

  // Đánh giá theo mẫu mở/đóng (open/blocked) cho 4 hướng
  const evaluatePosition = (board: Cell[][], player: 'X' | 'O'): number => {
    const opponent = player === 'X' ? 'O' : 'X';
    let total = 0;

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    const scoreTable: Record<string, number> = {
      // Mở hai đầu
      'open4': 100000,
      'open3': 1000,
      'open2': 100,
      // Một đầu bị chặn
      'closed4': 10000,
      'closed3': 200,
      'closed2': 20,
    };

    const evalLine = (r: number, c: number, dr: number, dc: number) => {
      let count = 0;
      let i = 0;
      // đi lùi về đầu chuỗi
      while (
        r - (i + 1) * dr >= 0 && r - (i + 1) * dr < BOARD_SIZE &&
        c - (i + 1) * dc >= 0 && c - (i + 1) * dc < BOARD_SIZE &&
        board[r - (i + 1) * dr][c - (i + 1) * dc].value === player
      ) {
        i++;
      }
      const startR = r - i * dr;
      const startC = c - i * dc;
      // tiến về cuối chuỗi
      let j = 0;
      while (
        startR + j * dr >= 0 && startR + j * dr < BOARD_SIZE &&
        startC + j * dc >= 0 && startC + j * dc < BOARD_SIZE &&
        board[startR + j * dr][startC + j * dc].value === player
      ) {
        count++;
        j++;
      }

      if (count === 0) return 0;

      const beforeR = startR - dr;
      const beforeC = startC - dc;
      const afterR = startR + j * dr;
      const afterC = startC + j * dc;

      const beforeBlocked =
        beforeR < 0 || beforeR >= BOARD_SIZE || beforeC < 0 || beforeC >= BOARD_SIZE
          ? true
          : board[beforeR][beforeC].value === opponent;
      const afterBlocked =
        afterR < 0 || afterR >= BOARD_SIZE || afterC < 0 || afterC >= BOARD_SIZE
          ? true
          : board[afterR][afterC].value === opponent;

      const openEnds = (beforeBlocked ? 0 : 1) + (afterBlocked ? 0 : 1);

      if (count >= WIN_LENGTH) return scoreTable['open4'] * 10; // thắng chắc
      if (count === 4) return openEnds === 2 ? scoreTable['open4'] : scoreTable['closed4'];
      if (count === 3) return openEnds === 2 ? scoreTable['open3'] : scoreTable['closed3'];
      if (count === 2) return openEnds === 2 ? scoreTable['open2'] : scoreTable['closed2'];
      return 5; // mặc định nhỏ
    };

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].value === player) {
          for (const [dr, dc] of directions) {
            total += evalLine(r, c, dr, dc);
          }
        }
      }
    }
    // trừ điểm dựa trên sức mạnh đối thủ
    let opp = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].value === opponent) {
          for (const [dr, dc] of directions) {
            opp += evalLine(r, c, dr, dc);
          }
        }
      }
    }
    return total - opp * 0.9;
  };

  // AI move with different difficulty levels
  const makeAIMove = (board: Cell[][], difficulty: Difficulty): [number, number] | null => {
    const candidates = getCandidateMoves(board);
    if (candidates.length === 0) return null;

    // 1) Thắng ngay nếu có
    for (const [r, c] of candidates) {
      if (isWinAfterMove(board, r, c, 'O')) return [r, c];
    }
    // 2) Chặn đối thủ thắng ngay
    for (const [r, c] of candidates) {
      if (isWinAfterMove(board, r, c, 'X')) return [r, c];
    }

    // 2.5) Chặn mối đe dọa 4-quân (open/broken four) của đối thủ: nếu X có thể tạo 4 ở nước tiếp theo tại vị trí p, ta đặt O vào p
    for (const [r, c] of candidates) {
      if (createsFourThreat(board, r, c, 'X')) return [r, c];
    }

    // 2.6) Ưu tiên chặn NGAY SÁT hai đầu cho dãy đối thủ (không để hở): ưu tiên dãy 3 rồi tới dãy 4
    const ends = getImmediateBlockingEnds(board, 3);
    const byNearestToLast = (cells: [number, number][]) => {
      if (!lastHumanMove) return cells;
      const [lr, lc] = lastHumanMove;
      return [...cells].sort((a, b) => {
        const da = Math.abs(a[0] - lr) + Math.abs(a[1] - lc);
        const db = Math.abs(b[0] - lr) + Math.abs(b[1] - lc);
        return da - db;
      });
    };

    for (const cell of byNearestToLast(ends.three)) {
      if (board[cell[0]][cell[1]].value === null) return cell;
    }
    for (const cell of byNearestToLast(ends.four)) {
      if (board[cell[0]][cell[1]].value === null) return cell;
    }

    // 3) Theo độ khó
    const pickByHeuristic = (cand: [number, number][]) => {
      let best = cand[0];
      let bestScore = -Infinity;
      for (const [r, c] of cand) {
        const test = board.map(row => row.map(cell => ({ ...cell })));
        test[r][c] = { value: 'O', isWinning: false, isLastMove: false };
        const s = evaluatePosition(test, 'O');
        if (s > bestScore) { bestScore = s; best = [r, c]; }
      }
      return best;
    };

    if (difficulty === 'easy') {
      if (Math.random() < 0.5) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      return pickByHeuristic(candidates);
    }

    if (difficulty === 'medium') {
      return pickByHeuristic(candidates);
    }

    // hard: alpha-beta nông (depth 2)
    const maxDepth = 2;
    const alphaBeta = (b: Cell[][], depth: number, alpha: number, beta: number, maximizing: boolean): number => {
      // heuristic terminal
      if (depth === 0) return evaluatePosition(b, 'O');
      const moves = getCandidateMoves(b);
      if (moves.length === 0) return evaluatePosition(b, 'O');
      if (maximizing) {
        let value = -Infinity;
        for (const [r, c] of moves) {
          const nb = b.map(row => row.map(cell => ({ ...cell })));
          nb[r][c] = { value: 'O', isWinning: false, isLastMove: false };
          if (isWinAfterMove(b, r, c, 'O')) return 1e9; // thắng ngay
          value = Math.max(value, alphaBeta(nb, depth - 1, alpha, beta, false));
          alpha = Math.max(alpha, value);
          if (alpha >= beta) break;
        }
        return value;
      } else {
        let value = Infinity;
        for (const [r, c] of moves) {
          const nb = b.map(row => row.map(cell => ({ ...cell })));
          nb[r][c] = { value: 'X', isWinning: false, isLastMove: false };
          if (isWinAfterMove(b, r, c, 'X')) return -1e9; // đối thủ thắng
          value = Math.min(value, alphaBeta(nb, depth - 1, alpha, beta, true));
          beta = Math.min(beta, value);
          if (alpha >= beta) break;
        }
        return value;
      }
    };

    let bestMove: [number, number] = candidates[0];
    let bestVal = -Infinity;
    for (const [r, c] of candidates) {
      const nb = board.map(row => row.map(cell => ({ ...cell })));
      nb[r][c] = { value: 'O', isWinning: false, isLastMove: false };
      const val = alphaBeta(nb, maxDepth - 1, -Infinity, Infinity, false);
      if (val > bestVal) { bestVal = val; bestMove = [r, c]; }
    }
    return bestMove;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.board[row][col].value !== null || !gameStarted) {
      return;
    }

    const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell, isLastMove: false })));
    newBoard[row][col] = { value: gameState.currentPlayer, isWinning: false, isLastMove: true };

    const isWinner = checkWinner(newBoard, row, col, gameState.currentPlayer);
    const isDraw = gameState.moveCount + 1 === BOARD_SIZE * BOARD_SIZE;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      winner: isWinner ? prev.currentPlayer : isDraw ? 'DRAW' : null,
      gameOver: isWinner || isDraw,
      moveCount: prev.moveCount + 1,
    }));

    // Update scores if there's a winner
    if (isWinner) {
      setScores(prev => ({
        ...prev,
        [gameState.currentPlayer]: prev[gameState.currentPlayer] + 1
      }));

      // Cộng điểm khi người chơi (X) thắng AI với giới hạn tối đa 1000 điểm/ngày
      if (gameMode === 'ai' && gameState.currentPlayer === 'X' && user?.id) {
        const basePoints = 100;
        const awarded = getAwardedToday(user.id);
        const remaining = Math.max(0, DAILY_CAP - awarded);
        const grant = Math.min(basePoints, remaining);

        if (grant > 0) {
          addPoints(
            { userId: user.id, diemCong: grant },
            {
              onSuccess: () => {
                addAwardedToday(user.id, grant);
                // Cập nhật điểm trong store
                useUserStore.getState().updateUser({ diemTichLuy: (user.diemTichLuy || 0) + grant });
                setWinMessage(`+${grant} điểm! Chúc mừng bạn đã thắng AI.`);
                setShowWinNotice(true);
                setTimeout(() => setShowWinNotice(false), 2000);
              },
              onError: () => {
                console.error("Cộng điểm thất bại");
              }
            }
          );
        } else {
          setWinMessage("Bạn đã đạt giới hạn +1000 điểm/ngày khi chơi caro.");
          setShowWinNotice(true);
          setTimeout(() => setShowWinNotice(false), 2500);
        }
      }
    }

    // Ghi nhớ nước đi cuối của người chơi X (để AI chặn sát hơn)
    if (gameMode === 'ai' && gameState.currentPlayer === 'X') {
      setLastHumanMove([row, col]);
    }

    // AI move if in AI mode and game not over
    if (gameMode === 'ai' && !isWinner && !isDraw) {
      console.log('AI turn - Difficulty:', difficulty, 'Game mode:', gameMode);
      setAiThinking(true);
      setTimeout(() => {
        const aiMove = makeAIMove(newBoard, difficulty);
        console.log('AI move result:', aiMove);
        if (aiMove) {
          const [aiRow, aiCol] = aiMove;
          const aiBoard = newBoard.map(row => row.map(cell => ({ ...cell, isLastMove: false })));
          aiBoard[aiRow][aiCol] = { value: 'O', isWinning: false, isLastMove: true };

          const aiWinner = checkWinner(aiBoard, aiRow, aiCol, 'O');
          const aiDraw = gameState.moveCount + 2 === BOARD_SIZE * BOARD_SIZE;

          setGameState(prev => ({
            ...prev,
            board: aiBoard,
            currentPlayer: 'X',
            winner: aiWinner ? 'O' : aiDraw ? 'DRAW' : null,
            gameOver: aiWinner || aiDraw,
            moveCount: prev.moveCount + 2,
          }));

          if (aiWinner) {
            setScores(prev => ({
              ...prev,
              O: prev.O + 1
            }));
          }
        }
        setAiThinking(false);
      }, difficulty === 'easy' ? 300 : difficulty === 'medium' ? 500 : 800);
    }
  };

  // Start game
  const startGame = () => {
    console.log('Starting game with mode:', gameMode, 'difficulty:', difficulty);
    setGameStarted(true);
    setShowDifficultySelect(false);
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'X',
      winner: null,
      gameOver: false,
      moveCount: 0,
      gameTime: 0,
      isPaused: false,
    });
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'X',
      winner: null,
      gameOver: false,
      moveCount: 0,
      gameTime: 0,
      isPaused: false,
    });
    setGameStarted(false);
  };

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0 });
  };

  // Toggle pause
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  // Get difficulty info
  const getDifficultyInfo = (level: Difficulty) => {
    switch (level) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
    }
  };

  // Handle game mode selection
  const handleModeSelection = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === '2player') {
                     setGameStarted(true);
    } else {
                       setShowDifficultySelect(true);
    }
  };

  // Handle difficulty selection
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  // Handle back from difficulty selection
  const handleBackFromDifficulty = () => {
    setShowDifficultySelect(false);
  };

  // Debug AI function
  const debugAI = () => {
                            console.log('Current game state:', {
                              gameMode,
                              difficulty,
                              gameStarted,
                              currentPlayer: gameState.currentPlayer,
                              moveCount: gameState.moveCount
                            });
  };

  // Difficulty selection screen
  if (showDifficultySelect) {
    return (
      <DifficultySelection
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        onBack={handleBackFromDifficulty}
        onStartGame={startGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <GameHeader
        onToggleTutorial={() => setShowTutorial(!showTutorial)}
        onTogglePause={togglePause}
        isPaused={gameState.isPaused}
        gameOver={gameState.gameOver}
        gameStarted={gameStarted}
      />

      <div className="max-w-7xl mx-auto p-4">
        <SuccessNotification isVisible={showWinNotice} message={winMessage} onClose={() => setShowWinNotice(false)} />
        <TutorialModal
          showTutorial={showTutorial}
          onClose={() => setShowTutorial(false)}
        />

        {!gameStarted ? (
          <GameModeSelection onSelectMode={handleModeSelection} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GameBoard
                board={gameState.board}
                currentPlayer={gameState.currentPlayer}
                gameTime={gameState.gameTime}
                gameOver={gameState.gameOver}
                isPaused={gameState.isPaused}
                aiThinking={aiThinking}
                gameMode={gameMode}
                difficulty={getDifficultyInfo(difficulty)}
                onCellClick={handleCellClick}
                formatTime={formatTime}
              />
                  </div>

            <div className="space-y-6">
              <GameStatus
                winner={gameState.winner}
                isPaused={gameState.isPaused}
                aiThinking={aiThinking}
                moveCount={gameState.moveCount}
              />

              <ScoreBoard scores={scores} />

              <GameControls
                onResetGame={resetGame}
                onResetScores={resetScores}
                gameMode={gameMode}
                onDebugAI={debugAI}
              />

              <GameStats
                gameTime={gameState.gameTime}
                moveCount={gameState.moveCount}
                gameMode={gameMode}
                difficulty={getDifficultyInfo(difficulty)}
                formatTime={formatTime}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaroGame;
