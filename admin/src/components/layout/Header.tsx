import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, Menu, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
  isMobile: boolean;
}

const Header = ({ title, onMenuToggle, isMobile }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // If you are storing token in localStorage, clear it here
    localStorage.removeItem("token");

    // Navigate to login page
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 glass-header">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 bg-secondary/50 border-border focus:border-primary h-9 text-sm"
          />
        </div>

        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 bg-popover border-border"
          >
            <div className="px-3 py-2 text-sm font-semibold text-foreground">
              Notifications
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
              <span className="text-sm text-foreground">
                New withdrawal request
              </span>
              <span className="text-xs text-muted-foreground">
                2 min ago
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
              <span className="text-sm text-foreground">
                User verification pending
              </span>
              <span className="text-xs text-muted-foreground">
                15 min ago
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-popover border-border"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">
                Admin User
              </p>
              <p className="text-xs text-muted-foreground">
                admin@trazorhub.com
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
