"use client";

/**
 * Página de prueba para verificar dimensiones exactas
 * Rectángulo: 400px ancho × 520px alto
 * Ratio: 10:13 (400/520 = 10/13 = 0.769...)
 */

export default function TestRatioPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-4">Prueba de Ratio 10:13</h1>
        <p className="text-gray-400 mb-8">400px ancho × 520px alto</p>
        
        {/* Rectángulo exacto 400x520 */}
        <div 
          className="bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white mx-auto"
          style={{
            width: '400px',
            height: '520px'
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="text-6xl mb-4">📏</div>
            <div className="text-xl font-bold">400px × 520px</div>
            <div className="text-sm mt-2">Ratio: 10:13</div>
            <div className="text-xs mt-4 opacity-70">
              400 ÷ 520 = 0.769 = 10/13
            </div>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <p>✅ Ancho fijo: 400px</p>
          <p>✅ Alto fijo: 520px</p>
          <p>✅ Ratio matemático: 10:13</p>
        </div>
      </div>
    </div>
  );
}
