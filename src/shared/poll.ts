/**
 * The poll both surfaces arm.
 *
 * It is chain-armed (`setTimeout`, not `setInterval`) so a slow load cannot
 * stack requests, and it exists only while the surface is enabled and the view
 * may still move. The surface owns what "active" means, so a busy job, a
 * running workflow and a queued run all arm it through the same helper.
 */
export interface Poller {
  /** Arm one tick if enabled and active; replaces any tick already waiting. */
  arm: () => void;
  /** Drop the waiting tick, without arming another. */
  stop: () => void;
}

export interface PollOptions {
  delayMs: number;
  enabled: () => boolean;
  active: () => boolean;
  onTick: () => void;
}

export function createPoller(options: PollOptions): Poller {
  let timer: number | null = null;

  const stop = (): void => {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  const arm = (): void => {
    stop();
    if (!options.enabled() || !options.active()) return;
    timer = window.setTimeout(() => {
      timer = null;
      options.onTick();
    }, options.delayMs);
  };

  return { arm, stop };
}
