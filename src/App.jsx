import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages/dashboard";
import { TodaysBooking } from "@/pages/booking/today";
import { BookingList } from "@/pages/booking/list";
import { TrainingResults } from "@/pages/training-results";
import { AssetMovementReport } from "@/pages/reports/asset-movement";
import { StockTakeVarianceReport } from "@/pages/reports/stock-take";
import { AssetsAuditReport } from "@/pages/reports/asset-audit";
import { UserList } from "@/pages/user-management/list";
import { UserRole } from "@/pages/user-management/user-role";
import { RolePermission } from "@/pages/user-management/role-permission";
import { RankPage } from "@/pages/user-management/rank";
import { SiteManagement } from "@/pages/site-management";
import { SHMDashboard } from "@/pages/system-hardware/dashboard";
import { AssetsList } from "@/pages/system-hardware/assets-list";
import { AssignmentList } from "@/pages/system-hardware/assignment-list";
import { AssignmentDetail } from "@/pages/system-hardware/assignment-detail";
import { AssetType } from "@/pages/system-hardware/asset-type";
import { AssetCategory } from "@/pages/system-hardware/asset-category";
import { AssetTracking } from "@/pages/system-hardware/asset-tracking";
import { RFIDReaderListing } from "@/pages/system-hardware/rfid";
import { AntennaListing } from "@/pages/system-hardware/antenna-listing";
import { SystemHealth } from "@/pages/system-health";
import { OperationalAvailability } from "@/pages/operational-availability";
import { OperationalAvailability2 } from "@/pages/operational-availability/v2";
import { OperationalAvailabilityMonth } from "@/pages/operational-availability/month";
import { OperationalAvailabilityDetail } from "@/pages/operational-availability/detail";
import { SystemMaintenance } from "@/pages/system-maintenance";
import { DataExport } from "@/pages/data-management/export";
import { DataImport } from "@/pages/data-management/import";
import { ActivityLog } from "@/pages/activity-log";
import { Settings } from "@/pages/settings";
import { CreateBooking } from "@/pages/booking/create";
import { BookingDetail } from "@/pages/booking/detail";
import { TrainingDetail } from "@/pages/training-results/detail";
import { UserDetail } from "@/pages/user-management/user-detail";
import { ResourcePlanning } from "@/pages/resource-planning";
import { CreateAssignment } from "@/pages/system-hardware/create-assignment";
import { IssueAssets } from "@/pages/system-hardware/issue-assets";
import { SidebarV2 } from "@/components/layout/SidebarV2";
import { SidebarV3 } from "@/components/layout/SidebarV3";
import { Notifications } from "@/pages/notifications";
import { AssetDetail } from "@/pages/system-hardware/asset-detail";
import { AssetCreation } from "@/pages/system-hardware/asset-creation";

// Extracted Layout Components
import { ZoomControl } from "@/components/layout/ZoomControl";
import { VersionFooter } from "@/components/layout/VersionFooter";
import { NavSwitcher } from "@/components/layout/NavSwitcher";

const THEMED_BG = {
  v4: "bg-[#1A3A6B]",
  v5: "bg-[#1E4A2E]",
  v6: "bg-[#334155]",
  v7: "bg-[#0F172A]",
};

