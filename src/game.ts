import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_SUBSTEP,
  MAX_BOUNCE_ANGLE,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLES,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface Snapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: (BallState & { readonly speed: number }) | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
}
export interface MenuRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): Snapshot;
  menuItemRect(s: DeepReadonly<CaromState>, index: number): MenuRect | null;
}
export const BACKGROUND = "#08111f";
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const freshSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const paddle = (): PaddleState => ({
  cy: FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const makeObstacles = (): ObstacleState[] =>
  OBSTACLE_CENTERS.map((p, index) => ({ index, cx: p.x, cy: p.y }));
const parkedBall = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: freshSign(),
  trail: [],
});
const titleState = (
  muted = false,
  titleIndex = 0,
  simTime = 0,
): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: titleIndex,
  titleIndex,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: paddle(), right: paddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: parkedBall(),
  obstacles: makeObstacles(),
  simTime,
  muted,
});
const withBall = (
  s: DeepReadonly<CaromState>,
  fn: (b: BallState) => BallState,
): CaromState => {
  if (!s.ball) throw new Error("Carom: no ball");
  return { ...s, ball: fn(s.ball) };
};
const withPaddle = (
  s: DeepReadonly<CaromState>,
  side: Side,
  fn: (p: PaddleState) => PaddleState,
): CaromState => ({
  ...s,
  paddles: { ...s.paddles, [side]: fn(s.paddles[side]) },
});
const menuLength = (screen: Screen) =>
  screen === "title"
    ? TITLE_ITEMS.length
    : screen === "howto"
      ? 1
      : screen === "paused"
        ? PAUSE_ITEMS.length
        : screen === "matchover"
          ? MATCHOVER_ITEMS.length
          : 0;
