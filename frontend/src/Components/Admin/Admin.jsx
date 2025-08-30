import React, {useState, useEffect} from 'react'
import { AdminDashboardPro } from './components/AllComponents'

import { ShowSetting } from './components/ShowSettings'
import axios from 'axios'

function Admin({user, settingPrev, setSettingPrev}) {
  const schema= user.tenant.schema_name
  const [showPreview, setShowPreview] = useState(false);
  
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!schema) return;

    const controller = new AbortController();
    let isAlive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const response  = await axios.get('http://localhost:3001/setting', {
          headers: { 'Tenant-Schema': schema },
          signal: controller.signal, // Axios supports AbortController
          // withCredentials: true,   // uncomment if you need cookies
        });

        if (isAlive) setSettings(response.data);
      } catch (err) {
        // Ignore abort errors; surface others
        if (isAlive && err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setError(err);
        }
      } finally {
        if (isAlive) setLoading(false);
      }
    })();

    return () => {
      isAlive = false;
      controller.abort();
    };
  }, []);


   

    

   
  
  return (
    
       
          <section className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-[#224765]/10">
            <AdminDashboardPro
            user={user}
    currency="USD"
    theme="light"
    enableDownloads
    revenueGoal={18000}
    sections={{
      revenueTrend: true,
      payments: true,
      ordersTrend: true,
      revenueByCategory: true,
      customerSegments: true,
      topProducts: true,
      lowStock: true,
      employeeLeaderboard: true,
      recommendations: true,
      // NEW:
      profitByDate: true,
      salesOnDate: true,
      refunds: true,
    }}
    // Optional: pass your real datasets
    // data={{ revenueSeries, ordersSeries, payments, revenueByCategory, customerSegments, topProducts, lowStock, employees, profitDaily, salesRecords, refunds }}
  />
    {settingPrev && (
       <div className="min-h-screen bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
   
      
      <main className="min-h-screen w-full p-6 flex items-center justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ShowSetting setSettingPrev={setSettingPrev} />
                  </div>
           </main>
            </div> 
                 
              )}


            </div>
            </section>
          
   
    
   


 

  )
}

export {Admin}