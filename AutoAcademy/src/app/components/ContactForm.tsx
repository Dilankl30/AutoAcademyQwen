import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../utils/api';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitContact(formData);
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      toast.success('✅ Mensaje enviado. Te responderemos pronto.');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-3">
            ¿Tienes dudas?
          </span>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Contáctanos</h3>
          <p className="text-gray-500">Nuestro equipo está listo para ayudarte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje enviado!</h4>
                <p className="text-gray-500 mb-5">Nos pondremos en contacto contigo pronto.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-lg font-bold text-gray-900 mb-5">Envíanos un mensaje</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu nombre"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tu@email.com"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-5">Información de contacto</h4>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'contacto@autoacademy.com', href: 'mailto:contacto@autoacademy.com' },
                  { icon: Phone, label: 'Teléfono', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
                  { icon: MapPin, label: 'Dirección', value: '123 Tech Street, Ciudad Tecnológica', href: '#' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</p>
                      <a href={item.href} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h5 className="font-semibold text-gray-800 mb-3">Horario de atención</h5>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Lunes - Viernes</span>
                  <span className="font-medium text-gray-700">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sábado</span>
                  <span className="font-medium text-gray-700">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Domingo</span>
                  <span className="font-medium text-red-500">Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
