import type { BriefingRoom } from "@/data/briefingRooms";

export type { BriefingRoom };

export interface BriefingRoomRow extends BriefingRoom {
  _idx: number;
}
