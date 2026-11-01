import { useState } from "react";
import { StationList } from "./components/StationList";
import { StationDetail } from "./components/StationDetail";
import { LaneDetail } from "./components/LaneDetail";
export function SiteManagement() {
    const [view, setView] = useState({ type: "list" });
    if (view.type === "station") {
        return (<StationDetail station={view.station} onBack={() => setView({ type: "list" })} onViewLane={lane => setView({ type: "lane", station: view.station, lane })}/>);
    }
    if (view.type === "lane") {
        return (<LaneDetail station={view.station} lane={view.lane} onBackToList={() => setView({ type: "list" })} onBackToStation={() => setView({ type: "station", station: view.station })}/>);
    }
    return <StationList onView={station => setView({ type: "station", station })}/>;
}
