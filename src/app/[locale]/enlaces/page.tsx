import PageShell from '@/components/magazine/PageShell';
import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';

interface ResourceLink {
    title: string;
    description: string;
    href: string;
    imagePath?: string;
}

export default function EnlacesPage() {
    const resources: ResourceLink[] = [
        {
            title: 'Servicio de Educación Cristiana (SEC)',
            href: 'https://www.servicioad.net',
            imagePath: '/images/sec.jpg',
            description: 'El Servicio de Educación Cristiana de las Asambleas de Dios en América Latina (SEC) consiste de una gran red de ministerios vinculados a la formación de discípulos y ministros de la Palabra de habla hispana en los 20 países de toda América Latina y el Caribe. Revista Conozca es el órgano oficial del SEC.'
        },
        {
            title: 'Centro de Recursos y Asesoría (CRA)',
            href: 'https://www.elasesor.org',
            imagePath: '/images/cra.jpg',
            description: 'El CRA es una organización dedicada a la facilitación del intercambio de ideas entre maestros y administrativos de escuelas e institutos bíblicos en América Latina para fomentar su desarrollo y perfeccionamiento.'
        },
        {
            title: 'Instituto de Superación Ministerial (ISUM)',
            href: 'https://www.isumad.org',
            imagePath: '/images/isum.png',
            description: 'El ISUM ofrece estudios teológicos al nivel de Licenciatura para aquellos ministros graduados de institutos bíblicos cuyas demandas en la obra de Dios les impiden asistir a una institución teológica residencial. El ISUM les da la oportunidad de proseguir con sus estudios a través de seminarios itinerantes de estudios intensivos combinados con tareas de investigación post-seminario.'
        },
        {
            title: 'Facultad de Teología',
            href: 'https://www.facultadad.org',
            imagePath: '/images/facultad.gif',
            description: 'La Facultad de Teología es un seminario de nivel posgrado que ofrece estudios presenciales en formato modular en diferentes de América Latina y el Caribe. Ofrece los títulos de Maestría en Teología Práctica y Maestría en Educación Cristiana.'
        },
        {
            title: 'Asociación Teológica de América Latina (ATAL)',
            href: 'https://www.atalad.net',
            description: 'ATAL es la asociación de acreditación propia del SEC que sirve a institutos bíblicos, seminarios, y profesores de Biblia y Teología de América Latina con procesos de evaluación y certificación de calidad.'
        },
        {
            title: 'Asistencia Bibliotecaria para América Latina y el Caribe (ABALC)',
            href: 'https://www.lacls.org',
            imagePath: '/images/abal.png',
            description: 'ABALC tiene la misión de ayudar en el desarrollo de las bibliotecas de los institutos bíblicos de América Latina y el Caribe para así mejorar la capacitación de pastores y líderes.'
        }
    ];

    return (
        <PageShell>
            <div className="container mx-auto py-20 px-4 md:px-8 max-w-5xl">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        Enlaces de Interés
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {resources.map((resource) => (
                        <a
                            key={resource.title}
                            href={resource.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                                    {resource.title}
                                </h3>
                                <ExternalLinkIcon className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-amber-600 transition-colors ml-4" />
                            </div>

                            {resource.imagePath && (
                                <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
                                    {/* Using standard img to easily handle missing files without Next Image hard-breaking if the file isn't uploaded yet */}
                                    <img 
                                        src={resource.imagePath} 
                                        alt={`Logo de ${resource.title}`}
                                        className="max-h-full max-w-full object-contain p-2"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <span className="absolute text-xs text-gray-400 -z-10 text-center px-4">
                                        Imagen pendiente: {resource.imagePath}
                                    </span>
                                </div>
                            )}

                            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed mt-auto">
                                {resource.description}
                            </p>
                        </a>
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
