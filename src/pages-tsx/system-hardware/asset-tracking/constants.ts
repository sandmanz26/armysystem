export const PER_PAGE = 10;

export const TABS = ["RFID Map", "Asset List"] as const;

export const rooms = [
  { x: 870, y: 320, w: 260, h: 220, label: "WPT 06" },
  { x: 1130, y: 320, w: 260, h: 220, label: "WPT 05" },
  { x: 350, y: 560, w: 260, h: 220, label: "WPT 01" },
  { x: 610, y: 560, w: 260, h: 220, label: "WPT 02" },
  { x: 870, y: 560, w: 260, h: 220, label: "WPT 03" },
  { x: 1130, y: 560, w: 260, h: 220, label: "WPT 04" },
];

export const rfidMarkers = [
  { x: 940, y: 340 }, { x: 980, y: 340 }, { x: 1020, y: 340 },
  { x: 1200, y: 340 }, { x: 1240, y: 340 }, { x: 1280, y: 340 },
];

export const alertMarkers = [
  { x: 600, y: 540 }, { x: 1120, y: 540 },
];
