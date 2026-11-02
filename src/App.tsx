// v2
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { Login } from "@/pages-tsx/Login";
import { DesignTokenInspector } from "@/components/dev/DesignTokenInspector";
import { AnnotationTool } from "@/components/dev/AnnotationTool";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages-tsx/dashboard";
import { TodaysBooking2 } from "@/pages-tsx/booking-2/today";
import { BookingList2 } from "@/pages-tsx/booking-2/list";
import { CreateBooking2 } from "@/pages-tsx/booking-2/create";
import { Onboarding2 } from "@/pages-tsx/booking-2/onboarding";
import { BookingDetail2 } from "@/pages-tsx/booking-2/detail";
import { OngoingSessionPage } from "@/pages-tsx/booking-2/ongoing-session";
import { TrainingResults } from "@/pages-tsx/training-results";
import { IconLibrary } from "@/pages-tsx/icon-library";
import { TrmComplexCase } from "@/pages-tsx/trm-complex-case";
import { AssetMovementReport } from "@/pages-tsx/reports/asset-movement";
import { StockTakeVarianceReport } from "@/pages-tsx/reports/stock-take";
import { StockTakeScanPage, StockTakeReportDetailPage } from "@/pages-tsx/reports/stock-take/detail";
import { AssetsAuditReport } from "@/pages-tsx/reports/asset-audit";
import { UserList } from "@/pages-tsx/user-management/list";
import { NotFound } from "@/pages-tsx/not-found";
import { UserRole } from "@/pages-tsx/user-management/user-role";
import { RolePermission } from "@/pages-tsx/user-management/role-permission";
import { RankPage } from "@/pages-tsx/user-management/rank";
import { SiteManagement } from "@/pages-tsx/site-management";
import { ZoneManagement } from "@/pages-tsx/site-management/zone-management";
import { CabinManagement } from "@/pages-tsx/site-management/cabin-management";
import { SHMDashboard } from "@/pages-tsx/system-hardware/dashboard";
import { AssetsList } from "@/pages-tsx/system-hardware/assets-list";
import { AssignmentList } from "@/pages-tsx/system-hardware/assignment-list";
import { AssignmentDetail } from "@/pages-tsx/system-hardware/assignment-detail";
import { AssetType } from "@/pages-tsx/system-hardware/asset-type";
import { BriefingRoom } from "@/pages-tsx/briefing-room";
import { AssetCategory } from "@/pages-tsx/system-hardware/asset-category";
import { AssetTracking } from "@/pages-tsx/system-hardware/asset-tracking";
import { SystemHardwareManagementHome } from "@/pages-tsx/system-hardware-management";
import { RFIDReaderListing } from "@/pages-tsx/system-hardware/rfid";
import { AntennaListing } from "@/pages-tsx/system-hardware/antenna-listing";
import { SystemHealth } from "@/pages-tsx/system-health";
import { OperationalAvailability } from "@/pages-tsx/operational-availability";
import { OperationalAvailability2 } from "@/pages-tsx/operational-availability/v2";
import { OperationalAvailability2Detail } from "@/pages-tsx/operational-availability/v2/detail";
import { OperationalAvailabilityMonth } from "@/pages-tsx/operational-availability/month";
import { OperationalAvailabilityDetail } from "@/pages-tsx/operational-availability/detail";
import { SystemMaintenance } from "@/pages-tsx/system-maintenance";
import { DataExport } from "@/pages-tsx/data-management/export";
import { DataImport } from "@/pages-tsx/data-management/import";
import { ActivityLog } from "@/pages-tsx/activity-log";
import { Settings } from "@/pages-tsx/settings";
import { TrainingDetail } from "@/pages-tsx/training-results/detail";
import { UserDetail } from "@/pages-tsx/user-management/user-detail";
import { ResourcePlanning } from "@/pages-tsx/resource-planning";
import { Accel } from "@/pages-tsx/accel";
import { CreateAssignment } from "@/pages-tsx/system-hardware/create-assignment";
import { CreateAssignment2 } from "@/pages-tsx/booking-2/create-assignment";
import { IssueAssets2 } from "@/pages-tsx/booking-2/issue-assets";
import { IssueAssets } from "@/pages-tsx/system-hardware/issue-assets";
import { SidebarV2 } from "@/components/layout/SidebarV2";
import { SidebarV3 } from "@/components/layout/SidebarV3";
import { SidebarSuper } from "@/components/layout/SidebarSuper";
import { Notifications } from "@/pages-tsx/notifications";
import { AssetDetail } from "@/pages-tsx/system-hardware/asset-detail";
import { BookingListRev1 } from "@/pages-tsx/revision/BookingListRev1";
import { BookingList as MSTBookingList } from "@/pages-tsx/booking/mst-list";
import { CreateBooking as MSTCreateBooking } from "@/pages-tsx/booking/mst-create";
import { MSTCreatedToast } from "@/pages-tsx/booking/mst-create/createdToast";
import { BookingDetail as MSTBookingDetail } from "@/pages-tsx/booking/mst-detail";
import { MSTTCTPlatformType, MSTTCTCallSign, MSTTCTRole, MSTTCTVehicle } from "@/pages-tsx/booking/mst-tct-master-data";

