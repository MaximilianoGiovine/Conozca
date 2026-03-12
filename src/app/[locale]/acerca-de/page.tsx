import PageShell from '@/components/magazine/PageShell'
import { siteConfig } from '@/config/siteConfig'
import Image from 'next/image'

export default function AboutPage() {
    return (
        <PageShell>
            {/* Hero Section */}
            <div className="bg-amber-50/30 py-20 lg:py-32">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-heading text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Sobre <span className="text-amber-600">Nosotros</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed font-body">
                            Revista CONOZCA es el organismo oficial del Servicio de Educación Cristiana de las Asambleas de Dios en América Latina (SEC).
                        </p>
                    </div>
                </div>
            </div>

            {/* Quiénes Somos Section */}
            <div className="py-20 lg:py-32 border-t border-amber-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-wider mb-6">
                                Quiénes Somos
                            </div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                Un foro orgánico de la educación cristiana
                            </h2>
                            <div className="space-y-6 text-gray-600 font-body text-lg leading-relaxed">
                                <p>
                                    Nuestra revista cuenta con tres propósitos principales: <strong>difundir información y noticias</strong> sobre la educación cristiana, servir como <strong>foro de discusión teológica</strong> enfrentando corrientes que amenazan la fe, y, por último, <strong>alentar a nuevos escritores</strong> para que descubran su llamado publicando y aportando al desarrollo en América Latina.
                                </p>
                                <p>
                                    La revista fomenta activamente la retroalimentación de los lectores. El diálogo enriquece nuestra comprensión de los temas, por lo que esperamos una participación siempre pertinente y edificante.
                                </p>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Comisión Editorial</h3>
                                    <p className="text-base text-gray-600">
                                        <strong>Editor Ejecutivo:</strong> Nicolás Marcón.<br/>
                                        <strong>Miembros:</strong> Jaime Mazurek, Silverio Manuel Bello, Jorge Canto, Esteban Pari, Betty Zenone, Pablo Kazim y Jon Dahlager.
                                    </p>
                                </div>
                                <p className="text-base">
                                    Contacto directo: <a href="mailto:conozcaeditor@gmail.com" className="text-amber-600 font-semibold hover:underline">conozcaeditor@gmail.com</a>
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl relative">
                                <Image 
                                    src="/images/quienes_somos.png" 
                                    alt="Comunidad editorial y teológica" 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historia Section */}
            <div className="py-20 lg:py-32 bg-gray-900 text-gray-300">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                        
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-800">
                                <Image 
                                    src="/images/historia.png" 
                                    alt="Evolución histórica de Conozca" 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-amber-400 text-sm font-bold uppercase tracking-wider mb-6">
                                Historia
                            </div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-6">
                                Desde "El Instituto" en 1961 hasta el medio digital moderno
                            </h2>
                            <div className="space-y-6 text-gray-400 font-body text-lg leading-relaxed">
                                <p>
                                    Nuestros comienzos se remontan a 1961, cuando se publicaba el boletín <strong>"El Instituto"</strong> para directores de institutos bíblicos. En enero de 1971, bajo la dirección editorial de Samuel Balius, adoptamos el nombre de <strong>CONOZCA</strong>, iniciando un formato trimestral en 1977.
                                </p>
                                <p>
                                    El legado se fortaleció gracias a líderes como Lyle Thompson y especialmente Floyd Woodworth, quien invirtió 20 años dirigiendo la revista. A lo largo de los años fue cedido a líderes visionarios, como Edgardo Muñoz (quien digitalizó la revista por primera vez en 2002), y posteriormente Jaime Mazurek.
                                </p>
                                <p>
                                    Hoy, al tiempo que trabajamos en reponer al sitio nuestra rica colección de más de sesenta años de material histórico impreso, mantenemos nuestra meta irrenunciable: proveer contenido de alta calidad en línea para las nuevas generaciones de América Latina y del mundo.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Misión Section */}
            <div className="py-20 lg:py-32 border-t border-amber-100">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold uppercase tracking-wider mb-6">
                                Nuestra Misión
                            </div>
                            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                El norte de nuestro servicio
                            </h2>
                            <div className="space-y-4 text-gray-600 font-body text-lg leading-relaxed">
                                <p>
                                    La misión de Conozca es proporcionar un foro indispensable para:
                                </p>
                                <ul className="space-y-3 mt-4">
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">1.</span>
                                        <span><strong>Informar y actualizar</strong> a la familia educativa de las Asambleas de Dios de habla hispana.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">2.</span>
                                        <span><strong>Promover la tarea</strong> de los diferentes ministerios del SEC.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">3.</span>
                                        <span><strong>Realzar la labor del educador</strong> en la iglesia local, ministerio y posgrado.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">4.</span>
                                        <span><strong>Facilitar el estudio e investigación</strong> permanente.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">5.</span>
                                        <span><strong>Apoyar la sana doctrina</strong> pentecostal.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">6.</span>
                                        <span><strong>Fomentar el desarrollo de escritores</strong> y proveerles un medio de difusión local.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-amber-500 font-bold shrink-0">7.</span>
                                        <span><strong>Preservar el legado histórico</strong> irremplazable del SEC.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl relative">
                                <Image 
                                    src="/images/mision.png" 
                                    alt="Ilustración abstracta de la Misión de Conozca" 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Estética Footer Section */}
            <div className="bg-gray-950 py-24 text-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">1961</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">Primera Edición</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">+60</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">Años de Servicio</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-heading font-bold text-amber-500 mb-2">SEC</div>
                                <div className="text-gray-400 uppercase tracking-widest text-xs font-bold">América Latina</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    )
}
