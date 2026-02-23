/**
 * Componente: Tips para subir fotos de perfil
 * Filosofía: Primera foto = selfie obligatoria, resto = variedad (cuerpo, poses, etc.)
 * @param isFirstPhoto - Si es true, muestra requisitos de primera foto (selfie)
 */

interface PhotoUploadTipsProps {
  isFirstPhoto?: boolean;
}

export function PhotoUploadTips({ isFirstPhoto = false }: PhotoUploadTipsProps) {
  if (isFirstPhoto) {
    // Tips para PRIMERA FOTO (selfie obligatoria)
    return (
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">
          📸 Tu Primera Foto (Selfie de Verificación)
        </h3>
        
        <div className="space-y-3 text-sm">
          <p className="text-gray-300">
            Tu primera foto debe ser tipo <strong>selfie</strong> para verificar tu identidad.
          </p>
          
          <div>
            <div className="font-semibold text-green-400 mb-2">✅ Requisitos:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Foto de <strong>tu rostro</strong> (tipo selfie o documento)</li>
              <li>• Tu cara debe ser <strong>clara y visible</strong> (mínimo 30%)</li>
              <li>• <strong>Solo tú</strong> en la foto (no amigos ni familia)</li>
              <li>• Sin gafas de sol que tapen tus ojos</li>
              <li>• Foto clara y nítida</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-3">
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">😊</div>
                <div className="text-xs text-green-300">✅ Perfecto</div>
                <div className="text-xs text-gray-400">Selfie de rostro</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">🧍</div>
                <div className="text-xs text-red-300">❌ No válida</div>
                <div className="text-xs text-gray-400">Cuerpo completo</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-2 mt-3">
            <p className="text-xs text-yellow-200">
              💡 <strong>Después</strong> podrás agregar fotos de cuerpo completo, 
              poses, sentado, parado, etc. ¡Esta es solo la primera!
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    // Tips para FOTOS ADICIONALES (variedad y personalidad)
    return (
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">
          🖼️ Fotos Adicionales (Muestra tu Personalidad)
        </h3>
        
        <div className="space-y-3 text-sm">
          <p className="text-gray-300">
            Crea tu imagen con <strong>variedad</strong>: cuerpo completo, poses, sentado, parado, etc.
          </p>
          
          <div>
            <div className="font-semibold text-green-400 mb-2">✅ Puedes subir:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• <strong>Selfies</strong> adicionales ✅</li>
              <li>• Fotos de <strong>cuerpo completo</strong> ✅</li>
              <li>• Fotos <strong>sentado, parado, acostado</strong> ✅</li>
              <li>• Diferentes <strong>poses y ángulos</strong> ✅</li>
              <li>• Tu rostro visible (aunque sea pequeño)</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-red-400 mb-2">❌ NO se acepta:</div>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• <strong>Fotos con amigos o familia</strong> → Van al álbum</li>
              <li>• <strong>Gafas de sol oscuras</strong> → Van al álbum</li>
              <li>• Contenido explícito (desnudez)</li>
              <li>• Fotos donde no aparezcas tú</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">😊</div>
                <div className="text-xs text-green-300">✅ Selfie</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">🧍</div>
                <div className="text-xs text-green-300">✅ Cuerpo</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">🪑</div>
                <div className="text-xs text-green-300">✅ Sentado</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-2 text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-xs text-red-300">❌ Grupal</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-2 mt-3">
            <p className="text-xs text-blue-200">
              🎯 <strong>Objetivo:</strong> Mostrar diferentes aspectos de <strong>TI</strong>, 
              no de tus amigos. Crea tu imagen variada y única.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Ejemplo de uso:
 * 
 * // Primera foto del usuario
 * <PhotoUploadTips isFirstPhoto={true} />
 * 
 * // Fotos adicionales
 * <PhotoUploadTips isFirstPhoto={false} />
 */
