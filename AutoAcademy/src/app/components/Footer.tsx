import { Zap, Mail, Phone, Youtube, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AutoAcademy</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              La plataforma líder en formación técnica sobre motores eléctricos y sistemas automotrices.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Youtube, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h6 className="font-semibold mb-4 text-gray-200">Recursos</h6>
            <ul className="space-y-2.5">
              {['Cursos', 'Guías PDF', 'Videos técnicos', 'Blog', 'Webinars'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h6 className="font-semibold mb-4 text-gray-200">Empresa</h6>
            <ul className="space-y-2.5">
              {['Sobre nosotros', 'Contacto', 'Carreras', 'Instructores', 'Afiliados'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Legal */}
          <div>
            <h6 className="font-semibold mb-4 text-gray-200">Contacto</h6>
            <div className="space-y-2.5 mb-6">
              <a href="mailto:contacto@autoacademy.com" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4" />
                contacto@autoacademy.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </a>
            </div>
            <h6 className="font-semibold mb-3 text-gray-200">Legal</h6>
            <ul className="space-y-2">
              {['Términos de uso', 'Política de privacidad', 'Cookies', 'Reembolsos'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} AutoAcademy. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs">
            Hecho con ❤️ para profesionales del sector eléctrico
          </p>
        </div>
      </div>
    </footer>
  );
}
