import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="main-footer" className="bg-ink-navy text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-display font-bold text-lg mb-3">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="#FFB020" />
                <path d="M8 8h5v5H8V8zm7 0h5v5h-5V8zm-7 7h5v5H8v-5zm7 2.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z" fill="#12122B" />
              </svg>
              Event<span className="text-signal-amber">Scout</span> AI
            </Link>
            <p className="text-sm leading-relaxed">
              AI-powered event infrastructure planning and vendor marketplace.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">For Organizers</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">For Vendors</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="hairline-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} EventScout AI. All rights reserved.</p>
          <p className="font-mono text-white/30">v0.1.0-beta</p>
        </div>
      </div>
    </footer>
  );
}
