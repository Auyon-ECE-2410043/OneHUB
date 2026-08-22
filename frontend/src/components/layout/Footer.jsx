export function Footer() {
  return (
    <footer className="mt-auto py-6 px-4 lg:px-8 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} RUET OneHUB — Central University Portal. All rights reserved.</p>
        <p className="text-slate-400">Department of Electronics & Telecommunication / Computer Science</p>
      </div>
    </footer>
  );
}

export default Footer;
