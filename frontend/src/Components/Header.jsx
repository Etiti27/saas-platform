// HeaderBar.jsx
import { useEffect, useRef, useState } from "react";
import { logout } from "./Token";
import { useNavigate } from "react-router-dom";
import { Menu, X, Settings as SettingsIcon , User,          // My Account
UserPlus,      // Onboarding
BadgeDollarSign, // Sales
Package,       // Inventory
RotateCcw,     // Refund
ReceiptText} from "lucide-react";
import {MinimalSettings} from "./ShowSettings"; // ✅ default import

const getInitials = (str = "") =>
  str.split(" ").filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join("");

// robust role helpers
const norm = (s) => String(s || "").toLowerCase();
const roleList = (user) => {
  const single = user?.role ? [user.role] : [];
  return (user?.roles || single).map(norm);
};
const hasAnyRole = (user, roles = []) => {
  const mine = roleList(user);
  return roles.some((r) => mine.includes(norm(r)));
};

export function HeaderBar({
  user,
  employee,
  platform = { name: import.meta.env.VITE_APP_NAME },
}) {
  const [open, setOpen] = useState(false);           // account menu open/close
  const [settingPrev, setSettingPrev] = useState(false); // settings slide-over
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const tenantName = import.meta.env.VITE_APP_NAME || "Your Company";

  // close menu on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const canRefund   = hasAnyRole(user, ["admin", "sales", "sales_manager"]);
  const canExpense  = hasAnyRole(user, ["admin", "inventory", "inventory_manager"]);
  const canOnboard   = hasAnyRole(user, ["admin", "human resource"]);
  const canInventory=hasAnyRole(user, ["admin", "inventory"]);
  const canSale = hasAnyRole(user, ["admin", "sales"]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1b3752] bg-[#224765] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 md:py-5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            {/* Left: brand */}

            <a href="/">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src="/ecs-logo.jpeg"
                alt="App logo"
                className="h-16 w-16 rounded-full object-cover ring-1 ring-white/30 bg-white/10"
              />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-lg md:text-xl font-semibold">{tenantName?.toUpperCase()}</div>
                <div className="truncate text-xs md:text-sm text-white/80">
                  {import.meta.env.VITE_TAGLINE}
                </div>
              </div>
            </div>
            </a>

            {/* Center spacer */}
            <div className="hidden md:block" />

            {/* Right: menu */}
            {user ? (
              <div className="relative flex items-center gap-3" ref={menuRef}>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1">
                  <span className="text-[11px] leading-none">Powered by {platform.name}</span>
                  <div className="text-[11px]">— “{import.meta.env.VITE_TAGLINE}”</div>
                </div>

                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium truncate max-w-[220px]">
                    {user?.tenant?.name?.toUpperCase() || ""}
                  </span>
                  <span className="text-xs text-white/80 truncate max-w-[260px]">
                    {user?.email || ""}
                  </span>
                </div>

                {/* Avatar (non-interactive) */}
                <div
                  className="h-11 w-11 rounded-full ring-1 ring-white/20 bg-white/10 grid place-content-center overflow-hidden"
                  title={user?.name || "User"}
                >
                  {user?.tenant?.logo ? (
                    <img src={user.tenant.logo} alt="Avatar" className="h-11 w-11 object-cover" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {getInitials(user?.name || user?.email || "U")}
                    </span>
                  )}
                </div>

                {/* Hamburger toggler */}
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls="account-menu"
                  onClick={() => setOpen(v => !v)}
                  className="h-11 w-11 ring-1 ring-white/20 bg-white/50 grid place-content-center hover:bg-white/20 transition rounded-xl"
                  title="Account menu"
                >
                  <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                  {open ? <X className="h-5 w-5 text-[#224765]" /> : <Menu className="h-5 w-5 text-[#224765]" />}
                </button>

                {/* Dropdown */}
                {open && (
                  <div
                    id="account-menu"
                    role="menu"
                    className="absolute right-0 top-14 w-64 rounded-xl border border-gray-200 bg-white text-slate-900 shadow-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 text-sm">
                      <div className="font-medium">{employee?.last_name || "User"}</div>
                      <div className="text-gray-500 truncate">{user?.email || "—"}</div>
                    </div>
                    <div className="h-px bg-gray-100" />

                    <button
                      role="menuitem"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {go("/account")
                      setOpen(false)
                        }
                      }
                    >
                    <User className="h-4 w-4" />
                      My Account
                    </button>

                    {canOnboard && (
                      <button
                        role="menuitem"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        
                        onClick={() =>{ 
                          go("/onboarding")  // ✅ keep consistent with your routes
                          setOpen(false)
                        }
                        }
                      >
                      <UserPlus className="h-4 w-4" />
                        Onboarding
                      </button>
                    )}
                    {canSale && (
                      <button
                        role="menuitem"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() =>{
                           go("/sales") // ✅ keep consistent with your routes
                           setOpen(false)
                        }
                        }
                      >
                      <BadgeDollarSign className="h-4 w-4"/>
                        Sales
                      </button>
                    )}

                    {canInventory && (
                      <button
                        role="menuitem"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => {
                          go("/inventory") // ✅ keep consistent with your routes
                          setOpen(false)
                        }
                        }
                      >
                      <Package  className="h-4 w-4"/>
                        Inventory
                      </button>
                    )}

                    {canRefund && (
                      <button
                        role="menuitem"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() =>{ go("/refund")
                        setOpen(false);
                       
                         } 
                        } 
                      >
                      <RotateCcw className="h-4 w-4" />
                        Refund
                      </button>
                    )}

                    {canExpense && (
                      <button
                      role="menuitem"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        go("/expenses")
                        setOpen(false);
                      
                      }}
                    >
                      <ReceiptText className="h-4 w-4" />
                      Expenses
                    </button>
                    )}

                    <button
                      role="menuitem"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        setOpen(false);
                        setSettingPrev(true);   // ✅ open settings slide-over
                      }}
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </button>

                    <button
                      role="menuitem"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                      onClick={() => logout({ redirect: "/login" })}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Settings slide-over lives outside the menu/dropdown */}
      <MinimalSettings
        user={user}
        open={settingPrev}               
        onClose={() => setSettingPrev(false)}
      />
    </>
  );
}
