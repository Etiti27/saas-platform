// AppFooter.jsx
export function AppFooter({ fixed = true }) {
  const appName =  import.meta.env.VITE_APP_NAME;

  return (
    <footer
      className={`${
        fixed ? 'fixed bottom-0 left-0 right-0 z-40' : 'mt-auto w-full'
      } bg-[#224765] text-white border-t border-[#1b3752]`}
    >
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <p className="text-white/80">
          &copy; {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <a className="text-white/90 hover:text-white hover:underline underline-offset-4" href="/private-policy">Privacy</a>
          <a className="text-white/90 hover:text-white hover:underline underline-offset-4" href="/terms">Terms</a>
          <a className="text-white/90 hover:text-white hover:underline underline-offset-4" href="/contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
