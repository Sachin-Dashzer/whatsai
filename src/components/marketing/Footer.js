export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="font-bold text-white">WaBot.ai</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>

          <p className="text-slate-500 text-sm">© 2026 WaBot.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
