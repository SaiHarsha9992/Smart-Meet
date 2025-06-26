"use client";
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">SmartMeet</h2>
          <p className="text-sm text-gray-400">
            Revolutionizing interviews with intelligent analysis and real-time performance tracking.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:text-white">Dashboard</a></li>
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Contact or Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Connect with Us</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="mailto:team@smartmeet.com" className="hover:text-white">team@smartmeet.com</a></li>
            <li><a href="https://www.linkedin.com/company/ghostcoder/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a></li>
            <li><a href="https://github.com/SaiHarsha9992/ghostCoder" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} ghostCoder. All rights reserved.
      </div>
    </footer>
  );
}
