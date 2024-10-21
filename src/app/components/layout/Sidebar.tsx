"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Package2,
  BookOpen,
  Users,
  Settings,
  Globe,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  Bell,
  Zap,
  ChevronsUpDown,
  Search,
  Link as LinkIcon,
  Users2,
  Loader2,
  Loader2Icon,
  LoaderCircle,
  LoaderCircleIcon,
  LoaderPinwheelIcon,
  Ellipsis,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-tonggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { progress } from "framer-motion";
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

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    {
      href: "#",
      icon: Users2,
      label: "Clients",
      subItems: [
        {
          href: "/clients/domains",
          icon: Globe,
          label: "Domains",
        },
        {
          href: "/clients/find-publishers",
          icon: Search,
          label: "Find Publishers",
        },
        {
          href: "/clients/on-progress",
          icon: Ellipsis,
          label: "On Progress",
        },
        { href: "/clients/live-links", icon: LinkIcon, label: "Live Links" },
      ],
    },
    { href: "/publishers", icon: BookOpen, label: "Publishers" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const isParentActive = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => isActive(subItem.href));
    }
    return isActive(item.href);
  };

  useEffect(() => {
    if (!isCollapsed) {
      setOpenPopover(null);
    }
  }, [isCollapsed]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-14 px-4 border-b justify-between lg:h-[60px]">
        {!isCollapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm"
          >
            <Package2 className="h-5 w-5" />
            <span>Publisher DB</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
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
                            "bg-secondary text-secondary-foreground font-medium",
                          !isParentActive(item) &&
                            "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
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
                                  ? "bg-secondary text-secondary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                              )}
                              onClick={() => setOpenPopover(null)}
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
                            "bg-secondary text-secondary-foreground font-medium",
                          !isParentActive(item) &&
                            "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
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
                                  ? "bg-secondary text-secondary-foreground font-medium"
                                  : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                              )}
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
                      ? "bg-secondary text-secondary-foreground font-medium"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive(item.href) && "text-secondary-foreground"
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/avatars/user-avatar.jpg"
                    alt="User avatar"
                    width={32}
                    height={32}
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      john.doe@example.com
                    </p>
                  </div>
                )}
                {!isCollapsed && (
                  <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Zap className="mr-2 h-4 w-4" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
