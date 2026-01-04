import { Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '/public/assets/StoniLogo.webp';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/equipment", label: "Equipment" },
    { to: "/history", label: "History" },
  ];

  return (
    <nav className="relative bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo + Teks STONI */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group relative overflow-hidden"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img 
                src={logo} 
                alt="Stoni Logo" 
                className="h-16 w-auto relative z-10 group-hover:scale-110 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-wider">
                STONI
              </span>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-500"></div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-6 py-2 text-white/90 hover:text-white transition-colors duration-200 group"
              >
                <span className="relative z-10 font-medium tracking-wide">
                  {link.label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:via-red-500/10 group-hover:to-red-500/5 transition-all duration-300 rounded-lg"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-300 group-hover:w-3/4 transition-all duration-300"></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200 group"
            aria-label="Toggle menu"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              {isOpen ? (
                <X size={28} className="text-white transform transition-transform duration-300 rotate-180" />
              ) : (
                <Menu size={28} className="text-white transform transition-transform duration-300" />
              )}
              <div className="absolute inset-0 bg-red-500/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 bg-gradient-to-br from-black via-gray-900/95 to-black/95
        backdrop-blur-xl z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-md space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="group relative block overflow-hidden rounded-xl p-1"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-white/90 group-hover:text-white transition-colors duration-300">
                      {link.label}
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-red-500/20 transition-all duration-300">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
                
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 
                  group-hover:from-red-500/10 group-hover:via-red-500/20 group-hover:to-red-500/10 
                  transition-all duration-500 rounded-xl"></div>
                
                {/* Border animation */}
                <div className="absolute inset-0 rounded-xl border border-white/10 
                  group-hover:border-red-400/30 transition-colors duration-300"></div>
              </Link>
            ))}
          </div>
          
          {/* Decorative elements */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              <span>STONI</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}