"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { useAppStore } from "@/stores/app-store";
import { navigation } from "@/config/navigation";
import { LogoutModal } from "./logout-modal";

function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold text-white",
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs"
      )}
    >
      {initials}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, role, permissions, logout } = useAuthStore();
  const {
    sidebarOpen,
    mobileSidebarOpen,
    toggleSidebar,
    setMobileSidebarOpen,
  } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  useEffect(() => {
    const activeDropdown = filteredNavigation
      .flatMap((g) => g.items)
      .find((item) => item.children?.some((child) => isActive(child)));
    if (activeDropdown) {
      setOpenDropdowns((prev) => new Set(prev).add(activeDropdown.label));
    }
  }, [pathname, searchParams]);

  const isActive = (item: { href: string; children?: { href: string }[] }) => {
    // For items with children, check if any child is active
    if (item.children) {
      return item.children.some((child) => {
        const childUrl = new URL(child.href, window.location.origin);
        const childPath = childUrl.pathname;
        const childPage = childUrl.searchParams.get("page");
        if (childPage) {
          return pathname === childPath && searchParams.get("page") === childPage;
        }
        if (childPath === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(childPath);
      });
    }
    // For regular items
    const url = new URL(item.href, window.location.origin);
    const itemPath = url.pathname;
    const itemPage = url.searchParams.get("page");
    if (itemPage) {
      return pathname === itemPath && searchParams.get("page") === itemPage;
    }
    if (itemPath === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(itemPath);
  };

  const isChildActive = (child: { href: string }) => {
    const childUrl = new URL(child.href, window.location.origin);
    const childPath = childUrl.pathname;
    const childPage = childUrl.searchParams.get("page");
    if (childPage) {
      return pathname === childPath && searchParams.get("page") === childPage;
    }
    if (childPath === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(childPath);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const filteredNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        return permissions.includes(item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10 px-3",
          !sidebarOpen && "justify-center px-0"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15">
            <Accessibility className="h-3.5 w-3.5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight text-white">
                CDP Admin
              </h1>
              <p className="truncate text-[11px] leading-tight text-white/50">
                Management Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 sidebar-scrollbar">
        {filteredNavigation.map((group) => (
          <div key={group.title} className="mb-1">
            {group.title && sidebarOpen && (
              <h2 className="mb-0.5 px-2 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                {group.title}
              </h2>
            )}
            {group.title && !sidebarOpen && <div className="my-1.5 border-t border-white/10" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                const hasChildren = item.children && item.children.length > 0;
                const isDropdownOpen = openDropdowns.has(item.label);

                if (hasChildren) {
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
                          "text-white/60 hover:bg-white/8 hover:text-white/90",
                          !sidebarOpen && "justify-center px-0"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            "text-white/50 group-hover:text-white/80"
                          )}
                        />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-white/40 transition-transform duration-200",
                                isDropdownOpen && "rotate-180"
                              )}
                            />
                          </>
                        )}
                      </button>
                      {sidebarOpen && isDropdownOpen && (
                        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isChildActive(child);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all",
                                    childActive
                                      ? "bg-white/15 text-white"
                                      : "text-white/50 hover:bg-white/8 hover:text-white/80"
                                  )}
                                >
                                  <ChildIcon
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 transition-colors",
                                      childActive
                                        ? "text-white"
                                        : "text-white/40 group-hover:text-white/70"
                                    )}
                                  />
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={!sidebarOpen ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:bg-white/8 hover:text-white/90",
                        !sidebarOpen && "justify-center px-0"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-white"
                            : "text-white/50 group-hover:text-white/80"
                        )}
                      />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="shrink-0 border-t border-white/10 p-2">
        {user && (
          <div
            className={cn(
              "flex items-center gap-2",
              !sidebarOpen && "justify-center"
            )}
          >
            <UserAvatar name={user.name || ""} size="sm" />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-white/45">
                  {role?.name || "User"}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1.5 flex w-full items-center justify-center rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden bg-[#168B61] transition-all duration-300 lg:block dark:bg-[#111827]",
          sidebarOpen ? "w-[240px]" : "w-[60px]"
        )}
      >
        {navContent}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[240px] bg-[#168B61] transition-transform duration-300 lg:hidden dark:bg-[#111827]",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
