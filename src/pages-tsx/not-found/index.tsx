import { useLocation, useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";

/**
 * Shown for any URL with no route.
 *
 * The app previously sent every unmatched path to `/bookings/list`, which made
 * a broken menu item indistinguishable from a working one — clicking
 * "User Management" landed you on Booking List with no error, so the missing
 * route looked like a UI bug. Failing visibly is the point of this page.
 */
export function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center bg-main-background p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-default">
          <FileQuestion size={24} className="text-disabled" />
        </div>
        <h1 className="text-xl font-semibold text-default">This page doesn&rsquo;t exist yet</h1>
        <p className="text-sm text-body">
          Nothing is routed at <span className="font-medium text-default">{pathname}</span>. It is
          either a menu entry whose page hasn&rsquo;t been built, or a mistyped link.
        </p>
        <button
          type="button"
          onClick={() => navigate("/bookings/list")}
          className="mt-2 h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
        >
          Go to Booking List
        </button>
      </div>
    </div>
  );
}
