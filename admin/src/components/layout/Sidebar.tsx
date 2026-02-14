import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Users", path: "/users", icon: Users },
  { title: "Trades", path: "/trades", icon: ArrowLeftRight },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
}

const Sidebar = ({ collapsed, onToggle, isMobile, mobileOpen }: SidebarProps) => {
  const location = useLocation();
  const showLabels = isMobile ? true : !collapsed;
  const isVisible = isMobile ? mobileOpen : true;

  return (
    <motion.aside
      initial={isMobile ? { x: -280 } : undefined}
      animate={
        isMobile
          ? { x: mobileOpen ? 0 : -280 }
          : { width: collapsed ? 72 : 240 }
      }
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-border overflow-hidden ${
        isMobile ? "w-[260px]" : ""
      }`}
      style={{ background: "hsl(var(--sidebar-background))" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center">
          <TrendingUp className="h-7 w-7 text-primary flex-shrink-0" />
          <AnimatePresence>
            {showLabels && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 text-lg font-bold text-gradient-primary whitespace-nowrap overflow-hidden"
              >
                Forex AI Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile && (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-secondary"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute left-0 top-1/5 -translate-y-1/5 w-1 h-6 rounded-r-full bg-primary"
                  />
                )}
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {showLabels && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-3 flex-shrink-0 space-y-1">
        {!isMobile && (
          <button
            onClick={onToggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-secondary transition-colors w-full"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            )}
            <AnimatePresence>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {showLabels && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
