import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "../../utils";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarWidth = isCollapsed ? "72px" : "256px";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar – always visible on md+, drawer on mobile */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-30 md:block",
          isMobileOpen ? "block" : "hidden md:block"
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main area */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-250"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header — note: left offset matches sidebar width */}
        <div
          className="transition-all duration-250"
          style={{ paddingLeft: 0 }}
        >
          <Header onMenuToggle={() => setIsMobileOpen((prev) => !prev)} />
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 mt-16 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
