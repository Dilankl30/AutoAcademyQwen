import { X, Search, Edit, Trash2, Plus, Mail, Users, BookOpen, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../utils/api';

interface AdminPanelProps {
  onClose: () => void;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  package_requirement: string;
  type: string;
  idrive_link?: string;
  image_color: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  subscriptions: Array<{
    status: string;
    packages: { name: string; price: number };
  }>;
}

type Tab = 'courses' | 'messages' | 'users';

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Course>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    package_requirement: 'Básico',
    type: 'book',
    idrive_link: '',
    image_color: 'bg-blue-600',
  });

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === 'courses') {
        const data = await api.getCourses();
        setCourses(data || []);
      } else if (tab === 'messages') {
        const data = await api.getContactMessages();
        setMessages(data || []);
      } else if (tab === 'users') {
        const data = await api.getUsers();
        setUsers(data || []);
      }
    } catch (error: any) {
      toast.error(`Error al cargar datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    try {
      await api.createCourse(newCourse);
      setShowAddForm(false);
      setNewCourse({ title: '', description: '', package_requirement: 'Básico', type: 'book', idrive_link: '', image_color: 'bg-blue-600' });
      await loadData('courses');
      toast.success('✅ Curso creado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear curso');
    }
  };

  const handleStartEdit = (course: Course) => {
    setEditingId(course.id);
    setEditData({ ...course });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await api.updateCourse(editingId, editData);
      setEditingId(null);
      await loadData('courses');
      toast.success('✅ Curso actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar curso');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;
    try {
      await api.deleteCourse(id);
      await loadData('courses');
      toast.success('Curso eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar curso');
    }
  };

  const TABS = [
    { id: 'courses' as Tab, label: 'Cursos', icon: BookOpen, count: courses.length },
    { id: 'messages' as Tab, label: 'Mensajes', icon: MessageSquare, count: messages.length },
    { id: 'users' as Tab, label: 'Usuarios', icon: Users, count: users.length },
  ];

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Panel de Administrador</h3>
            <p className="text-purple-200 text-sm">Gestiona cursos, mensajes y usuarios</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 bg-white">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cursos..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showAddForm ? 'Cancelar' : 'Nuevo curso'}
                </button>
              </div>

              {/* Add course form */}
              {showAddForm && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-5">
                  <h4 className="font-semibold text-purple-900 mb-4">Agregar nuevo curso</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
                      <input
                        type="text"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Nombre del curso"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 h-16 resize-none"
                        placeholder="Descripción breve del curso"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Paquete requerido</label>
                      <select
                        value={newCourse.package_requirement}
                        onChange={(e) => setNewCourse({ ...newCourse, package_requirement: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Básico">Básico</option>
                        <option value="Profesional">Profesional</option>
                        <option value="Completo">Completo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={newCourse.type}
                        onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="book">PDF/Libro</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Link IDrive</label>
                      <input
                        type="url"
                        value={newCourse.idrive_link}
                        onChange={(e) => setNewCourse({ ...newCourse, idrive_link: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://app.idrive.com/..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddCourse}
                    className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Crear curso
                  </button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Paquete</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[200px]">Link IDrive</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            {editingId === course.id ? (
                              <input
                                value={editData.title || ''}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              <span className="font-medium text-gray-800">{course.title}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {editingId === course.id ? (
                              <select
                                value={editData.package_requirement || ''}
                                onChange={(e) => setEditData({ ...editData, package_requirement: e.target.value })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="Básico">Básico</option>
                                <option value="Profesional">Profesional</option>
                                <option value="Completo">Completo</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.package_requirement === 'Básico' ? 'bg-blue-100 text-blue-700' :
                                course.package_requirement === 'Profesional' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {course.package_requirement}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 capitalize">{course.type}</td>
                          <td className="py-3 px-4">
                            {editingId === course.id ? (
                              <input
                                value={editData.idrive_link || ''}
                                onChange={(e) => setEditData({ ...editData, idrive_link: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="https://idrive.com/..."
                              />
                            ) : (
                              <span className="text-xs text-gray-500 truncate max-w-[200px] block">
                                {course.idrive_link || '—'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {editingId === course.id ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(course)}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(course.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCourses.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No hay cursos para mostrar</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No hay mensajes de contacto</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-700 font-semibold text-sm">
                              {msg.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{msg.name}</p>
                            <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {msg.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.created_at).toLocaleString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="mt-3 pl-13">
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 ml-13">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Suscripción</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Rol</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Registrado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((usr) => {
                        const activeSub = usr.subscriptions?.find(s => s.status === 'active');
                        return (
                          <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 text-xs font-semibold">
                                    {usr.email?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-gray-800">{usr.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {activeSub ? (
                                <span className="flex items-center gap-1.5 text-xs">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    {activeSub.packages?.name} — ${activeSub.packages?.price}/mes
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin suscripción</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                usr.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {usr.is_admin ? '👑 Admin' : 'Usuario'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">
                              {new Date(usr.created_at).toLocaleDateString('es-ES')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No hay usuarios registrados</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
