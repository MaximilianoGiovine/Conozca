import PageShell from '@/components/magazine/PageShell'
import { useTranslations } from 'next-intl'
import { siteConfig } from '@/config/siteConfig'

export default function AboutPage() {
    const t = useTranslations('About')

    return (
        <PageShell>
            <div className="bg-amber-50/30 py-20 lg:py-32">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="font-heading text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            {t.rich('title', {
                                highlight: (chunks) => <span className="text-amber-600">{chunks}</span>,
                                firmName: siteConfig.firmName,
                                city: siteConfig.contact.city,
                                country: siteConfig.contact.country
                            })}
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed font-body">
                            {siteConfig.firmDescription}
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-20 lg:py-32 border-t border-amber-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-wider mb-6">
                                Nuestra Misión
                            </div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                Periodismo que invita a la reflexión y al enfoque.
                            </h2>
                            <div className="space-y-6 text-gray-600 font-body text-lg leading-relaxed">
                                <p>
                                    En un mundo saturado de información rápida y distracciones constantes, **Conozca** nace como un refugio editorial. Nuestra misión es curar historias que merecen tu tiempo, analizando profundamente la intersección entre la cultura contemporánea, el desarrollo de negocios éticos y la excelencia en el diseño.
                                </p>
                                <p>
                                    Creemos en el poder de la lectura pausada. Cada artículo, cada análisis y cada recomendación en nuestra plataforma está pensado para aportar claridad y valor real a tu vida profesional y personal. No buscamos el clic fácil, buscamos la conexión profunda.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
                                {/* Fallback pattern if image is not provided */}
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-gray-900/20 mix-blend-multiply" />
                                <div className="flex items-center justify-center h-full p-12 text-center">
                                    <div className="space-y-4">
                                        <div className="text-6xl font-heading font-black text-amber-500 opacity-50">CONOZCA</div>
                                        <p className="text-gray-400 italic">"Historias pensadas para mentes enfocadas"</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-amber-500 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white p-6 rotate-3">
                                <div className="text-4xl font-heading font-bold">100%</div>
                                <div className="text-xs uppercase tracking-widest font-bold text-center mt-2">Compromiso Editorial</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-950 py-24 text-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">2024</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">Año de Lanzamiento</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">+50</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">Temas Curados</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">9k</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">Lectores Mensuales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    )
}
