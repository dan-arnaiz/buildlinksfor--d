"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Package2,
  BookOpen,
  Users,
  Settings,
  Globe,
  Search,
  LinkIcon,
  Users2,
  Ellipsis,
  ChevronLeft,
  ChevronDown,
  ChevronsUpDown,
  Bell,
  CreditCard,
  Zap,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuItem } from "@/app/types/MenuItem";


export function AppSidebar({
  className,
  isMobile = false,
  onMobileItemClick,
}: {
  className?: string;
  isMobile?: boolean;
  onMobileItemClick?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.subItems?.some((subItem: MenuItem) => isActive(subItem.href)) ||
    isActive(item.href);

  const menuItems: MenuItem[] = [
    { href: "/", icon: Home, label: "Dashboard" },
    {
      href: "#",
      icon: Users2,
      label: "Clients",
      subItems: [
        { href: "/clients/domains", icon: Globe, label: "Domains" },
        {
          href: "/clients/find-publishers",
          icon: Search,
          label: "Find Publishers",
        },
        { href: "/clients/on-progress", icon: Ellipsis, label: "On Progress" },
        { href: "/clients/live-links", icon: LinkIcon, label: "Live Links" },
      ],
    },
    { href: "/publishers", icon: BookOpen, label: "Publishers" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleItemClick = () => {
    if (isMobile && onMobileItemClick) {
      onMobileItemClick();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background transition-all duration-300",
        isCollapsed && !isMobile ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center h-14 px-4 border-b bg-muted/40 justify-between lg:h-[60px] lg:px-6">
        {!isCollapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm"
          >
            <Package2 className="h-5 w-5" />
            <span>Publisher DB</span>
          </Link>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            <ChevronLeft
              className={cn("h-4 w-4", isCollapsed && "rotate-180")}
            />
          </Button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              {item.subItems ? (
                isCollapsed ? (
                  <Popover
                    open={openPopover === item.href}
                    onOpenChange={(open) =>
                      setOpenPopover(open ? item.href : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-center px-3 py-2 text-sm",
                          isParentActive(item) &&
                            "bg-primary text-primary-foreground font-medium",
                          !isParentActive(item) &&
                            "text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="start">
                      <ul className="space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors text-sm",
                                isActive(subItem.href)
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"
                              )}
                              onClick={() => {
                                setOpenPopover(null);
                                handleItemClick();
                              }}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" />
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Collapsible
                    open={openCollapsible === item.href}
                    onOpenChange={(open) =>
                      setOpenCollapsible(open ? item.href : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-3 py-2 text-sm",
                          isParentActive(item) &&
                            "bg-primary text-primary-foreground font-medium",
                          !isParentActive(item) &&
                            "text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 mr-2" />
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform duration-200",
                            openCollapsible === item.href &&
                              "transform rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="space-y-1 mt-1 ml-6">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors text-sm",
                                isActive(subItem.href)
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"
                              )}
                              onClick={handleItemClick}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" />
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors text-sm",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.label : undefined}
                  onClick={handleItemClick}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive(item.href) && "text-primary-foreground"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-2 md:p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full min-h-[40px] md:min-h-[48px]",
                isCollapsed
                  ? "px-0 hover:bg-transparent hover:text-inherit"
                  : "justify-start px-2"
              )}
            >
              <div
                className={cn(
                  "flex items-center w-full overflow-hidden",
                  isCollapsed ? "justify-center" : "gap-2 md:gap-3"
                )}
              >
                <Avatar className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0">
                  <AvatarImage
                    src="/avatars/user-avatar.jpg"
                    alt="User avatar"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0">
                      <p className="text-[11px] md:text-xs font-medium leading-none truncate w-full">
                        John Doe
                      </p>
                      <p className="text-[9px] md:text-[11px] text-muted-foreground hidden md:block truncate w-full">
                        john.doe@example.com
                      </p>
                    </div>
                    <ChevronsUpDown className="ml-auto h-3 w-3 opacity-50 flex-shrink-0" />
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 md:w-52">
            <DropdownMenuItem className="text-xs md:text-sm">
              <Settings className="mr-2 h-3 w-3" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs md:text-sm">
              <Bell className="mr-2 h-3 w-3" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs md:text-sm">
              <CreditCard className="mr-2 h-3 w-3" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs md:text-sm">
              <Zap className="mr-2 h-3 w-3" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs md:text-sm">
              <LogOut className="mr-2 h-3 w-3" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
