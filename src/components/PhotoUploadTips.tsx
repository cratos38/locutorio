/**
 * Componente: Tips para subir foto de perfil
 * Muestra guía visual de qué fotos se aceptan
 * @param isPrincipal - Si es true, muestra requisitos estrictos. Si es false, muestra requisitos relajados.
 */

interface PhotoUploadTipsProps {
  isPrincipal?: boolean;
}

export function PhotoUploadTips({ isPrincipal = true }: PhotoUploadTipsProps) {
  if (isPrincipal) {
    // Tips para FOTO PRINCIPAL (estricta)
    return (
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">
          📸 Foto Principal (Verificación de Identidad)
        </h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-semibold text-green-400 mb-2">✅ Requisitos:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Tu rostro debe ocupar <strong>al menos 30%</strong> de la imagen</li>
              <li>• Solo <strong>una persona</strong> en la foto</li>
              <li>• Foto <strong>clara y nítida</strong> (mínimo 400×400 px)</li>
              <li>• Sin gafas de sol oscuras</li>
              <li>• Sin texto, logos o marcas de agua</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-3">
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">😊</div>
                <div className="text-xs text-green-300">✅ Primer plano</div>
                <div className="text-xs text-gray-400">Rostro 30-60%</div>
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

          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-2 mt-3">
            <p className="text-xs text-yellow-200">
              💡 <strong>Importante:</strong> Esta foto verifica tu identidad. 
              Después puedes agregar fotos de cuerpo completo en tu galería.
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    // Tips para FOTOS ADICIONALES (relajadas)
    return (
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">
          🖼️ Fotos Adicionales (Galería de Perfil)
        </h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-semibold text-green-400 mb-2">✅ Puedes subir:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Fotos de <strong>cuerpo completo</strong> ✅</li>
              <li>• Fotos de <strong>medio cuerpo</strong> ✅</li>
              <li>• Fotos de <strong>primer plano</strong> ✅</li>
              <li>• Tu rostro debe ser <strong>visible al menos 10%</strong></li>
              <li>• Solo una persona en la foto</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-red-400 mb-2">❌ No se acepta:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Contenido explícito (desnudos)</li>
              <li>• Fotos grupales (2+ personas)</li>
              <li>• Fotos donde no se ve tu rostro</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">😊</div>
                <div className="text-xs text-green-300">✅ Primer plano</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">👔</div>
                <div className="text-xs text-green-300">✅ Medio cuerpo</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">🧍</div>
                <div className="text-xs text-yellow-300">⚠️ Cuerpo entero</div>
                <div className="text-xs text-gray-400">(revisión)</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-2 mt-3">
            <p className="text-xs text-blue-200">
              ℹ️ Las fotos de cuerpo completo pueden requerir revisión manual del administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }
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