// Extracted Layout Components
import { VersionFooter } from "@/components/layout/VersionFooter";
import { DevToolbar, type NavVer, type AppVersion, type NavStructure } from "@/components/layout/DevToolbar";

const THEMED_BG: Partial<Record<NavVer, string>> = {
  v4: "bg-[#1A3A6B]",
  v5: "bg-[#1E4A2E]",
  v6: "bg-[#334155]",
  v7: "bg-[#0F172A]",
};

// ── Layout Wrapper to provide Sidebar, Header, and common controls ──
// Menu entries that open a separate app in a new browser tab instead of routing in place.
const NEW_TAB_PATHS = ["/accel"];

function MainLayout({ children }: { children: React.ReactNode }) {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigate = (path: string) => {
    if (NEW_TAB_PATHS.includes(path)) {
      window.open(path, "_blank", "noopener");
      return;
    }
    routerNavigate(path);
  };

  const [navVersion, setNavVersion] = useState<NavVer>(
    () => (localStorage.getItem("toms_nav") as NavVer) ?? "v2",
  );
  const [appVersion, setAppVersion] = useState<AppVersion>(
    () => (localStorage.getItem("toms_version") as AppVersion) ?? "beta",
  );
  const [navStructure, setNavStructure] = useState<NavStructure>(
    () => (localStorage.getItem("toms_structure") as NavStructure) ?? "super",
  );

  useEffect(() => {
    const h1 = () => setNavVersion((localStorage.getItem("toms_nav") as NavVer) ?? "v2");
    const h2 = () => setAppVersion((localStorage.getItem("toms_version") as AppVersion) ?? "beta");
    const h3 = () => setNavStructure((localStorage.getItem("toms_structure") as NavStructure) ?? "super");
    window.addEventListener("toms_nav_change",       h1);
    window.addEventListener("toms_version_change",   h2);
    window.addEventListener("toms_structure_change", h3);
    return () => {
      window.removeEventListener("toms_nav_change",       h1);
      window.removeEventListener("toms_version_change",   h2);
      window.removeEventListener("toms_structure_change", h3);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    routerNavigate("/login");
  };

  const getSidebarPath = () => {
    if (currentPath.startsWith("/operational-availability-2"))
      return "/operational-availability-2";
    if (currentPath.startsWith("/operational-availability"))
      return "/operational-availability";
    if (currentPath.startsWith("/reports/stock-take"))
      return "/reports/stock-take";
    if (currentPath === "/bookings/detail") return "/bookings/list";
    if (currentPath === "/bookings/detail") return "/bookings/list";
    if (currentPath === "/bookings/mst/detail") return "/bookings/mst";
    if (currentPath === "/bookings/mst/create") return "/bookings/mst";
    if (currentPath === "/bookings/tct/create") return "/bookings/tct";
    if (currentPath === "/training-results/detail") return "/training-results";
    if (currentPath === "/training-results-2/detail") return "/training-results-2";
    return currentPath;
  };

  const makeSidebar = (activePath: string) => {
    if (navStructure === "super")
      return (
        <SidebarSuper
          currentPath={activePath}
          onNavigate={navigate}
          onLogout={handleLogout}
          appVersion={appVersion}
          navVersion={navVersion}
        />
      );
    if (navVersion === "v2")
      return (
        <SidebarV2
          key={appVersion}
          currentPath={activePath}
          onNavigate={navigate}
          onLogout={handleLogout}
          appVersion={appVersion}
        />
      );
    if (navVersion === "v3")
      return (
        <SidebarV3
          key={appVersion}
          currentPath={activePath}
          onNavigate={navigate}
          onLogout={handleLogout}
          appVersion={appVersion}
        />
      );
    if (navVersion in THEMED_BG)
      return (
        <SidebarV3
          key={appVersion}
          currentPath={activePath}
          onNavigate={navigate}
          onLogout={handleLogout}
          bgColor={THEMED_BG[navVersion]}
          appVersion={appVersion}
        />
      );
    return <Sidebar currentPath={activePath} onNavigate={navigate} />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {makeSidebar(getSidebarPath())}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onNavigate={navigate} />
        {children}
      </div>
      <DevToolbar />
      <VersionFooter />
    </div>
  );
}

// ── Higher-Order Component to pass `onNavigate` directly to pages ──
function WithNavigate({ Component, ...rest }: { Component: React.ElementType; [key: string]: unknown }) {
  const navigate = useNavigate();
  return <Component onNavigate={navigate} {...rest} />;
}

// ── Page specific wrappers for URL params ──
function AssetDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <AssetDetail assetId={id!} onNavigate={navigate} />;
}

function StockTakeDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <StockTakeScanPage reportId={id!} onNavigate={navigate} />;
}

