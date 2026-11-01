export type Tab = "Training Performance" | "Nominal Roll" | "Detail List" | "Leaderboard";

export interface Segment {
  label: string;
  pct: number;
  count: number;
  color: string;
  bg: string;
  text: string;
  border: string;
}

export interface Trainee {
  no: number;
  rank: string;
  name: string;
  svcId: string;
  weapon: string;
  station: string;
  detail: string;
  lane: string;
  performance: string;
  courseResults: string;
  resultLabel: string;
  mpi: number;
}

export interface DetailEntry {
  id: string;
  traineesCount: number;
  weapon: string;
  lane: string;
  avgScore: string;
}

export interface TrainingDetailData {
  program: string;
  bookingId: string;
  createdOn: string;
  session: string;
  courseware: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalTrainees: number;
  segments: Segment[];
  trainees: Trainee[];
  details: DetailEntry[];
}
