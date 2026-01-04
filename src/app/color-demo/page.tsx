export default function ColorDemoPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Demostración de Colores - LoCuToRiO
      </h1>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: #1A2226 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ backgroundColor: '#1A2226' }}
        >
          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-2">#1A2226</p>
            <p className="text-gray-300 text-sm mb-4">Gris azulado muy oscuro</p>
            <div className="w-full h-12 rounded" style={{ backgroundColor: '#1A2226' }}></div>
          </div>
        </div>

        {/* Tarjeta 2: #144214 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ backgroundColor: '#144214' }}
        >
          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-2">#144214</p>
            <p className="text-gray-300 text-sm mb-4">Verde bosque</p>
            <p className="text-gray-400 text-xs mb-4">rgba(20, 66, 20, 0.45)</p>
            <div className="w-full h-12 rounded" style={{ backgroundColor: '#144214' }}></div>
          </div>
        </div>

        {/* Tarjeta 3: rgba(15, 45, 25, 0.4) */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ backgroundColor: 'rgba(15, 45, 25, 0.4)' }}
        >
          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-2">#0F2D19</p>
            <p className="text-gray-300 text-sm mb-4">Verde oscuro</p>
            <p className="text-gray-400 text-xs mb-4">rgba(15, 45, 25, 0.4)</p>
            <div className="w-full h-12 rounded" style={{ backgroundColor: 'rgba(15, 45, 25, 0.4)' }}></div>
          </div>
        </div>

        {/* Tarjeta 4: #2BEE79 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ backgroundColor: '#2BEE79' }}
        >
          <div className="text-center">
            <p className="text-black font-bold text-2xl mb-2">#2BEE79</p>
            <p className="text-gray-900 text-sm mb-4">Verde neon</p>
            <div className="w-full h-12 rounded" style={{ backgroundColor: '#2BEE79' }}></div>
          </div>
        </div>

        {/* Tarjeta 5: #10B981 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ backgroundColor: '#10B981' }}
        >
          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-2">#10B981</p>
            <p className="text-gray-100 text-sm mb-4">Verde esmeralda</p>
            <p className="text-gray-200 text-xs mb-4">emerald-600</p>
            <div className="w-full h-12 rounded" style={{ backgroundColor: '#10B981' }}></div>
          </div>
        </div>

        {/* Tarjeta 6: Gradiente #1A2226 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ 
            background: 'radial-gradient(circle at top, rgba(26, 34, 38, 0.8), rgba(26, 34, 38, 1))' 
          }}
        >
          <div className="text-center">
            <p className="text-white font-bold text-2xl mb-2">Gradiente</p>
            <p className="text-gray-300 text-sm mb-4">#1A2226 (radial)</p>
            <p className="text-gray-400 text-xs mb-4">rgba(26, 34, 38, 0.8) → #1A2226</p>
            <div className="w-full h-12 rounded" style={{ 
              background: 'radial-gradient(circle at top, rgba(26, 34, 38, 0.8), rgba(26, 34, 38, 1))' 
            }}></div>
          </div>
        </div>

        {/* Tarjeta 7: Gradiente #2BEE79 → #10B981 */}
        <div 
          className="rounded-xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[200px]"
          style={{ 
            background: 'linear-gradient(135deg, #2BEE79, #10B981)' 
          }}
        >
          <div className="text-center">
            <p className="text-black font-bold text-2xl mb-2">Gradiente</p>
            <p className="text-gray-900 text-sm mb-4">Verde neon → Esmeralda</p>
            <p className="text-gray-800 text-xs mb-4">#2BEE79 → #10B981</p>
            <div className="w-full h-12 rounded" style={{ 
              background: 'linear-gradient(135deg, #2BEE79, #10B981)' 
            }}></div>
          </div>
        </div>

      </div>

      {/* Leyenda */}
      <div className="max-w-4xl mx-auto mt-12 bg-white/5 rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Notas sobre los colores:</h2>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><strong className="text-white">#1A2226</strong> - Gris azulado muy oscuro (sidebar, tarjetas secundarias)</li>
          <li><strong className="text-white">#144214</strong> - Verde bosque = rgba(20, 66, 20, 1) sin transparencia</li>
          <li><strong className="text-white">rgba(15, 45, 25, 0.4)</strong> - Verde oscuro con transparencia = #0F2D19 con alpha 0.4</li>
          <li><strong className="text-white">#2BEE79</strong> - Verde neon (acentos, botones activos)</li>
          <li><strong className="text-white">#10B981</strong> - Verde esmeralda (emerald-600 de Tailwind)</li>
          <li><strong className="text-white">Gradiente radial #1A2226</strong> - Para fondos con profundidad</li>
          <li><strong className="text-white">Gradiente lineal #2BEE79 → #10B981</strong> - Para botones premium/destacados</li>
        </ul>
      </div>

      {/* Comparación lado a lado */}
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-white font-bold mb-2 text-center">Colores para tarjetas</h3>
          <div className="space-y-2">
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A2226' }}>
              <span className="text-white font-mono text-sm">#1A2226</span>
            </div>
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#144214' }}>
              <span className="text-white font-mono text-sm">#144214</span>
            </div>
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 45, 25, 0.4)' }}>
              <span className="text-white font-mono text-sm">rgba(15,45,25,0.4)</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-2 text-center">Colores para acentos</h3>
          <div className="space-y-2">
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2BEE79' }}>
              <span className="text-black font-mono text-sm">#2BEE79</span>
            </div>
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
              <span className="text-white font-mono text-sm">#10B981</span>
            </div>
            <div className="h-20 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2BEE79, #10B981)' }}>
              <span className="text-white font-mono text-sm">Gradiente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
