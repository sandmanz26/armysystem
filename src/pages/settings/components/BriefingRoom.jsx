import { BRIEFING_ROOMS } from "../constants";
import { RoomTable } from "./RoomTable";
export function BriefingRoom() {
    return <RoomTable title="Briefing Room" addLabel="Add Briefing Room" rows={BRIEFING_ROOMS}/>;
}