// ── Layout Wrapper to provide Sidebar, Header, and common controls ──
function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [navVersion, setNavVersion] = useState(() =>
    localStorage.getItem("toms_nav") ?? "v2"
  );

  useEffect(() => {
    const handler = () => {
      const v = localStorage.getItem("toms_nav") ?? "v2";
      setNavVersion(v);
    };
    window.addEventListener("toms_nav_change", handler);
    return () => window.removeEventListener("toms_nav_change", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const getSidebarPath = () => {
    if (currentPath.startsWith("/operational-availability")) return "/operational-availability";
    if (currentPath.startsWith("/reports/stock-take")) return "/reports/stock-take";
    if (currentPath === "/bookings/detail") return "/bookings/list";
    return currentPath;
  };

  const makeSidebar = (activePath) => {
    if (navVersion === "v2")
      return <SidebarV2 currentPath={activePath} onNavigate={navigate} onLogout={handleLogout} />;
    if (navVersion === "v3")
      return <SidebarV3 currentPath={activePath} onNavigate={navigate} onLogout={handleLogout} />;
    if (navVersion in THEMED_BG)
      return <SidebarV3 currentPath={activePath} onNavigate={navigate} onLogout={handleLogout} bgColor={THEMED_BG[navVersion]} />;
    return <Sidebar currentPath={activePath} onNavigate={navigate} />;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {makeSidebar(getSidebarPath())}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onNavigate={navigate} />
        {children}
      </div>
      <ZoomControl />
      <NavSwitcher />
      <VersionFooter />
    </div>
  );
}

// ── Higher-Order Component to pass `onNavigate` directly to pages ──
function WithNavigate({ Component }) {
  const navigate = useNavigate();
  return <Component onNavigate={navigate} />;
}

// ── Page specific wrappers for URL params ──
function AssetDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <AssetDetail assetId={id} onNavigate={navigate} />;
}

function StockTakeDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <button onClick={() => navigate("/reports/stock-take")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary mb-5 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Stock Take Variance Report
      </button>
      <h1 className="text-xl font-semibold text-brand-primary mb-2">Stock Take Detail #{id}</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400 text-sm">
        Detail view for record #{id} — coming soon
      </div>
    </div>
  );
}

function OperationalAvailabilityMonthWrapper() {
  const { monthId } = useParams();
  const navigate = useNavigate();
  return <OperationalAvailabilityMonth monthId={monthId} onNavigate={navigate} />;
}

function OperationalAvailabilityDetailWrapper() {
  const { monthId, bookingId } = useParams();
  const navigate = useNavigate();
  return <OperationalAvailabilityDetail monthId={monthId} bookingId={bookingId} onNavigate={navigate} />;
}

