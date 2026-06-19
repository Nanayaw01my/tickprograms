import Link from "next/link";
import { Ticket, Globe, Share2, Link2, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Ticket<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Your premier destination for event ticketing in Ghana. Discover, book, and enjoy amazing events.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Explore</h3>
            <ul className="mt-4 space-y-2">
              {["Browse Events", "Featured Events", "Categories", "Organizers"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              {["Help Center", "Contact Us", "Refund Policy", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Connect</h3>
            <div className="mt-4 flex gap-3">
              {[Globe, Share2, Link2, Mail].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-indigo-600 hover:text-white dark:bg-gray-800 dark:text-gray-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} TicketHub. All rights reserved. Made with ❤️ in Ghana.
          </p>
        </div>
      </div>
    </footer>
  );
}