function StockTakeReportDetailWrapper() {
  const { id } = useParams();
  return <StockTakeReportDetailPage reportId={id!} />;
}

function OperationalAvailabilityMonthWrapper() {
  const { monthId } = useParams();
  const navigate = useNavigate();
  return (
    <OperationalAvailabilityMonth monthId={monthId!} onNavigate={navigate} />
  );
}

function OperationalAvailabilityDetailWrapper() {
  const { monthId, bookingId } = useParams();
  const navigate = useNavigate();
  return (
    <OperationalAvailabilityDetail
      monthId={monthId!}
      bookingId={bookingId!}
      onNavigate={navigate}
    />
  );
}

// ── Auth Route Protection ──
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  // We use localStorage for auth state in this router setup to persist across refreshes
  return (
    <BrowserRouter>
      <DesignTokenInspector />
      <AnnotationTool />
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                localStorage.setItem("isLoggedIn", "true");
                // Figma "Login Successful" (5029:123620): lands on the Dashboard + success toast.
                window.location.href = "/dashboard";
              }}
            />
          }
        />

        {/* Full screen pages (no layout) */}

        {/* Booking 2.0 — isolated from /bookings/* above; see src/pages-tsx/booking-2 */}
        <Route
          path="/bookings/create"
          element={
            <ProtectedRoute>
              <CreateBooking2
                onClose={() => (window.location.href = "/bookings/list")}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding2 onClose={() => (window.location.href = "/bookings/list")} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/session"
          element={
            <ProtectedRoute>
              <WithNavigate Component={OngoingSessionPage} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/detail"
          element={
            <ProtectedRoute>
              <WithNavigate Component={BookingDetail2} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-hardware/create-assignment"
          element={
            <ProtectedRoute>
              <WithNavigate Component={CreateAssignment} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/assignments/new"
          element={
            <ProtectedRoute>
              <WithNavigate Component={CreateAssignment} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/assignments/new"
          element={
            <ProtectedRoute>
              <WithNavigate Component={CreateAssignment2} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/issue-assets"
          element={
            <ProtectedRoute>
              <WithNavigate Component={IssueAssets2} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-hardware/issue-assets"
          element={
            <ProtectedRoute>
              <WithNavigate Component={IssueAssets} />
            </ProtectedRoute>
          }
        />

        {/* Layout pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* /dashboard-v2 retired — its Range view was ported into /dashboard. */}
        <Route path="/dashboard-v2" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/bookings"
          element={<Navigate to="/bookings/list" replace />}
        />
        {/* Sidebar parent entry — every sidebar points the User Management icon
            at "/user-management", which had no route, so the catch-all silently
            bounced it to Booking List and the menu looked broken. */}
        <Route
          path="/user-management"
          element={<Navigate to="/user-management/user-list" replace />}
        />
        <Route
          path="/bookings"
          element={<Navigate to="/bookings/list" replace />}
        />
        <Route
          path="/bookings/today"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TodaysBooking2} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/list"
          element={
            <ProtectedRoute>
              <WithNavigate Component={BookingList2} createPath="/bookings/create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/mst"
          element={
            <ProtectedRoute>
              <WithNavigate Component={MSTBookingList} createPath="/bookings/mst/create" program="MST" />
              {/* "Booking created successfully" after MST Create Booking → Confirm (Figma 6183:504775) */}
              <MSTCreatedToast />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/tct"
          element={
            <ProtectedRoute>
              <WithNavigate Component={MSTBookingList} createPath="/bookings/tct/create" program="TCT" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/mst-tct/platform-type"
          element={
            <ProtectedRoute>
              <MSTTCTPlatformType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/mst-tct/call-sign"
          element={
            <ProtectedRoute>
              <MSTTCTCallSign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/mst-tct/role"
          element={
            <ProtectedRoute>
              <MSTTCTRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/mst-tct/vehicle"
          element={
            <ProtectedRoute>
              <MSTTCTVehicle />
            </ProtectedRoute>
          }
        />
        {/* MST/TCT Create — fullscreen, no layout shell */}
        <Route
          path="/bookings/mst/create"
          element={
            <ProtectedRoute>
              <MSTCreateBooking
                defaultProgram="MST"
                onClose={() => (window.location.href = "/bookings/mst")}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/tct/create"
          element={
            <ProtectedRoute>
              <MSTCreateBooking
                defaultProgram="TCT"
                onClose={() => (window.location.href = "/bookings/tct")}
              />
            </ProtectedRoute>
          }
        />
        {/* MST/TCT Detail */}
        <Route
          path="/bookings/mst/detail"
          element={
            <ProtectedRoute>
              <MSTBookingDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training-results"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TrainingResults} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-results/mst"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TrainingResults} program="MST" detailPath="/training-results-2/detail" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-results/tct"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TrainingResults} program="TCT" detailPath="/training-results-2/detail" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-results/detail"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TrainingDetail} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-results-2"
          element={
            <ProtectedRoute>
              <WithNavigate Component={TrainingResults} detailPath="/training-results-2/detail" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training-results-2/detail"
          element={
            <ProtectedRoute>
              {/* Was TrainingDetail2 (detail2/) — an un-refactored duplicate whose
                  courseware selector never actually switched the trainee/segment
                  data, only the label. TrainingDetail (detail/) is the one built
                  from Figma's Multiple-CW frame (5839:44906) with a real
                  per-courseware Courseware[] model; reused here instead of
                  keeping two parallel pages in sync by hand. */}
              <WithNavigate Component={TrainingDetail} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/icon-library"
          element={
            <ProtectedRoute>
              <IconLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trm-complex-case"
          element={
            <ProtectedRoute>
              <TrmComplexCase />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/asset-movement"
          element={
            <ProtectedRoute>
              <AssetMovementReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/stock-take"
          element={
            <ProtectedRoute>
              <WithNavigate Component={StockTakeVarianceReport} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/stock-take/:id"
          element={
            <ProtectedRoute>
              <StockTakeDetailWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/stock-take/:id/report"
          element={
            <ProtectedRoute>
              <StockTakeReportDetailWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/asset-audit"
          element={
            <ProtectedRoute>
              <AssetsAuditReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-management/user-list"
          element={
            <ProtectedRoute>
              <WithNavigate Component={UserList} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management/user-detail"
          element={
            <ProtectedRoute>
              <WithNavigate Component={UserDetail} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management/user-role"
          element={
            <ProtectedRoute>
              <UserRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management/role-permission"
          element={
            <ProtectedRoute>
              <RolePermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management/rank"
          element={
            <ProtectedRoute>
              <RankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/site-management"
          element={
            <ProtectedRoute>
              <SiteManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-management/clusters"
          element={
            <ProtectedRoute>
              <ZoneManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-management/cabins"
          element={
            <ProtectedRoute>
              <CabinManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-hardware"
          element={
            <ProtectedRoute>
              <SHMDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/dashboard"
          element={
            <ProtectedRoute>
              <SHMDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/assets-list"
          element={
            <ProtectedRoute>
              <WithNavigate Component={AssetsList} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/asset-detail/:id"
          element={
            <ProtectedRoute>
              <AssetDetailWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/assignment-list"
          element={
            <ProtectedRoute>
              <WithNavigate Component={AssignmentList} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/assignment-detail"
          element={
            <ProtectedRoute>
              <WithNavigate Component={AssignmentDetail} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/asset-type"
          element={
            <ProtectedRoute>
              <AssetType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware-management"
          element={
            <ProtectedRoute>
              <WithNavigate Component={SystemHardwareManagementHome} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware-management/asset-type"
          element={
            <ProtectedRoute>
              <AssetType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware-management/asset-category"
          element={
            <ProtectedRoute>
              <AssetCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware-management/asset-tracking"
          element={
            <ProtectedRoute>
              <AssetTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/briefing-room"
          element={
            <ProtectedRoute>
              <BriefingRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/asset-category"
          element={
            <ProtectedRoute>
              <AssetCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/asset-tracking"
          element={
            <ProtectedRoute>
              <AssetTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/rfid-configuration"
          element={
            <ProtectedRoute>
              <RFIDReaderListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/rfid-configuration/reader-listing"
          element={
            <ProtectedRoute>
              <RFIDReaderListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-hardware/rfid-configuration/antenna-listing"
          element={
            <ProtectedRoute>
              <AntennaListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        {/* Accel is its own app (opens in a new tab): no ProtectedRoute, so no TOMS MainLayout. */}
        <Route path="/accel" element={<Navigate to="/accel/dashboard" replace />} />
        <Route path="/accel/:section" element={<Accel />} />
        <Route
          path="/system-health"
          element={
            <ProtectedRoute>
              <SystemHealth />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operational-availability"
          element={
            <ProtectedRoute>
              <WithNavigate Component={OperationalAvailability} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operational-availability-2"
          element={
            <ProtectedRoute>
              <OperationalAvailability2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operational-availability-2/:monthId"
          element={
            <ProtectedRoute>
              <OperationalAvailability2Detail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operational-availability/:monthId"
          element={
            <ProtectedRoute>
              <OperationalAvailabilityMonthWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operational-availability/:monthId/:bookingId"
          element={
            <ProtectedRoute>
              <OperationalAvailabilityDetailWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-maintenance"
          element={
            <ProtectedRoute>
              <SystemMaintenance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-maintenance/:section"
          element={
            <ProtectedRoute>
              <SystemMaintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-management"
          element={
            <ProtectedRoute>
              <DataExport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-management/export"
          element={
            <ProtectedRoute>
              <DataExport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-management/import"
          element={
            <ProtectedRoute>
              <DataImport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-log"
          element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource-planning"
          element={
            <ProtectedRoute>
              <ResourcePlanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Revision pages — for boss UI/UX discussion only */}
        <Route
          path="/revision/booking-list-rev1"
          element={
            <ProtectedRoute>
              <WithNavigate Component={BookingListRev1} />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="/" element={<Navigate to="/bookings/list" replace />} />
        {/* Unmatched paths render NotFound rather than redirecting: a silent
            redirect to Booking List hid every missing route in the sidebars. */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
