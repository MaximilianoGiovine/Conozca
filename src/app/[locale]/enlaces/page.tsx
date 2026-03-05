import PageShell from '@/components/magazine/PageShell';
import { ExternalLinkIcon } from 'lucide-react';

export default function EnlacesPage() {
    const links = [
        {
            category: 'Recursos Académicos',
            items: [
                { title: 'Google Scholar', description: 'Buscador de literatura académica y científica.', href: 'https://scholar.google.com' },
                { title: 'JSTOR', description: 'Biblioteca digital para investigadores y estudiantes.', href: 'https://www.jstor.org' },
                { title: 'Academia.edu', description: 'Plataforma para compartir trabajos de investigación.', href: 'https://www.academia.edu' },
            ]
        },
        {
            category: 'Herramientas Editoriales',
            items: [
                { title: 'DeepL Translate', description: 'Traductor de alta precisión para textos complejos.', href: 'https://www.deepl.com' },
                { title: 'LanguageTool', description: 'Asistente de escritura y corrección gramatical.', href: 'https://languagetool.org/es' },
                { title: 'Grammarly', description: 'Herramienta de mejora de escritura en inglés.', href: 'https://www.grammarly.com' },
            ]
        },
        {
            category: 'Inspiración y Diseño',
            items: [
                { title: 'Behance', description: 'Plataforma para mostrar y descubrir trabajos creativos.', href: 'https://www.behance.net' },
                { title: 'Pinterest - Editorial Design', description: 'Tableros de diseño editorial y tipografía.', href: 'https://www.pinterest.com/search/posts/?q=editorial%20design' },
                { title: 'The New York Times Open', description: 'Cómo el NYT aborda la tecnología y el diseño.', href: 'https://open.nytimes.com' },
            ]
        }
    ];

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-5xl">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        Enlaces de Interés
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Una curación de recursos, herramientas y plataformas que utilizamos y recomendamos en <span className="text-amber-600 font-semibold">Conozca</span>.
                    </p>
                </div>

                <div className="space-y-16">
                    {links.map((section) => (
                        <div key={section.category}>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 pb-3 border-b border-gray-100 dark:border-gray-800">
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.items.map((link) => (
                                    <a
                                        key={link.title}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                                {link.title}
                                            </h3>
                                            <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {link.description}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
