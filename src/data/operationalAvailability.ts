// ── Types ─────────────────────────────────────────────────────────────────────

export interface Lane {
  lane: string;
  uptime: string;   // formatted e.g. "0m 19s"
  downtime: string;
}

export interface Device {
  id: string;
  name: string;
  totalUptime: string;
  totalDowntime: string;
  lanes: Lane[];
}

export interface OABooking {
  id: string;
  bookingRef: string;
  name: string;
  courseware: string;
  ot: string;
  dt: string;
  devices: Device[];
}

export interface OAMonth {
  id: string;
  month: string;           // "April 2026"
  totalOT: string;
  totalDT: string;
  availability: number;    // percentage 0–100
  bookings: OABooking[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const makeLanes = (count: number, uptime: string, downtime: string): Lane[] =>
  Array.from({ length: count }, (_, i) => ({
    lane: `Lane ${i + 1}`,
    uptime,
    downtime,
  }));

export const oaMonths: OAMonth[] = [
  {
    id: "apr-2026",
    month: "April 2026",
    totalOT: "3017m 54s",
    totalDT: "2434m 7s",
    availability: 19.34,
    bookings: [
      {
        id: "bk-ptc020",
        bookingRef: "#260430-PTC020",
        name: "WPT Group Training for Unit Testing",
        courseware: "CW-WPT-001",
        ot: "3m 10s",
        dt: "0m 0s",
        devices: [
          {
            id: "trx-01",
            name: "WPT-01",
            totalUptime: "3m 10s",
            totalDowntime: "0m 0s",
            lanes: makeLanes(10, "0m 19s", "0m 0s"),
          },
        ],
      },
      {
        id: "bk-ptc019",
        bookingRef: "#260430-PTC019",
        name: "WPT Group Training for Unit 3004",
        courseware: "CW-WPT-002",
        ot: "16m 48s",
        dt: "0m 0s",
        devices: [
          {
            id: "trx-06",
            name: "WPT-06",
            totalUptime: "16m 48s",
            totalDowntime: "0m 0s",
            lanes: makeLanes(8, "2m 6s", "0m 0s"),
          },
        ],
      },
      {
        id: "bk-ptc018",
        bookingRef: "#260430-PTC018",
        name: "WPT Group Training for Unit Aldi 29",
        courseware: "CW-WPT-003",
        ot: "35m 6s",
        dt: "0m 0s",
        devices: [
          {
            id: "trx-03",
            name: "WPT-03",
            totalUptime: "35m 6s",
            totalDowntime: "0m 0s",
            lanes: makeLanes(6, "5m 51s", "0m 0s"),
          },
        ],
      },
      {
        id: "bk-ptc017",
        bookingRef: "#260429-PTC017",
        name: "Basic Infantry Marksmanship Training",
        courseware: "CW-BIM-004",
        ot: "120m 0s",
        dt: "45m 30s",
        devices: [
          {
            id: "trx-02",
            name: "WPT-02",
            totalUptime: "75m 0s",
            totalDowntime: "45m 0s",
            lanes: makeLanes(10, "7m 30s", "4m 30s"),
          },
          {
            id: "trx-04",
            name: "WPT-04",
            totalUptime: "120m 0s",
            totalDowntime: "0m 30s",
            lanes: makeLanes(10, "12m 0s", "0m 3s"),
          },
        ],
      },
    ],
  },
  {
    id: "mar-2026",
    month: "March 2026",
    totalOT: "2880m 0s",
    totalDT: "144m 0s",
    availability: 95.0,
    bookings: [
      {
        id: "bk-ptc015",
        bookingRef: "#260331-PTC015",
        name: "WPT Group Training Batch A",
        courseware: "CW-WPT-001",
        ot: "120m 0s",
        dt: "12m 0s",
        devices: [
          {
            id: "trx-02",
            name: "WPT-02",
            totalUptime: "108m 0s",
            totalDowntime: "12m 0s",
            lanes: makeLanes(10, "10m 48s", "1m 12s"),
          },
        ],
      },
      {
        id: "bk-ptc014",
        bookingRef: "#260328-PTC014",
        name: "Advanced Rifle Qualification",
        courseware: "CW-ARQ-005",
        ot: "240m 0s",
        dt: "0m 0s",
        devices: [
          {
            id: "trx-05",
            name: "WPT-05",
            totalUptime: "240m 0s",
            totalDowntime: "0m 0s",
            lanes: makeLanes(10, "24m 0s", "0m 0s"),
          },
        ],
      },
    ],
  },
  {
    id: "feb-2026",
    month: "February 2026",
    totalOT: "1300m 45s",
    totalDT: "195m 10s",
    availability: 85.0,
    bookings: [
      {
        id: "bk-ptc010",
        bookingRef: "#260228-PTC010",
        name: "Recruit Basic Marksmanship",
        courseware: "CW-RBM-002",
        ot: "480m 0s",
        dt: "60m 0s",
        devices: [
          {
            id: "trx-01",
            name: "WPT-01",
            totalUptime: "420m 0s",
            totalDowntime: "60m 0s",
            lanes: makeLanes(10, "42m 0s", "6m 0s"),
          },
        ],
      },
    ],
  },
  {
    id: "jan-2026",
    month: "January 2026",
    totalOT: "1480m 0s",
    totalDT: "44m 24s",
    availability: 97.0,
    bookings: [
      {
        id: "bk-ptc005",
        bookingRef: "#260131-PTC005",
        name: "Combat Qualification Exercise",
        courseware: "CW-CQX-001",
        ot: "360m 0s",
        dt: "10m 0s",
        devices: [
          {
            id: "trx-07",
            name: "WPT-07",
            totalUptime: "350m 0s",
            totalDowntime: "10m 0s",
            lanes: makeLanes(8, "43m 45s", "1m 15s"),
          },
        ],
      },
    ],
  },
];