// ── Auth Route Protection ──
function ProtectedRoute({ children }) {
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
      <Routes>
        <Route path="/login" element={<Login onLogin={() => {
          localStorage.setItem("isLoggedIn", "true");
          window.location.href = "/bookings/list";
        }} />} />

        {/* Full screen pages (no layout) */}
        <Route path="/bookings/create" element={
          <ProtectedRoute>
            <CreateBooking onClose={() => window.location.href = "/bookings/list"} />
          </ProtectedRoute>
        } />
        
        <Route path="/system-hardware/create-assignment" element={
          <ProtectedRoute>
            <WithNavigate Component={CreateAssignment} />
          </ProtectedRoute>
        } />
        <Route path="/system-hardware/assignments/new" element={
          <ProtectedRoute>
            <WithNavigate Component={CreateAssignment} />
          </ProtectedRoute>
        } />

        <Route path="/system-hardware/asset-creation" element={
          <ProtectedRoute>
            <WithNavigate Component={AssetCreation} />
          </ProtectedRoute>
        } />

        <Route path="/system-hardware/issue-assets" element={
          <ProtectedRoute>
            <WithNavigate Component={IssueAssets} />
          </ProtectedRoute>
        } />

        {/* Layout pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard-v2" element={<Navigate to="/dashboard" replace />} />
        <Route path="/bookings" element={<Navigate to="/bookings/list" replace />} />
        <Route path="/bookings/today" element={<ProtectedRoute><WithNavigate Component={TodaysBooking} /></ProtectedRoute>} />
        <Route path="/bookings/list" element={<ProtectedRoute><WithNavigate Component={BookingList} /></ProtectedRoute>} />
        <Route path="/bookings/detail" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
        
        <Route path="/training-results" element={<ProtectedRoute><WithNavigate Component={TrainingResults} /></ProtectedRoute>} />
        <Route path="/training-results/detail" element={<ProtectedRoute><WithNavigate Component={TrainingDetail} /></ProtectedRoute>} />
        
        <Route path="/reports/asset-movement" element={<ProtectedRoute><AssetMovementReport /></ProtectedRoute>} />
        <Route path="/reports/stock-take" element={<ProtectedRoute><WithNavigate Component={StockTakeVarianceReport} /></ProtectedRoute>} />
        <Route path="/reports/stock-take/:id" element={<ProtectedRoute><StockTakeDetailWrapper /></ProtectedRoute>} />
        <Route path="/reports/asset-audit" element={<ProtectedRoute><AssetsAuditReport /></ProtectedRoute>} />
        
        <Route path="/user-management/user-list" element={<ProtectedRoute><WithNavigate Component={UserList} /></ProtectedRoute>} />
        <Route path="/user-management/user-detail" element={<ProtectedRoute><WithNavigate Component={UserDetail} /></ProtectedRoute>} />
        <Route path="/user-management/user-role" element={<ProtectedRoute><UserRole /></ProtectedRoute>} />
        <Route path="/user-management/role-permission" element={<ProtectedRoute><RolePermission /></ProtectedRoute>} />
        <Route path="/user-management/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
        
        <Route path="/site-management" element={<ProtectedRoute><SiteManagement /></ProtectedRoute>} />
        
        <Route path="/system-hardware" element={<ProtectedRoute><SHMDashboard /></ProtectedRoute>} />
        <Route path="/system-hardware/dashboard" element={<ProtectedRoute><SHMDashboard /></ProtectedRoute>} />
        <Route path="/system-hardware/assets-list" element={<ProtectedRoute><WithNavigate Component={AssetsList} /></ProtectedRoute>} />
        <Route path="/system-hardware/asset-detail/:id" element={<ProtectedRoute><AssetDetailWrapper /></ProtectedRoute>} />
        <Route path="/system-hardware/assignment-list" element={<ProtectedRoute><WithNavigate Component={AssignmentList} /></ProtectedRoute>} />
        <Route path="/system-hardware/assignment-detail" element={<ProtectedRoute><WithNavigate Component={AssignmentDetail} /></ProtectedRoute>} />
        <Route path="/system-hardware/asset-type" element={<ProtectedRoute><AssetType /></ProtectedRoute>} />
        <Route path="/system-hardware/asset-category" element={<ProtectedRoute><AssetCategory /></ProtectedRoute>} />
        <Route path="/system-hardware/asset-tracking" element={<ProtectedRoute><AssetTracking /></ProtectedRoute>} />
        <Route path="/system-hardware/rfid-configuration" element={<ProtectedRoute><RFIDReaderListing /></ProtectedRoute>} />
        <Route path="/system-hardware/rfid-configuration/reader-listing" element={<ProtectedRoute><RFIDReaderListing /></ProtectedRoute>} />
        <Route path="/system-hardware/rfid-configuration/antenna-listing" element={<ProtectedRoute><AntennaListing /></ProtectedRoute>} />
        
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
        
        <Route path="/operational-availability" element={<ProtectedRoute><WithNavigate Component={OperationalAvailability} /></ProtectedRoute>} />
        <Route path="/operational-availability-2" element={<ProtectedRoute><OperationalAvailability2 /></ProtectedRoute>} />
        <Route path="/operational-availability/:monthId" element={<ProtectedRoute><OperationalAvailabilityMonthWrapper /></ProtectedRoute>} />
        <Route path="/operational-availability/:monthId/:bookingId" element={<ProtectedRoute><OperationalAvailabilityDetailWrapper /></ProtectedRoute>} />
        
        <Route path="/system-maintenance" element={<ProtectedRoute><SystemMaintenance /></ProtectedRoute>} />
        
        <Route path="/data-management" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
        <Route path="/data-management/export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
        <Route path="/data-management/import" element={<ProtectedRoute><DataImport /></ProtectedRoute>} />
        
        <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="/resource-planning" element={<ProtectedRoute><ResourcePlanning /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Fallback route */}
        <Route path="/" element={<Navigate to="/bookings/list" replace />} />
        <Route path="*" element={<Navigate to="/bookings/list" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
