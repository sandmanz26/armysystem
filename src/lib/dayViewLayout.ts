// Shared layout engine for the Booking List day-view calendar (WPT, MST, TCT
// all render bookings this way — see booking/list and booking/mst-list
// DailyView components). A booking occupies its full start-end time range
// (not just its starting hour), and bookings that overlap in time render as
// side-by-side columns instead of stacking vertically.

export interface TimeRange {
  /** Minutes from the view's start hour (e.g. 8 AM = 0). */
  startMin: number;
  endMin: number;
}

export interface LaidOutBlock<T> extends TimeRange {
  item: T;
  /** 0-indexed column within this block's overlap cluster. */
  col: number;
  /** Total columns needed by this block's overlap cluster. */
  cols: number;
}

/** Parses "8:00 AM - 12:00 PM" (optionally embedded in a longer string) into
 *  minutes-from-`dayStartHour`. Returns null if no time range is found. */
export function parseTimeRange(bookingTime: string, dayStartHour = 8): TimeRange | null {
  const m = bookingTime.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/
  );
  if (!m) return null;

  const to24 = (h: string, min: string, period: string) => {
    let hour = parseInt(h, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + parseInt(min, 10);
  };

  const startAbs = to24(m[1], m[2], m[3]);
  let endAbs = to24(m[4], m[5], m[6]);
  if (endAbs <= startAbs) endAbs += 24 * 60; // overnight edge case

  const dayStartMin = dayStartHour * 60;
  return { startMin: startAbs - dayStartMin, endMin: endAbs - dayStartMin };
}

/** Assigns each block a column + cluster column-count so overlapping bookings
 *  render side by side. Blocks that don't overlap anything always get
 *  `cols: 1`. Uses the standard sweep: group blocks into maximal clusters of
 *  transitively-overlapping blocks, then greedily pack each cluster into the
 *  fewest columns (reusing a column once its previous occupant has ended). */
export function layoutOverlappingBlocks<T>(blocks: (TimeRange & { item: T })[]): LaidOutBlock<T>[] {
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const result: LaidOutBlock<T>[] = [];

  let cluster: typeof sorted = [];
  let clusterMaxEnd = -Infinity;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const colEnds: number[] = [];
    const withCols: LaidOutBlock<T>[] = cluster.map((b) => {
      let col = colEnds.findIndex((end) => end <= b.startMin);
      if (col === -1) { col = colEnds.length; colEnds.push(b.endMin); }
      else colEnds[col] = b.endMin;
      return { ...b, col, cols: 0 };
    });
    const cols = colEnds.length;
    withCols.forEach((w) => { w.cols = cols; });
    result.push(...withCols);
    cluster = [];
  };

  for (const b of sorted) {
    if (cluster.length > 0 && b.startMin >= clusterMaxEnd) {
      flushCluster();
      clusterMaxEnd = -Infinity;
    }
    cluster.push(b);
    clusterMaxEnd = Math.max(clusterMaxEnd, b.endMin);
  }
  flushCluster();

  return result;
}
