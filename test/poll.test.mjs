import assert from "node:assert/strict";
import test from "node:test";

import { createPoller } from "../build/poll.mjs";

/** A controllable `window` so the timer can be inspected and fired by hand. */
function fakeTimers() {
  const timers = new Map();
  let next = 1;
  return {
    window: {
      setTimeout(callback, delay) {
        const id = next;
        next += 1;
        timers.set(id, { callback, delay });
        return id;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
    },
    pending: () => [...timers.values()],
    fire: () => {
      const waiting = [...timers.values()];
      timers.clear();
      for (const timer of waiting) timer.callback();
    },
  };
}

function withWindow(timers, run) {
  const previous = globalThis.window;
  globalThis.window = timers.window;
  try {
    return run();
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test("arm schedules one tick with the configured delay", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let ticks = 0;
    const poller = createPoller({
      delayMs: 30_000,
      enabled: () => true,
      active: () => true,
      onTick: () => {
        ticks += 1;
      },
    });
    poller.arm();
    assert.equal(timers.pending().length, 1);
    assert.equal(timers.pending()[0].delay, 30_000);
    timers.fire();
    assert.equal(ticks, 1);
    // The timer does not re-arm itself; the next load arms it again.
    assert.equal(timers.pending().length, 0);
  });
});

test("re-arming replaces the waiting tick instead of stacking one", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let ticks = 0;
    const poller = createPoller({
      delayMs: 1000,
      enabled: () => true,
      active: () => true,
      onTick: () => {
        ticks += 1;
      },
    });
    poller.arm();
    poller.arm();
    poller.arm();
    assert.equal(timers.pending().length, 1, "only one tick waits");
    timers.fire();
    assert.equal(ticks, 1);
  });
});

test("arm does nothing while auto-refresh is off", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let ticks = 0;
    const poller = createPoller({
      delayMs: 1000,
      enabled: () => false,
      active: () => true,
      onTick: () => {
        ticks += 1;
      },
    });
    poller.arm();
    assert.equal(timers.pending().length, 0);
    timers.fire();
    assert.equal(ticks, 0);
  });
});

test("arm does nothing while the view is idle", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let ticks = 0;
    const poller = createPoller({
      delayMs: 1000,
      enabled: () => true,
      active: () => false,
      onTick: () => {
        ticks += 1;
      },
    });
    poller.arm();
    assert.equal(timers.pending().length, 0);
    timers.fire();
    assert.equal(ticks, 0);
  });
});

test("stop drops the waiting tick", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let ticks = 0;
    const poller = createPoller({
      delayMs: 1000,
      enabled: () => true,
      active: () => true,
      onTick: () => {
        ticks += 1;
      },
    });
    poller.arm();
    poller.stop();
    assert.equal(timers.pending().length, 0);
    timers.fire();
    assert.equal(ticks, 0);
  });
});

test("enabled and active are read at arm time, not at creation", () => {
  const timers = fakeTimers();
  withWindow(timers, () => {
    let enabled = false;
    let active = false;
    const poller = createPoller({
      delayMs: 1000,
      enabled: () => enabled,
      active: () => active,
      onTick: () => undefined,
    });
    poller.arm();
    assert.equal(timers.pending().length, 0);
    enabled = true;
    active = true;
    poller.arm();
    assert.equal(timers.pending().length, 1);
  });
});
