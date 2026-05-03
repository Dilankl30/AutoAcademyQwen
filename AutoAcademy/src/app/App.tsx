import { useState } from 'react';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Hero from './components/Hero';
import PricingCards from './components/PricingCards';
import CourseGrid from './components/CourseGrid';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { user, loading, signIn, signUp, signOut, refreshUser } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    setAuthModal(null);
  };

  const handleRegister = async (email: string, password: string) => {
    await signUp(email, password);
    // Don't close modal — AuthModal will show the confirmation screen
  };

  const handleLogout = async () => {
    await signOut();
    setShowAdminPanel(false);
  };

  const handleSelectPlan = (packageId: number) => {
    if (!user) {
      setAuthModal('login');
    }
    // If user is logged in, subscription is handled inside PricingCards
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando AutoAcademy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" richColors />

      <Header
        onLoginClick={() => setAuthModal('login')}
        onRegisterClick={() => setAuthModal('register')}
        isLoggedIn={!!user}
        isAdmin={user?.is_admin || false}
        userEmail={user?.email}
        subscriptionName={user?.subscription?.packages?.name}
        onLogout={handleLogout}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      <main className="flex-1">
        <Hero onGetStarted={() => setAuthModal('register')} />
        <PricingCards
          user={user}
          onOpenAuth={() => setAuthModal('login')}
          onSubscribed={refreshUser}
        />
        <CourseGrid user={user} onOpenAuth={() => setAuthModal('login')} />
        <ContactForm />
      </main>

      <Footer />

      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {showAdminPanel && user?.is_admin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}
