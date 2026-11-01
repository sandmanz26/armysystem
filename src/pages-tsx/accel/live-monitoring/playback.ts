/* Per-camera playback state. Lifted to the page so a selection of cameras can be scrubbed together. */
export interface Playback {
  paused: boolean;
  /** Seconds behind live. 0 = live. */
  behind: number;
  muted: boolean;
  speed: string;
}
export const LIVE_PLAYBACK: Playback = { paused: false, behind: 0, muted: true, speed: "1" };
export const isLive = (p: Playback) => !p.paused && p.behind === 0;
