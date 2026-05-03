import { BookOpen, Video, Lock, ExternalLink, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User } from '../hooks/useAuth';

// Import course cover images
import img1 from '../../imports/image-1.png';
import img2 from '../../imports/image-2.png';
import img3 from '../../imports/image-3.png';
import img4 from '../../imports/image-4.png';
import img5 from '../../imports/image-5.png';
import img6 from '../../imports/image-6.png';
import img7 from '../../imports/image-7.png';
import img8 from '../../imports/image-8.png';
import img9 from '../../imports/image-9.png';
import img10 from '../../imports/image-10.png';

const COURSE_IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

interface Course {
  id: number;
  title: string;
  description?: string;
  package_requirement: string;
  type: string;
  image_color: string;
  idrive_link?: string;
}

interface CourseGridProps {
  user: User | null;
  onOpenAuth: () => void;
}

// Package access levels
const PACKAGE_LEVELS: Record<string, number> = {
  'Básico': 1,
  'Profesional': 2,
  'Completo': 3,
};

const PACKAGE_BADGE_COLORS: Record<string, string> = {
  'Básico': 'bg-blue-100 text-blue-700',
  'Profesional': 'bg-indigo-100 text-indigo-700',
  'Completo': 'bg-purple-100 text-purple-700',
};

export default function CourseGrid({ user, onOpenAuth }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'book' | 'video'>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (course: Course): boolean => {
    if (!user || !user.subscription) return false;
    const userLevel = PACKAGE_LEVELS[user.subscription.packages?.name] || 0;
    const requiredLevel = PACKAGE_LEVELS[course.package_requirement] || 99;
    return userLevel >= requiredLevel;
  };

  const handleCourseClick = (course: Course) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (canAccess(course)) {
      if (course.idrive_link) {
        window.open(course.idrive_link, '_blank');
      } else {
        alert('El link de este curso estará disponible pronto.');
      }
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredCourses = courses.filter(c =>
    filter === 'all' ? true : c.type === filter
  );

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-3">
              Biblioteca de contenido
            </span>
            <h3 className="text-3xl font-bold text-gray-900">Cursos y Materiales</h3>
            <p className="text-gray-500 mt-1">Contenido técnico especializado en motores eléctricos</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl self-start md:self-end">
            {(['all', 'book', 'video'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' && 'Todos'}
                {f === 'book' && <><BookOpen className="w-4 h-4" /> PDFs</>}
                {f === 'video' && <><Video className="w-4 h-4" /> Videos</>}
              </button>
            ))}
          </div>
        </div>

        {/* User plan info */}
        {user && !user.subscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-500" />
              <p className="text-blue-700 text-sm font-medium">
                Suscríbete a un plan para acceder a los cursos
              </p>
            </div>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Ver planes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No hay cursos disponibles aún.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course, index) => {
              const accessible = canAccess(course);
              const imgSrc = COURSE_IMAGES[index % COURSE_IMAGES.length];

              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                    !accessible && user ? 'opacity-80' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                      {course.type === 'book' ? (
                        <><BookOpen className="w-3 h-3" /> PDF</>
                      ) : (
                        <><Video className="w-3 h-3" /> Video</>
                      )}
                    </div>

                    {/* Lock overlay */}
                    {!accessible && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white text-xs font-medium">
                          {!user ? 'Inicia sesión' : `Requiere plan ${course.package_requirement}`}
                        </p>
                      </div>
                    )}

                    {/* Access indicator */}
                    {accessible && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Acceder
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>
                    {course.description && (
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                    )}
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                      PACKAGE_BADGE_COLORS[course.package_requirement] || 'bg-gray-100 text-gray-600'
                    }`}>
                      Plan {course.package_requirement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
