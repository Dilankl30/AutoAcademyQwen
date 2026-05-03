import { Search, Zap, LogOut, Settings, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail?: string;
  subscriptionName?: string;
  onLogout: () => void;
  onAdminClick: () => void;
}

const PACKAGE_COLORS: Record<string, string> = {
  'Básico': 'bg-blue-100 text-blue-700',
  'Profesional': 'bg-indigo-100 text-indigo-700',
  'Completo': 'bg-purple-100 text-purple-700',
};

export default function Header({
  onLoginClick,
  onRegisterClick,
  isLoggedIn,
  isAdmin,
  userEmail,
  subscriptionName,
  onLogout,
  onAdminClick,
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-blue-600 hidden sm:block">AutoAcademy</h1>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-6">
          <button onClick={() => scrollTo('hero')} className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Inicio</button>
          <button onClick={() => scrollTo('pricing')} className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Planes</button>
          <button onClick={() => scrollTo('courses')} className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Cursos</button>
          <button onClick={() => scrollTo('contact')} className="text-gray-600 hover:text-blue-600 text-sm transition-colors">Contacto</button>
        </nav>

        {/* Search */}
        <div className="relative hidden lg:block">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar cursos..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {subscriptionName && (
                <span className={`hidden sm:inline-flex px-2 py-1 rounded-full text-xs font-medium ${PACKAGE_COLORS[subscriptionName] || 'bg-gray-100 text-gray-600'}`}>
                  {subscriptionName}
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="hidden sm:inline text-gray-700 max-w-[120px] truncate">{userEmail}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                    <p className="px-4 py-2 text-xs text-gray-500 border-b truncate">{userEmail}</p>
                    <button
                      onClick={() => { onLogout(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onLoginClick}
                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={onRegisterClick}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
