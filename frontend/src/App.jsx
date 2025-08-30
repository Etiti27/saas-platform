import { useMemo, useState } from 'react';
import {StockManager }from './Components/SaleManager/Stock.jsx';
import {MultiStepOnboarding} from './Components/HR/Onboarding.jsx';
import {InvoiceGenerator} from './Components/Accountant/Invoice.jsx';
import { AuthForm } from './Components/Register.jsx';
// If AdminActionsPage is a default export, import it like this:
import { Admin } from './Components/Admin/Admin.jsx';
import { bootstrapAuth, logout } from './Components/Token';
import { HeaderBar } from './Components/Header.jsx';
import { AppFooter } from './Components/Footer.jsx';
import { RefundFormPro } from './Components/Refund.jsx';
import { ExpenseFormPro } from './Components/Expenses.jsx';

export function App() {
  const [settingPrev, setSettingPrev]= useState(false)
  const auth = useMemo(() => bootstrapAuth(), []);
  
  const role = auth.user?.user.role; // <- safe
  
  const isAuthenticated=auth.isAuthenticated;
  const isAdmin = auth.isAuthenticated && role.toLowerCase() === 'admin';
  const isSale= auth.isAuthenticated && role.toLowerCase() === 'sales';
  const isInventory= auth.isAuthenticated && role.toLowerCase() === 'inventory';
  const isHR= auth.isAuthenticated && role.toLowerCase() === 'human resource';
  const user =auth.user?.user
  const employee= auth.user?.employee
  

  const isLogIn=auth.isAuthenticated 


 
  return (
    <div className="min-h-screen bg-gray-100">
    {isAuthenticated?
    <div>
    <HeaderBar user={user} employee={employee} setSettingPrev={setSettingPrev}/>
      {isAdmin && (
        <>
          <main className="space-y-8 p-4">
          <Admin user={user} settingPrev={settingPrev} setSettingPrev={setSettingPrev}/>
            <StockManager user={user}/>
            <MultiStepOnboarding user={user}/>
            <InvoiceGenerator
            user={user} employee={employee}
            /> 
          </main>
        </>
      )} 
      {isSale && <main className="space-y-8 p-4"> 
      <InvoiceGenerator user={user} employee={employee}/>
      </main>}

{isInventory && <main className="space-y-8 p-4"> <StockManager user={user}/> </main>}
{isHR && <main className="space-y-8 p-4"> <MultiStepOnboarding user={user}/> </main>}
<main className="space-y-8 p-4"> <RefundFormPro user={user} employee={employee}/> </main>
<ExpenseFormPro user={user} />
<AppFooter />
</div> :  
!isLogIn &&  <AuthForm /> }
<AppFooter />
    </div>
  );
  return (
    <div><AuthForm /></div>
  )
}