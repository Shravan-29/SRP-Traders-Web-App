import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <img
                src="/logo.png"
                alt="SRP Traders"
                className="w-14 h-14 object-contain"
              /> */}

              <div>
                <span className="font-bold text-xl text-white">
                  SRP Traders
                </span>

                <div className="text-xs text-slate-400">
                  Hardware & Tools
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Mumbai's trusted hardware & industrial tools supplier.
              Quality products for professionals and businesses.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>

              <a
                href="#"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>

              <a
                href="#"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Shop', to: '/shop' },
                { label: 'My Orders', to: '/orders' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'My Profile', to: '/profile' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-sky-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Categories
            </h4>

            <ul className="space-y-2.5">
              {[
                'Power Tools',
                'Hand Tools',
                'Safety Equipment',
                'Welding & Cutting',
                'Plumbing',
                'Electrical',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/shop?category=${cat}`}
                    className="text-sm hover:text-sky-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Contact Us
            </h4>

            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />

                <span>
                  Shop No. 12, Chembur Market, Chembur East,
                  Mumbai - 400071, Maharashtra
                </span>
              </li>

              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />

                <a
                  href="tel:+919876543210"
                  className="hover:text-sky-400 transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>

              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />

                <a
                  href="mailto:info@srptraders.in"
                  className="hover:text-sky-400 transition-colors"
                >
                  info@srptraders.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
          <p>© 2025 SRP Traders. All rights reserved.</p>

          <p>
            GST: 27XXXXX1234X1ZX | Mumbai, Maharashtra
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer