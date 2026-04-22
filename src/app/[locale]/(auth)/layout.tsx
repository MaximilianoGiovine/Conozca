export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel - Conozca Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1008 0%, #2d1f0a 40%, #0f0f1a 100%)' }}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-lg">C</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl block leading-tight">Conozca</span>
              <span className="text-amber-400/70 text-xs">La voz del SEC en América Latina</span>
            </div>
          </div>

          {/* Main copy */}
          <div>
            <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-4">Revista Digital</p>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Conocimiento que<br />
              <span className="text-amber-400">transforma</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
              Accedé al panel editorial de Conozca. Gestioná artículos, autores y la comunidad de lectores.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">
              {[
                'Editor académico multiidioma',
                'Traducción automática a 4 idiomas',
                'Moderación de comentarios',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-amber-400" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-l-2 border-amber-500/40 pl-4">
            <p className="text-gray-400 text-sm italic">
              &quot;La unión de cultura, fe y pensamiento crítico.&quot;
            </p>
          </div>
        </div>

        {/* Decorative glows */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
