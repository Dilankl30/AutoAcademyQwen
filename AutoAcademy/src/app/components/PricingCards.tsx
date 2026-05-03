import { Check, Star, Zap, Shield, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { User } from '../hooks/useAuth';

interface Package {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  features: string[];
  is_highlighted: boolean;
}

interface PricingCardsProps {
  user: User | null;
  onOpenAuth: () => void;
  onSubscribed: () => void;
}

const FALLBACK_PACKAGES: Package[] = [
  {
    id: 1,
    name: 'Básico',
    subtitle: 'Ideal para comenzar',
    price: 10,
    features: [
      'Acceso a cursos básicos',
      'Material en PDF',
      'Soporte por email',
      'Actualizaciones mensuales',
      'Comunidad de aprendizaje',
    ],
    is_highlighted: false,
  },
  {
    id: 2,
    name: 'Profesional',
    subtitle: 'El más popular',
    price: 20,
    features: [
      'Todo lo del plan Básico',
      'Cursos en video HD',
      'Soporte prioritario 48h',
      'Acceso a webinars en vivo',
      'Certificados de curso',
      'Ejercicios prácticos',
    ],
    is_highlighted: true,
  },
  {
    id: 3,
    name: 'Completo',
    subtitle: 'Para profesionales',
    price: 30,
    features: [
      'Todo lo del plan Profesional',
      'Cursos avanzados exclusivos',
      'Sesiones 1 a 1 con instructor',
      'Acceso vitalicio al contenido',
      'Recursos y herramientas extra',
      'Soporte 24/7',
    ],
    is_highlighted: false,
  },
];

const PLAN_ICONS: Record<string, React.ElementType> = {
  'Básico': Zap,
  'Profesional': Star,
  'Completo': Crown,
};

const PLAN_COLORS = {
  normal: {
    card: 'bg-white border-gray-200',
    icon: 'bg-blue-100 text-blue-600',
    price: 'text-blue-600',
    btn: 'bg-blue-600 text-white hover:bg-blue-700',
    badge: '',
  },
  highlighted: {
    card: 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-white',
    icon: 'bg-white/20 text-white',
    price: 'text-white',
    btn: 'bg-yellow-400 text-blue-900 hover:bg-yellow-300',
    badge: 'bg-yellow-400 text-blue-900',
  },
};

export default function PricingCards({ user, onOpenAuth, onSubscribed }: PricingCardsProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await api.getPackages();
      setPackages(data && data.length > 0 ? data : FALLBACK_PACKAGES);
    } catch (error) {
      setPackages(FALLBACK_PACKAGES);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (pkg: Package) => {
    if (!user) {
      toast.info('Inicia sesión para suscribirte a un plan');
      onOpenAuth();
      return;
    }

    // Check if already on this plan
    if (user.subscription?.packages?.name === pkg.name) {
      toast.info(`Ya tienes el plan ${pkg.name} activo`);
      return;
    }

    setSubscribing(pkg.id);
    try {
      await api.createSubscription(pkg.id);
      toast.success(`✅ ¡Suscripción al plan ${pkg.name} activada!`);
      onSubscribed();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar la suscripción');
    } finally {
      setSubscribing(null);
    }
  };

  const userPlanName = user?.subscription?.packages?.name;

  const getButtonLabel = (pkg: Package) => {
    if (subscribing === pkg.id) return 'Procesando...';
    if (userPlanName === pkg.name) return '✓ Plan activo';
    if (!user) return 'Comenzar';
    return 'Seleccionar plan';
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Planes y precios
          </span>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el plan ideal para ti
          </h3>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Accede a cursos técnicos especializados en motores eléctricos. Sin contratos, cancela cuando quieras.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
            {packages.map((pkg) => {
              const isHighlighted = pkg.is_highlighted;
              const colors = isHighlighted ? PLAN_COLORS.highlighted : PLAN_COLORS.normal;
              const Icon = PLAN_ICONS[pkg.name] || Zap;
              const isCurrentPlan = userPlanName === pkg.name;

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-2xl ${colors.card} ${
                    isHighlighted ? 'shadow-2xl shadow-blue-500/30 md:scale-105 md:-my-4' : 'shadow-md hover:-translate-y-1'
                  } ${isCurrentPlan ? 'ring-2 ring-green-400' : ''}`}
                >
                  {/* Popular badge */}
                  {isHighlighted && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${colors.badge}`}>
                      ⭐ Más Popular
                    </div>
                  )}

                  {/* Active badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ Activo
                    </div>
                  )}

                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                        {pkg.name}
                      </h4>
                      <p className={`text-sm ${isHighlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                        {pkg.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className={`text-5xl font-extrabold ${colors.price}`}>
                        ${pkg.price}
                      </span>
                      <span className={`text-sm mb-2 ${isHighlighted ? 'text-blue-200' : 'text-gray-500'}`}>
                        /mes
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`border-t mb-6 ${isHighlighted ? 'border-blue-600' : 'border-gray-100'}`}></div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {(Array.isArray(pkg.features) ? pkg.features : []).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isHighlighted ? 'bg-white/20' : 'bg-blue-100'
                        }`}>
                          <Check className={`w-3 h-3 ${isHighlighted ? 'text-white' : 'text-blue-600'}`} />
                        </div>
                        <span className={`text-sm ${isHighlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(pkg)}
                    disabled={subscribing === pkg.id || isCurrentPlan}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 ${colors.btn} ${
                      isCurrentPlan ? 'opacity-80 cursor-default' : ''
                    } ${subscribing === pkg.id ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {getButtonLabel(pkg)}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Pago seguro · Cancela cuando quieras · Sin compromisos
          </p>
        </div>
      </div>
    </section>
  );
}
