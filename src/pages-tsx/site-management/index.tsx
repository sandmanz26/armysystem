import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { type View } from "./constants";
import { StationList } from "./components/StationList";
import { StationDetail } from "./components/StationDetail";
import { LaneDetail } from "./components/LaneDetail";

export function SiteManagement() {
  const [view, setView] = useState<View>({ type: "list" });
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = searchParams.get("view");

  /*
   * The header breadcrumb is path-driven, so the station view is mirrored into
   * `?view=station` (Header shows "Site Management › Base Station Details"). Lane
   * Details keeps `?view=lane` and its own in-page breadcrumb. Clicking the
   * "Site Management" crumb drops the param, which returns here to the list.
   */
  useEffect(() => {
    const wanted = view.type === "list" ? null : view.type;
    if (wanted === urlView) return;
    if (!urlView && view.type !== "list") {
      setView({ type: "list" });
      return;
    }
    if (wanted) setSearchParams({ view: wanted }, { replace: true });
    else setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView]);

  const go = (next: View) => {
    setView(next);
    if (next.type === "list") setSearchParams({}, { replace: true });
    else setSearchParams({ view: next.type }, { replace: true });
  };

  /*
   * Figma's `Lane Details` (5115:215602) is a PAGE, not a panel: its own page
   * header (`Lane 1` + status badge + Delete Lane / Deactivate Lane) under the
   * breadcrumb `Site Management › Base Station Details › Lane Details`.
   *
   * These used to render stacked — StationDetail stayed mounted with LaneDetail
   * below it — so the screen carried two <h1>s, two breadcrumbs and two tables
   * at once, and `WPT-01` sat above a page whose own title is `Lane 1`.
   */
  if (view.type === "lane") {
    return (
      <LaneDetail
        station={view.station}
        lane={view.lane}
        onBackToStation={() => go({ type: "station", station: view.station })}
        onBackToList={() => go({ type: "list" })}
      />
    );
  }

  if (view.type === "station") {
    return (
      <StationDetail
        station={view.station}
        onBack={() => go({ type: "list" })}
        onViewLane={lane => go({ type: "lane", station: view.station, lane })}
      />
    );
  }

  return <StationList onView={station => go({ type: "station", station })} />;
}
