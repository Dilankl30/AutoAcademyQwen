import { X, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

export default function AuthModal({ initialMode, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
        // If login succeeds, onClose is called from parent
      } else {
        await onRegister(email, password);
        setShowConfirmation(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Email confirmation screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h3>
          <p className="text-gray-500 mb-2">
            Enviamos un enlace de verificación a:
          </p>
          <p className="font-semibold text-blue-600 mb-5 text-lg">{email}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>Abre el correo de AutoAcademy en tu bandeja de entrada</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>Haz clic en el enlace de confirmación</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>Serás redirigido automáticamente a la plataforma</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            ¿No lo encuentras? Revisa la carpeta de spam o correo no deseado.
          </p>
          <button
            onClick={() => switchMode('login')}
            className="text-blue-600 text-sm hover:underline font-medium"
          >
            ¿Ya confirmaste? Inicia sesión →
          </button>
          <button
            onClick={onClose}
            className="block w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Top gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            {mode === 'login'
              ? 'Ingresa tus datos para continuar'
              : 'Regístrate para acceder a todos los cursos'}
          </p>
        </div>

        <div className="p-6">
          {/* Mode tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password */}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : mode === 'login' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Admin hint */}
          {mode === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Admin: admin@autoacademy.com
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
