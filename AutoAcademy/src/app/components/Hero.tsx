import { Star, Play, BookOpen, Zap, Users, Award } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="hero" className="relative bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-blue-100">Plataforma #1 en Motores Eléctricos</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Domina los<br />
              <span className="text-yellow-400">Motores Eléctricos</span><br />
              como un Pro
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Aprende desde fundamentos básicos hasta aplicaciones industriales avanzadas.
              Guías de taller, casos prácticos y recursos descargables en un solo lugar.
            </p>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-blue-100 text-sm">4.9 · <strong className="text-white">2,340+</strong> estudiantes</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl hover:bg-yellow-300 font-semibold transition-all shadow-lg shadow-yellow-400/20"
              >
                <Zap className="w-5 h-5" />
                Comenzar ahora
              </button>
              <button
                onClick={scrollToCourses}
                className="flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 font-medium transition-all"
              >
                <Play className="w-5 h-5" />
                Ver cursos
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:ml-8">
            {[
              { icon: BookOpen, label: 'Cursos disponibles', value: '10+', color: 'text-blue-300' },
              { icon: Users, label: 'Estudiantes activos', value: '2,340', color: 'text-green-300' },
              { icon: Award, label: 'Certificados emitidos', value: '1,200', color: 'text-yellow-300' },
              { icon: Star, label: 'Calificación promedio', value: '4.9/5', color: 'text-pink-300' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1200 0 840 60 720 30C600 0 240 60 0 30L0 60Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}