const menuRect = (screen: Screen, index: number): MenuRect | null => {
  const count = menuLength(screen);
  if (index < 0 || index >= count) return null;
  return {
    x: 420,
    y: screen === "title" ? 390 + index * 64 : 500 + index * 58,
    w: 440,
    h: 48,
  };
};
const startMatch = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...s,
  screen: "countdown",
  mode,
  menuIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  paddles: { left: paddle(), right: paddle() },
  ball: parkedBall(),
  obstacles: makeObstacles(),
});
const returnTitle = (s: DeepReadonly<CaromState>): CaromState => {
  const t = titleState(s.muted, s.titleIndex, s.simTime);
  return { ...t, menuIndex: s.titleIndex };
};
function movePaddle(p: PaddleState, vy: number, dt: number): PaddleState {
  const cy = clamp(p.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  return { ...p, cy, vy: dt > 0 && cy !== p.cy ? (cy - p.cy) / dt : 0 };
}
function aiVelocity(s: DeepReadonly<CaromState>, dt: number): number {
  let target = AI_HOME_Y;
  let deadzone = AI_HOME_DEADZONE;
  if (s.ai.tracking && s.screen === "playing" && s.ball && s.ball.vx > 0) {
    target = s.ball.y - s.ball.vy * AI_REACT;
    deadzone = AI_DEADZONE;
  }
  const diff = target - s.paddles.right.cy;
  return !s.ai.movement || Math.abs(diff) <= deadzone || dt <= 0
    ? 0
    : Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
}
function updatePaddles(
  s: DeepReadonly<CaromState>,
  api: UpdateApi,
  dt: number,
): CaromState {
  const l = s.paddles.left.driven
    ? s.paddles.left.drivenVy
    : PADDLE_SPEED *
      (api.input.value("p1-down") +
        (s.mode === "solo" ? api.input.value("p2-down") : 0) -
        api.input.value("p1-up") -
        (s.mode === "solo" ? api.input.value("p2-up") : 0));
  const r = s.paddles.right.driven
    ? s.paddles.right.drivenVy
    : s.mode === "solo"
      ? aiVelocity(s, dt)
      : PADDLE_SPEED * (api.input.value("p2-down") - api.input.value("p2-up"));
  return {
    ...s,
    paddles: {
      left: movePaddle(s.paddles.left, l, dt),
      right: movePaddle(s.paddles.right, r, dt),
    },
  };
}
function cue(api: UpdateApi, name: string): void {
  api.audio.play(name);
}
function circleRect(
  ball: BallState,
  rect: { x0: number; y0: number; x1: number; y1: number },
  side: Side | null,
  cy: number,
  pvy: number,
  api: UpdateApi,
): BallState {
  const d = [
    ball.x - (rect.x0 - BALL_R),
    rect.x1 + BALL_R - ball.x,
    ball.y - (rect.y0 - BALL_R),
    rect.y1 + BALL_R - ball.y,
  ];
  if (d.some((v) => v <= 0)) return ball;
  let face = 0;
  for (let i = 1; i < 4; i++) if (d[i] < d[face]) face = i;
  let b = {
    ...ball,
    ...(face === 0
      ? { x: rect.x0 - BALL_R }
      : face === 1
        ? { x: rect.x1 + BALL_R }
        : face === 2
          ? { y: rect.y0 - BALL_R }
          : { y: rect.y1 + BALL_R }),
  };
  if (side && face < 2) {
    const theta = clamp((b.y - cy) / 55, -1, 1) * MAX_BOUNCE_ANGLE;
    const speed = Math.min(Math.hypot(b.vx, b.vy) * SPEED_MULT, SPEED_CAP);
    const dir = side === "left" ? 1 : -1;
    cue(api, CUES.paddleHit);
    return {
      ...b,
      vx: dir * speed * Math.cos(theta),
      vy: speed * Math.sin(theta),
      spin: clamp(b.spin + pvy * SPIN_FROM_PADDLE, -SPIN_CLAMP, SPIN_CLAMP),
    };
  }
  const into =
    face === 0
      ? b.vx < 0
      : face === 1
        ? b.vx > 0
        : face === 2
          ? b.vy < 0
          : b.vy > 0;
  if (into) {
    b = face < 2 ? { ...b, vx: -b.vx } : { ...b, vy: -b.vy };
    cue(api, side ? CUES.wallBounce : CUES.obstacleBounce);
  }
  return b;
}
function advanceBall(
  s: DeepReadonly<CaromState>,
  api: UpdateApi,
  dt: number,
): CaromState {
  if (!s.ball) return { ...s };
  if (s.ball.held) {
    const timer = s.ball.holdTimer - dt;
    if (timer <= 0) {
      const dir = s.receiver === "left" ? -1 : 1;
      return {
        ...s,
        screen: "playing",
        ball: {
          ...s.ball,
          held: false,
          holdTimer: 0,
          vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
          vy: s.ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
          trail: [],
        },
      };
    }
    return { ...s, ball: { ...s.ball, holdTimer: timer } };
  }
  const n = Math.max(
    1,
    Math.ceil((Math.hypot(s.ball.vx, s.ball.vy) * dt) / MAX_SUBSTEP),
  );
  const h = dt / n;
  let b = { ...s.ball };
  for (let i = 0; i < n; i++) {
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 0) {
      const a = (b.spin / sp) * h;
      const c = Math.cos(a),
        si = Math.sin(a);
      b = { ...b, vx: b.vx * c - b.vy * si, vy: b.vx * si + b.vy * c };
    }
    b = {
      ...b,
      spin: b.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
      x: b.x + b.vx * h,
      y: b.y + b.vy * h,
    };
    if (b.y - BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: BALL_R, vy: -b.vy };
      cue(api, CUES.wallBounce);
    } else if (b.y + BALL_R > FIELD_H && b.vy > 0) {
      b = { ...b, y: FIELD_H - BALL_R, vy: -b.vy };
      cue(api, CUES.wallBounce);
    }
    b = circleRect(
      b,
      {
        x0: P1_X0,
        y0: s.paddles.left.cy - PADDLE_H / 2,
        x1: P1_X1,
        y1: s.paddles.left.cy + PADDLE_H / 2,
      },
      "left",
      s.paddles.left.cy,
      s.paddles.left.vy,
      api,
    );
    b = circleRect(
      b,
      {
        x0: P2_X0,
        y0: s.paddles.right.cy - PADDLE_H / 2,
        x1: P2_X1,
        y1: s.paddles.right.cy + PADDLE_H / 2,
      },
      "right",
      s.paddles.right.cy,
      s.paddles.right.vy,
      api,
    );
    for (const o of s.obstacles)
      b = circleRect(b, OBSTACLES[o.index], null, 0, 0, api);
  }
  const trail = [...b.trail, { x: b.x, y: b.y, t: s.simTime + dt }].filter(
    (v) => v.t >= s.simTime + dt - TRAIL_TIME,
  );
  return { ...s, ball: { ...b, trail } };
}
function snap(s: DeepReadonly<CaromState>): Snapshot {
  return {
    ...s,
    version: CAROM_DEBUG_VERSION,
    score: { ...s.score },
    paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
    obstacles: s.obstacles.map((o) => ({ ...o })),
    ball: s.ball
      ? {
          ...s.ball,
          speed: Math.hypot(s.ball.vx, s.ball.vy),
          trail: s.ball.trail.map((t) => ({ ...t })),
        }
      : null,
  };
}
function debugApi(): CaromDebugApi {
  const wb = (s: DeepReadonly<CaromState>, f: (b: BallState) => BallState) =>
    withBall(s, f);
  return {
    version: CAROM_DEBUG_VERSION,
    clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
    spawnBall: (s) => ({ ...s, ball: parkedBall() }),
    spawnObstacle: (s, index) => {
      if (index < 0 || index >= 2)
        throw new Error(`Carom: invalid obstacle ${index}`);
      return {
        ...s,
        obstacles: [
          ...s.obstacles.filter((o) => o.index !== index),
          {
            index,
            cx: OBSTACLE_CENTERS[index].x,
            cy: OBSTACLE_CENTERS[index].y,
          },
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (s) => titleState(s.muted),
    reconcile: (s) => ({ ...s }),
    setScreen: (s, screen) => ({ ...s, screen }),
    setMode: (s, mode) => ({ ...s, mode }),
    setMenuIndex: (s, menuIndex) => ({ ...s, menuIndex }),
    setTitleIndex: (s, titleIndex) => ({ ...s, titleIndex }),
    setResumeScreen: (s, resumeScreen) => ({ ...s, resumeScreen }),
    setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
    setWinner: (s, winner) => ({ ...s, winner }),
    setReceiver: (s, receiver) => ({ ...s, receiver }),
    setPaddleCy: (s, side, cy) => withPaddle(s, side, (p) => ({ ...p, cy })),
    setPaddleVy: (s, side, vy) =>
      withPaddle(s, side, (p) => ({ ...p, drivenVy: vy })),
    setPaddleDriven: (s, side, driven) =>
      withPaddle(s, side, (p) => ({ ...p, driven })),
    setBallPosition: (s, x, y) => wb(s, (b) => ({ ...b, x, y })),
    setBallVelocity: (s, vx, vy) => wb(s, (b) => ({ ...b, vx, vy })),
    setBallSpin: (s, spin) => wb(s, (b) => ({ ...b, spin })),
    setBallHeld: (s, held) => wb(s, (b) => ({ ...b, held })),
    setBallHoldTimer: (s, seconds) =>
      wb(s, (b) => ({ ...b, holdTimer: seconds, held: seconds > 0 })),
    setBallServeSign: (s, sign) => wb(s, (b) => ({ ...b, serveSign: sign })),
    drawBallServeSign: (s) => wb(s, (b) => ({ ...b, serveSign: freshSign() })),
    setAiTracking: (s, enabled) => ({
      ...s,
      ai: { ...s.ai, tracking: enabled },
    }),
    setAiMovement: (s, enabled) => ({
      ...s,
      ai: { ...s.ai, movement: enabled },
    }),
    setMuted: (s, muted) => ({ ...s, muted }),
    snapshot: snap,
    menuItemRect: (s, index) => menuRect(s.screen, index),
  };
}
function menuInput(s: CaromState, api: UpdateApi): CaromState {
  const up = api.input.pressed("p1-up") || api.input.pressed("p2-up"),
    down = api.input.pressed("p1-down") || api.input.pressed("p2-down"),
    confirm = api.input.pressed("confirm"),
    back = api.input.pressed("back");
  let n = s;
  if (s.screen === "title") {
    if (up && !down) n = { ...n, menuIndex: (s.menuIndex + 2) % 3 };
    else if (down && !up) n = { ...n, menuIndex: (s.menuIndex + 1) % 3 };
    if (confirm) {
      n = { ...n, titleIndex: n.menuIndex };
      n =
        n.menuIndex === 0
          ? startMatch(n, "solo")
          : n.menuIndex === 1
            ? startMatch(n, "versus")
            : { ...n, screen: "howto", menuIndex: 0 };
    }
  } else if (s.screen === "howto") {
    if (confirm || back) n = returnTitle(s);
  } else if (s.screen === "paused") {
    if (api.input.pressed("pause") || back)
      n = { ...n, screen: s.resumeScreen };
    else if (up && !down) n = { ...n, menuIndex: (s.menuIndex + 2) % 3 };
    else if (down && !up) n = { ...n, menuIndex: (s.menuIndex + 1) % 3 };
    else if (confirm)
      n =
        s.menuIndex === 0
          ? { ...n, screen: s.resumeScreen }
          : s.menuIndex === 1
            ? startMatch(n, s.mode)
            : returnTitle(n);
  } else if (s.screen === "matchover") {
    if (back) n = returnTitle(s);
    else if (up && !down) n = { ...n, menuIndex: (s.menuIndex + 1) % 2 };
    else if (down && !up) n = { ...n, menuIndex: (s.menuIndex + 1) % 2 };
    else if (confirm)
      n = s.menuIndex === 0 ? startMatch(n, s.mode) : returnTitle(n);
  }
  return n;
}
function pointerMenu(s: CaromState, api: UpdateApi): CaromState {
  if (menuLength(s.screen) === 0) return s;
  let n = s;
  const samples = api.input.pointerSamples().filter((x) => x.primary);
  for (const p of samples)
    for (let i = 0; i < menuLength(s.screen); i++) {
      const r = menuRect(s.screen, i);
      if (r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h)
        n = { ...n, menuIndex: i };
    }
  const down = samples.find((p) => p.type === "down");
  const up = samples.find((p) => p.type === "up");
  if (down && up) {
    const item = (p: typeof down) =>
      [...Array(menuLength(n.screen)).keys()].find((i) => {
        const r = menuRect(n.screen, i);
        return (
          r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
        );
      });
    const downItem = item(down);
    if (downItem !== undefined && downItem === item(up)) {
      n =
        n.screen === "title"
          ? downItem === 0
            ? startMatch({ ...n, titleIndex: downItem }, "solo")
            : downItem === 1
              ? startMatch({ ...n, titleIndex: downItem }, "versus")
              : { ...n, titleIndex: downItem, screen: "howto", menuIndex: 0 }
          : n.screen === "howto"
            ? returnTitle(n)
            : n.screen === "paused"
              ? downItem === 0
                ? { ...n, screen: n.resumeScreen }
                : downItem === 1
                  ? startMatch(n, n.mode)
                  : returnTitle(n)
              : downItem === 0
                ? startMatch(n, n.mode)
                : returnTitle(n);
    }
  }
  return n;
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const a of ACTIONS) api.input.register(a, { keys: [...BINDINGS[a]] });
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 260,
      freqTo: 180,
      durationMs: 55,
      gain: 0.18,
    });
    api.audio.define(CUES.wallBounce, {
      freq: 180,
      freqTo: 120,
      durationMs: 45,
      gain: 0.14,
    });
    api.audio.define(CUES.obstacleBounce, {
      freq: 420,
      freqTo: 260,
      durationMs: 65,
      gain: 0.16,
    });
    api.audio.define(CUES.score, {
      wave: "triangle",
      freq: 330,
      freqTo: 660,
      durationMs: 180,
      gain: 0.2,
    });
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("mode", (s) => s.mode);
    api.diagnostics.register("score", (s) => `${s.score.p1} - ${s.score.p2}`);
    api.diagnostics.register("ball", (s) =>
      s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "none",
    );
    api.diagnostics.register("velocity", (s) =>
      s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "none",
    );
    api.diagnostics.register("speed", (s) =>
      s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : 0,
    );
    api.diagnostics.register("spin", (s) => s.ball?.spin ?? 0);
    api.diagnostics.register(
      "p1 paddle",
      (s) =>
        `${s.paddles.left.cy.toFixed(1)} / ${s.paddles.left.vy.toFixed(1)}`,
    );
    api.diagnostics.register(
      "p2 paddle",
      (s) =>
        `${s.paddles.right.cy.toFixed(1)} / ${s.paddles.right.vy.toFixed(1)}`,
    );
    return [titleState(false), debugApi()];
  },
  update(state, api, dt) {
    let s: CaromState = {
      ...state,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!s.muted);
      s = { ...s, muted: api.audio.muted() };
    }
    if (["title", "howto", "paused", "matchover"].includes(s.screen))
      s = menuInput(s, api);
    s = pointerMenu(s, api);
    if (
      (s.screen === "playing" || s.screen === "countdown") &&
      api.input.pressed("pause")
    )
      s = { ...s, resumeScreen: s.screen, screen: "paused", menuIndex: 0 };
    if (s.screen === "playing" || s.screen === "countdown") {
      s = updatePaddles(s, api, dt);
      s = advanceBall(s, api, dt);
    }
    if (
      s.screen === "playing" &&
      s.ball &&
      (s.ball.x - BALL_R > FIELD_W || s.ball.x + BALL_R < 0)
    ) {
      const p1 = s.ball.x - BALL_R > FIELD_W,
        score = {
          p1: s.score.p1 + (p1 ? 1 : 0),
          p2: s.score.p2 + (p1 ? 0 : 1),
        };
      cue(api, CUES.score);
      const winner =
        score.p1 >= WIN_SCORE && score.p1 - score.p2 >= WIN_LEAD
          ? "left"
          : score.p2 >= WIN_SCORE && score.p2 - score.p1 >= WIN_LEAD
            ? "right"
            : null;
      s = winner
        ? { ...s, score, winner, screen: "matchover", menuIndex: 0 }
        : {
            ...s,
            score,
            receiver: p1 ? "right" : "left",
            screen: "countdown",
            ball: parkedBall(),
          };
    }
    return s;
  },
  render(state, api: RenderApi) {
    const c = api.ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    c.strokeStyle = "rgba(130,170,210,.22)";
    c.lineWidth = 2;
    c.setLineDash([10, 14]);
    c.beginPath();
    c.moveTo(NET_X, 40);
    c.lineTo(NET_X, FIELD_H - 40);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles) {
      c.fillStyle = "#f3a64a";
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 18;
      c.fillRect(o.cx - 10, o.cy - 70, 20, 140);
      c.shadowBlur = 0;
    }
    for (const side of ["left", "right"] as const) {
      const p = state.paddles[side],
        x = side === "left" ? P1_X0 : P2_X0;
      c.fillStyle = side === "left" ? "#52e0c4" : "#c88cff";
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 18;
      c.beginPath();
      c.roundRect(x, p.cy - 55, 16, 110, 8);
      c.fill();
      c.shadowBlur = 0;
    }
    if (state.ball) {
      const b = state.ball;
      if (b.trail.length > 1) {
        c.strokeStyle = "rgba(255,255,255,.22)";
        c.lineWidth = 7;
        c.beginPath();
        c.moveTo(b.trail[0].x, b.trail[0].y);
        for (const t of b.trail.slice(1)) c.lineTo(t.x, t.y);
        c.stroke();
      }
      c.fillStyle = "#fff6b2";
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 24;
      c.beginPath();
      c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
    if (
      ["playing", "countdown", "paused", "matchover"].includes(state.screen)
    ) {
      c.fillStyle = "#e8f2ff";
      c.font = "700 54px system-ui, sans-serif";
      c.textAlign = "center";
      c.fillText(String(state.score.p1).padStart(2, "0"), 540, 84);
      c.fillText(String(state.score.p2).padStart(2, "0"), 740, 84);
      c.font = "600 16px system-ui, sans-serif";
      c.fillStyle = "#90a9c5";
      c.fillText(
        state.mode === "solo" ? "SOLO // RALLY" : "VERSUS // RALLY",
        FIELD_CX,
        38,
      );
    }
    if (state.screen === "countdown" && state.ball) {
      c.fillStyle = "#9bb4cf";
      c.font = "600 20px system-ui, sans-serif";
      c.fillText(
        `SERVE IN ${Math.max(0, state.ball.holdTimer).toFixed(1)}`,
        FIELD_CX,
        650,
      );
    }
    if (menuLength(state.screen)) drawMenu(c, state);
  },
};
function drawMenu(
  c: CanvasRenderingContext2D,
  s: DeepReadonly<CaromState>,
): void {
  c.fillStyle = "rgba(5,10,20,.78)";
  c.fillRect(260, 90, 760, 560);
  c.textAlign = "center";
  c.fillStyle = "#f4f7ff";
  c.font = "900 76px system-ui, sans-serif";
  c.fillText(
    s.screen === "title"
      ? TITLE_TEXT
      : s.screen === "howto"
        ? "HOW TO PLAY"
        : s.screen === "paused"
          ? "PAUSED"
          : `${s.winner === "left" ? "PLAYER ONE" : "PLAYER TWO"} WINS`,
    FIELD_CX,
    220,
  );
  if (s.screen === "howto") {
    c.fillStyle = "#aec1d8";
    c.font = "500 20px system-ui, sans-serif";
    c.fillText("W / S or ↑ / ↓ move paddles", FIELD_CX, 300);
    c.fillText("Moving through contact adds spin", FIELD_CX, 334);
    c.fillText("Bank shots off the amber obstacles", FIELD_CX, 368);
  }
  const items =
    s.screen === "title"
      ? TITLE_ITEMS
      : s.screen === "howto"
        ? ["BACK TO TITLE"]
        : s.screen === "paused"
          ? PAUSE_ITEMS
          : MATCHOVER_ITEMS;
  c.font = "700 23px system-ui, sans-serif";
  items.forEach((item, i) => {
    const r = menuRect(s.screen, i);
    if (r) {
      c.fillStyle = i === s.menuIndex ? "#52e0c4" : "#8298b2";
      c.fillText(
        i === s.menuIndex ? `›  ${item}  ‹` : item,
        FIELD_CX,
        r.y + 31,
      );
    }
  });
}
