import { useState } from "react";
import { logout } from "./Token";


const getInitials = (str = "") =>
  str.split(" ").filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join("");

/**
 * Single-row header with tenant on the left + "Powered by Ikenga" on the right
 *
 * Props:
 * - user: { email, avatar, tenant: { name, logo } }
 * - employee: { last_name }
 * - setSettingPrev: fn
 * - platform?: { name, logoUrl }  // defaults to Ikenga
 */
export function HeaderBar({
  user,
  employee,
  setSettingPrev,
  platform = { name: import.meta.env.VITE_APP_NAME },
}) {
  const [open, setOpen] = useState(false);
  const logoUrl='../../public/ecs-logo.jpeg'

  const tenantName =
    user?.tenant?.name || import.meta.env.VITE_APP_NAME || "Your Company";

  return (
    <header className="sticky top-0 z-50 border-b border-[#1b3752] bg-[#224765] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:py-5">
        {/* 3-column grid keeps perfect alignment */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Left: Tenant brand */}
          <div className="flex items-center gap-4 min-w-0">
            {user?.tenant?.logo ? (
              <img
                src={user.tenant.logo}
                alt={`${tenantName} logo`}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/30 bg-white/10"
              />
            ) : (
              <div className="h-12 w-12 rounded-full ring-1 ring-white/30 bg-white/10 grid place-content-center text-lg font-semibold">
                {getInitials(tenantName)}
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <div className="truncate text-lg md:text-xl font-semibold">
                {tenantName?.toUpperCase()}
              </div>
              <div className="truncate text-xs md:text-sm text-white/80">
                All services in one place
              </div>
            </div>
          </div>

          {/* Center: reserved (breadcrumbs/search if you need later) */}
          <div className="hidden md:block" />

          {/* Right: Powered by Ikenga + user menu */}
          <div className="relative flex items-center gap-4">
            {/* Powered by pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${platform.name} logo`}
                  className="h-4 w-4 rounded-full object-contain ring-1 ring-white/30"
                />
              ) : (
                <div className="h-4 w-4 rounded-full grid place-content-center text-[9px] font-bold ring-1 ring-white/30">
                  {getInitials(platform.name)}
                </div>
              )}
              <span className="text-[11px] leading-none">Powered by {platform.name}</span>
            </div>

            {/* User block (name + email on md+) */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-base font-medium truncate max-w-[220px]">
                {employee?.last_name?.toUpperCase() || "Guest User"}
              </span>
              <span className="text-xs text-white/80 truncate max-w-[260px]">
                {user?.email || "guest@example.com"}
              </span>
            </div>

            {/* Avatar button */}
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="relative h-11 w-11 rounded-full ring-1 ring-white/20 bg-white/10 grid place-content-center text-sm font-semibold"
              title="Account menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User avatar"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                getInitials(employee?.last_name || "GU")
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div
                role="menu"
                className="absolute right-0 top-14 w-64 rounded-xl border border-gray-200 bg-white text-slate-900 shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 text-sm">
                  <div className="font-medium">{employee?.last_name || "Guest User"}</div>
                  <div className="text-gray-500 truncate">{user?.email || "guest@example.com"}</div>
                </div>
                <div className="h-px bg-gray-100" />
                <button
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  My Account
                </button>
                <button
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    setSettingPrev(true);
                  }}
                >
                  Settings
                </button>
                <button
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
