/**
 * Componente: Tips para subir foto de perfil
 * Muestra guía visual de qué fotos se aceptan
 */

export function PhotoUploadTips() {
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-300 mb-3">
        📸 Requisitos para tu foto de perfil
      </h3>
      
      <div className="space-y-3 text-sm">
        {/* Lo que SÍ se acepta */}
        <div>
          <div className="font-semibold text-green-400 mb-2">✅ Foto correcta:</div>
          <ul className="space-y-1 text-gray-300 ml-4">
            <li>• Tu rostro debe ocupar la <strong>mayor parte de la imagen</strong></li>
            <li>• Solo <strong>una persona</strong> en la foto (no fotos grupales)</li>
            <li>• Foto <strong>clara y nítida</strong> (mínimo 400×400 px)</li>
            <li>• Sin gafas de sol oscuras</li>
            <li>• Sin texto, logos o marcas de agua</li>
          </ul>
        </div>

        {/* Lo que NO se acepta */}
        <div>
          <div className="font-semibold text-red-400 mb-2">❌ Foto incorrecta:</div>
          <ul className="space-y-1 text-gray-300 ml-4">
            <li>• Fotos de <strong>cuerpo completo</strong> (rostro muy pequeño)</li>
            <li>• Fotos grupales (2 o más personas)</li>
            <li>• Fotos borrosas o de baja calidad</li>
            <li>• Fotos con gafas de sol que tapan tus ojos</li>
            <li>• Fotos con texto o logos superpuestos</li>
          </ul>
        </div>

        {/* Ejemplo visual */}
        <div className="flex gap-4 mt-3">
          <div className="flex-1">
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">😊</div>
              <div className="text-xs text-green-300">✅ Primer plano</div>
              <div className="text-xs text-gray-400">Rostro 40-60%</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">🧍</div>
              <div className="text-xs text-red-300">❌ Cuerpo completo</div>
              <div className="text-xs text-gray-400">Rostro &lt; 30%</div>
            </div>
          </div>
        </div>

        {/* Nota final */}
        <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-2 mt-3">
          <p className="text-xs text-yellow-200">
            💡 <strong>Tip:</strong> Toma una selfie o foto tipo retrato. 
            Tu cara debe verse claramente y ocupar la mayor parte de la imagen.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Ejemplo de uso en el formulario:
 * 
 * import { PhotoUploadTips } from '@/components/PhotoUploadTips';
 * 
 * function ProfilePhotoUpload() {
 *   return (
 *     <div>
 *       <PhotoUploadTips />
 *       
 *       <input type="file" accept="image/*" onChange={handleUpload} />
 *       <button>Subir foto</button>
 *     </div>
 *   );
 * }
 */
