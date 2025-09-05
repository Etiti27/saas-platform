import { useState } from 'react';
import axios from 'axios';
import { setAccessToken, bootstrapAuth } from './Token';
import {useNavigate} from 'react-router-dom'

// ⬇️ Add your logo file here (SVG/PNG/JPG). Fallback monogram is used if missing.


const SECTORS = ["Technology","Health" ];


export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    adminName: '', adminPhone: '',
    companyStartDate: '', sector: '',
  });
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiRoute=import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  const boot=async()=>{
    return bootstrapAuth();
  }
 

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const handleLogoChange = (e) => { const f = e.target.files?.[0]; if (f) setLogo(f); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        setError(''); setIsLoading(true);
        const res = await axios.post(`${apiRoute}/route/login`, { email: form.email, password: form.password });
        console.log(res);
        if (res.status === 200) {
          setAccessToken(res.data.access_token);
          console.log("tes 1");
          const user=await boot()
          if(user.user.user.role.toLowerCase()=="admin"){
            console.log("yes");
            navigate('/admin-dashboard')
          }
          if(user.user.user.role.toLowerCase()=="inventory"){
            
            navigate('/inventory')
          }
          window.location.reload();
        
          
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Sign in failed');
      } finally { setIsLoading(false); }
      return;
    }

    try {
      setError(''); setIsLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('adminName', form.adminName);
      fd.append('adminPhone', form.adminPhone);
      fd.append('companyStartDate', form.companyStartDate);
      fd.append('sector', form.sector);
     
      if (logo) fd.append('logo', logo);

      const res = await axios.post(`${apiRoute}/route/register`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        setAccessToken(res.data.access_token);
        bootstrapAuth();
        // window.location.reload();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Sign up failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#D3E2FD_0%,#ffffff_40%)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-white">
        {/* ===== Branded Header ===== */}
        <div className="relative bg-[#224765] text-white px-6 py-7 overflow-hidden">
          {/* subtle decorative glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#D3E2FD]/20 blur-3xl" />

          <div className="flex items-center justify-between gap-4">
            {/* Brand block */}
            <div className="flex items-center gap-3">
              {/* Logo (fallback to monogram if file not found) */}
             {/*  {IkengaLogo ? (
                <img src={IkengaLogo} alt="Ikenga logo" className="size-20 rounded-full object-cover shadow"/>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center text-lg font-bold shadow">I</div>
              )} */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight uppercase">{import.meta.env.VITE_APP_NAME}</h1>
                 
                </div>
                <p className="text-white/90 text-sm -mt-0.5">{import.meta.env.VITE_TAGLINE}</p>
              </div>
            </div>

            {/* Mode label */}
            <span className="text-xs opacity-90">
              {isLogin ? 'Sign in to continue' : 'Provision a new workspace'}
            </span>
          </div>

          {/* Toggle pills */}
          <div className="mt-5 inline-flex rounded-full bg-white/15 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium transition',
                isLogin ? 'bg-white text-[#224765] shadow' : 'text-white/90 hover:bg-white/10',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium transition',
                !isLogin ? 'bg-white text-[#224765] shadow' : 'text-white/90 hover:bg-white/10',
              ].join(' ')}
            >
              Sign Up
            </button>
          </div>
        </div>
        {/* ===== End Branded Header ===== */}

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 grid gap-5">
          {!isLogin && (
            <>
              {/* Company name */}
              <div>
                <label className="block text-sm font-medium text-[#224765]">Company Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="organization"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
                />
              </div>

              {/* Company details */}
              <div className="rounded-xl border bg-[#D3E2FD]/25 p-4">
                <p className="text-sm font-semibold text-[#224765] mb-3">Company Details</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#224765]">Start Date</label>
                    <input
                      type="date" name="companyStartDate" value={form.companyStartDate}
                      onChange={handleChange} required
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#224765] mb-1">Sector</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SECTORS.map((s) => (
                        <label
                          key={s}
                          className={[
                            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer',
                            form.sector === s ? 'border-[#224765] bg-[#D3E2FD]/40' : 'border-gray-300 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          <input
                            type="radio" name="sector" value={s} checked={form.sector === s} onChange={handleChange}
                            className="accent-[#224765]" required
                          />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin contact */}
              <div className="rounded-xl border bg-[#D3E2FD]/25 p-4">
                <p className="text-sm font-semibold text-[#224765] mb-3">Admin Contact</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#224765]">Admin Name</label>
                    <input
                      type="text" name="adminName" value={form.adminName} onChange={handleChange} required
                      placeholder="e.g., Jane Doe" autoComplete="name"
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#224765]">Phone</label>
                    <input
                      type="tel" name="adminPhone" value={form.adminPhone} onChange={handleChange} required
                      placeholder="+1 555 123 4567" autoComplete="tel"
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Tenant logo uploader (your client/tenant’s logo) */}
              <div>
                <label className="block text-sm font-medium text-[#224765]">Company Logo</label>
                <input
                  type="file" name="logo" accept="image/*" onChange={handleLogoChange} required
                  className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#224765] file:px-4 file:py-2 file:text-white hover:file:bg-[#1b3752]"
                />
                <p className="text-xs text-[#224765]/80 mt-1">
                  Tip: Your brand appears above; this logo is for the tenant workspace.
                </p>
              </div>
            </>
          )}

          {/* Shared fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#224765]">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#224765]">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none ring-1 ring-transparent focus:ring-[#224765] shadow-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {String(error)}
            </div>
          )}

          <button
            type="submit" disabled={isLoading}
            className={[
              'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-white shadow',
              'transition disabled:opacity-60 disabled:cursor-not-allowed',
              isLoading ? 'bg-[#224765]/70' : 'bg-[#224765] hover:bg-[#1b3752]',
            ].join(' ')}
          >
            {isLoading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8v3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          <p className="text-sm text-center text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[#224765] font-semibold hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
