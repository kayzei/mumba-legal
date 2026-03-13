import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Billing', path: '/billing', icon: CreditCard },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-midnight text-white">
        <div className="p-8 border-b border-white/10">
          <h1 className="font-serif text-2xl tracking-widest text-champagne uppercase">Mumba & Partners</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">Legal Practitioners</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3 transition-all duration-300 ${
                  isActive 
                    ? 'bg-champagne text-white' 
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-serif tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-6 px-4">
            <div className="w-10 h-10 bg-champagne flex items-center justify-center text-white font-serif text-xl">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-serif">{profile?.displayName}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/50">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-4 px-4 py-3 w-full text-white/50 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-serif tracking-wide">Secure Exit</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-midnight text-white p-4 z-50 flex justify-between items-center">
        <h1 className="font-serif text-lg tracking-widest text-champagne uppercase">Mumba & Partners</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 bg-midnight text-white z-40 pt-20"
          >
            <nav className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-4 px-4 py-4 border-b border-white/5"
                >
                  <item.icon size={24} />
                  <span className="font-serif text-xl">{item.name}</span>
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-4 px-4 py-4 w-full text-white/50"
              >
                <LogOut size={24} />
                <span className="font-serif text-xl">Secure Exit</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-0">
        <header className="hidden lg:flex h-20 bg-white border-b border-midnight/5 items-center justify-between px-10">
          <div className="flex items-center space-x-2 text-midnight/40 text-xs uppercase tracking-widest">
            <span>Portal</span>
            <span>/</span>
            <span className="text-midnight">{location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-midnight/40">KYC Status</p>
              <p className={`text-xs font-medium ${profile?.kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {profile?.kycStatus?.toUpperCase()}
              </p>
            </div>
            <div className="w-px h-8 bg-midnight/10" />
            <User className="text-midnight/20" size={20} />
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
