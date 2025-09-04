import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Admin } from './Components/Admin/Admin.jsx';
import { StockManager } from './Components/Inventory/Stock.jsx';
import { AuthForm } from './Components/Register.jsx';
import { InvoiceGenerator } from './Components/Sales/Invoice.jsx';
import { MultiStepOnboarding } from './Components/HR/Onboarding.jsx';
import { RefundFormPro } from './Components/Sales/Refund.jsx';
import { AccessDeniedWarning } from './Components/AccessDenied.jsx';
import { ExpenseFormPro } from './Components/Expenses.jsx';
import { PrivacyPolicyIkenga } from './Components/Legal/PrivatePolicy.jsx';
import { TermsIkenga } from './Components/Legal/Terms.jsx';
import { ContactIkenga } from './Components/Legal/Contact.jsx';

const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');

const AccessDenied = ({ user, roles }) => (
  <AccessDeniedWarning
    user={user}
    requiredRoles={roles}
    loginPath="/login"
    supportHref="mailto:support@example.com"
  />
);

const RequireAuth = ({ isAuthenticated, children }) =>
  isAuthenticated ? children : <Navigate to="/login" replace />;

const RequireRoles = ({ role, roles, user, children }) => {
  const hasRole = roles.map(safeLower).includes(safeLower(role));
  return hasRole ? children : <AccessDenied user={user} roles={roles} />;
};

export function Outlet({ setSettingPrev, settingPrev, auth }) {
  const isAuthenticated = !!auth?.isAuthenticated;
  const user = auth?.user?.user ?? null;
  const employee = auth?.user?.employee ?? null;
  const role = user?.role ?? '';

  const defaultAuthedPath =
    safeLower(role) === 'admin'
      ? '/admin-dashboard'
      : safeLower(role) === 'human resource'
      ? '/onboarding'
      : safeLower(role) === 'sales'
      ? '/refund' // fixed: route defined below is /refund
      : safeLower(role) === 'inventory'
      ? '/inventory'
      : '/login';

  return (
    <Routes>
      {/* Landing: send unauth users to /login; authed users to their default */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={defaultAuthedPath} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public auth routes redirect away if already logged in */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultAuthedPath} replace /> : <AuthForm />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultAuthedPath} replace /> : <AuthForm />}
      />

      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin']} user={user}>
              <Admin
                user={user}
                employee={employee}
                settingPrev={settingPrev}
                setSettingPrev={setSettingPrev}
              />
            </RequireRoles>
          </RequireAuth>
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin', 'inventory']} user={user}>
              <StockManager user={user} />
            </RequireRoles>
          </RequireAuth>
        }
      />

      {/* Sales */}
      <Route
        path="/sales"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin', 'sales']} user={user}>
              <InvoiceGenerator user={user} employee={employee} />
            </RequireRoles>
          </RequireAuth>
        }
      />

      {/* HR */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin', 'human resource']} user={user}>
              <MultiStepOnboarding user={user} />
            </RequireRoles>
          </RequireAuth>
        }
      />

      {/* Refunds (note the singular path) */}
      <Route
        path="/refund"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin', 'sales']} user={user}>
              <RefundFormPro user={user} employee={employee} />
            </RequireRoles>
          </RequireAuth>
        }
      />

      {/* Expenses */}
      <Route
        path="/expenses"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RequireRoles role={role} roles={['admin', 'inventory']} user={user}>
              <ExpenseFormPro user={user} />
            </RequireRoles>
          </RequireAuth>
        }
      />



<Route path="/private-policy" element={
    <PrivacyPolicyIkenga
      legalEntity="IKENGA SRL"
      address="Avenue Example 1, 1000 Brussels, Belgium"
      email="privacy@ikenga.app"
      phone="+32 2 123 45 67"
      dpo="Jane Doe — dpo@ikenga.app"
      subProcessorsLink="/legal/subprocessors"
      dpaLink="/legal/dpa"
      webFormLink="/privacy-request"
      cookiePolicyLink="/legal/cookies"
    />
  }/>
  <Route path="/terms" element={
    <TermsIkenga
      legalEntity="IKENGA SRL"
      address="Avenue Example 1, 1000 Brussels, Belgium"
      legalEmail="legal@ikenga.app"
      supportEmail="support@ikenga.app"
      dpaLink="/legal/dpa"
      privacyLink="/privacy"
      auplink="/legal/aup"
      slaLink="/legal/sla"
      subprocessorsLink="/legal/subprocessors"
    />
  }/>
  <Route path="/contact" element={
    <ContactIkenga
      legalEntity="IKENGA SRL"
      address="Avenue Example 1, 1000 Brussels, Belgium"
      email="hello@ikenga.app"
      supportEmail="support@ikenga.app"
      privacyEmail="privacy@ikenga.app"
      phone="+32 2 123 45 67"
    />
  }/>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
     


    </Routes>
  );
}
