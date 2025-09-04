// components/AccessDeniedWarning.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowLeft, Info, X } from 'lucide-react';

const Chip = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-amber-300 bg-white/80 px-2.5 py-1 text-xs font-medium text-amber-900">
    {children}
  </span>
);

/**
 * AccessDeniedWarning (modal overlay)
 *
 * Props:
 * - open?: boolean (default: true)
 * - user: { email?, name?, roles?: string[], tenant?: { name?: string } }
 * - title?: string
 * - message?: string
 * - requiredRoles?: string[]
 * - requiredTenant?: string
 * - loginPath?: string (default: '/login')
 * - supportHref?: string
 * - onClose?: () => void
 * - onSwitchAccount?: () => void   // optional custom handler
 */
export function AccessDeniedWarning({
  open = true,
  user,
  title = 'Access restricted',
  message = 'You do not have permission to view this content.',
  requiredRoles = [],
  requiredTenant,
  loginPath = '/login',
  supportHref,
  onClose,
  onSwitchAccount,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;
  console.log(user);

  const who = user?.email || user?.name || 'current user';
  const roles = user?.role ?? [];
  const tenantName = user?.tenant?.name;

  const goBack = () => {
    if (typeof onClose === 'function') onClose();
    // navigate back; if there is no history, fall back to home
    try {
      navigate(-1);
    } catch {
      navigate('/', { replace: true });
    }
  };

  const switchAccount = () => {
    if (typeof onSwitchAccount === 'function') {
      onSwitchAccount();
      return;
    }
    navigate(loginPath, {
      state: {
        from: location,
        requiredRoles,
        requiredTenant,
      },
      replace: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose ?? goBack}
        aria-hidden="true"
      />
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-denied-title"
        className="relative w-full max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-2xl ring-1 ring-amber-200/50"
      >
        {/* Close (X) */}
        <button
          type="button"
          onClick={onClose ?? goBack}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-amber-300/80 bg-white/70 text-amber-900/80 hover:bg-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-10 w-10 place-content-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 id="access-denied-title" className="text-lg font-semibold text-amber-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-amber-900/80">
              You’re signed in as <strong>{who}</strong>
              {tenantName ? (
                <>
                  {' '}
                  (Company Name: <strong>{tenantName}</strong>)
                </>
              ) : null}
              . {message}
            </p>

            {(requiredRoles.length > 0 || requiredTenant) && (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-100/60 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <Info className="h-4 w-4" />
                  Required access
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {requiredRoles.map((r) => (
                    <Chip key={r}>{r}</Chip>
                  ))}
                  {/* {requiredTenant ? <Chip>tenant: {requiredTenant}</Chip> : null} */}
                </div>
                <p className="mt-2 text-xs text-amber-900/80">
                  To continue, please log in with an account that has the required permissions
                
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current roles */}
        <div className="mb-4">
          <div className="mb-1 text-xs font-medium text-amber-900/80">Your current roles</div>
         
            <div className="flex flex-wrap gap-2">
              
                <Chip>{roles}</Chip>
            
            </div>
         
          
         
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          {supportHref && (
            <a
              href={supportHref}
              className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm hover:bg-white/80"
            >
              <Info className="mr-2 h-4 w-4" />
              Contact support
            </a>
          )}
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm hover:bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </button>
          <button
            type="button"
            onClick={switchAccount}
            className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm text-white shadow hover:bg-amber-700"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log in as a permitted user
          </button>
        </div>
      </div>
    </div>
  );
}
