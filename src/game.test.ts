import { describe, expect, it } from "vitest";
import { game } from "./game";

async function harness() {
  const actions = new Map<string, number>();
  const edges = new Set<string>();
  const audioMuted = { value: false };
  const api = {
    input: {
      register() {},
      value: (name: string) => actions.get(name) ?? 0,
      pressed: (name: string) => edges.delete(name),
      pointer: () => ({
        x: 0,
        y: 0,
        down: false,
        device: "mouse" as const,
        buttons: [],
      }),
      pointerPressed: () => false,
      pointerReleased: () => false,
      pointerSamples: () => [],
      pointerContacts: () => [],
      wheel: () => ({ x: 0, y: 0 }),
    },
    audio: {
      define() {},
      play() {},
      loop() {},
      stop() {},
      looping: () => false,
      setMuted: (muted: boolean) => {
        audioMuted.value = muted;
      },
      muted: () => audioMuted.value,
    },
    diagnostics: { register() {} },
  };
  const [state, debug] = await game.initialize({
    ...api,
    assets: {},
    events: {},
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  } as never);
  return { state, debug, api, actions, edges };
}

describe("Carom simulation", () => {
  it("starts with a complete title-screen world", async () => {
    const { state, debug } = await harness();
    const snap = debug.snapshot(state);
    expect(snap.screen).toBe("title");
    expect(snap.ball?.held).toBe(true);
    expect(snap.obstacles).toHaveLength(2);
    expect(snap.paddles.left.cy).toBe(360);
  });

  it("serves after the hold and advances in logical units", async () => {
    const { state, debug, api } = await harness();
    let next = debug.setScreen(state, "countdown");
    next = debug.setBallServeSign(next, 1);
    next = game.update(next, api as never, 1);
    expect(next.screen).toBe("playing");
    expect(next.ball?.held).toBe(false);
    expect(next.ball?.vx).toBeLessThan(0);
    expect(next.ball?.vy).toBeGreaterThan(0);
  });

  it("moves and clamps a debug-driven paddle", async () => {
    const { state, debug, api } = await harness();
    let next = debug.setScreen(state, "playing");
    next = debug.setPaddleDriven(next, "left", true);
    next = debug.setPaddleVy(next, "left", -1000);
    next = game.update(next, api as never, 1);
    expect(next.paddles.left.cy).toBe(55);
    expect(next.paddles.left.vy).toBe(-305);
  });
});
