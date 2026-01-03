import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function EditarPerfilPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-[#293e52] text-white py-2 px-4">
        <div className="max-w-full mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:opacity-80">AZET SERVICIOS</a>
            <a href="#" className="font-bold">AZET</a>
            <a href="#" className="font-bold text-white">LOCUTORIO</a>
            <a href="#" className="hover:opacity-80">EMAIL</a>
            <a href="#" className="hover:opacity-80">TIEMPO</a>
            <a href="#" className="hover:opacity-80">VIDEO</a>
            <a href="#" className="hover:opacity-80">CÓCTEL</a>
            <a href="#" className="hover:opacity-80">USUARIO</a>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>2 °C - Bratislava</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">LoCuToRiO</span>
            </Link>
            <span className="text-gray-600">LosCanarias</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/mi-espacio" className="text-gray-600 hover:text-blue-600">salas</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">usuarios</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">stretko</a>
          </div>
        </div>
      </header>

      {/* Profile Header with Stars Background */}
      <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 py-8" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='white' opacity='0.3'/%3E%3Ccircle cx='50' cy='30' r='1' fill='white' opacity='0.2'/%3E%3Ccircle cx='80' cy='60' r='1' fill='white' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }}>
        <div className="max-w-4xl mx-auto px-4 flex items-start gap-6">
          <div className="relative">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          <div className="flex-1 text-white pt-4">
            <h1 className="text-3xl font-bold mb-1">LosCanarias</h1>
            <p className="text-blue-200">Hombre / 55 / Banská Bystrica</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Vista del perfil
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              Configuración
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="7" width="3" height="9"/>
                <rect x="14" y="7" width="3" height="5"/>
              </svg>
              Fotos
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="p-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-gray-200 flex items-center justify-center mb-3">
                  <span className="text-4xl font-bold text-gray-700">89</span>
                </div>
                <p className="text-sm text-gray-600">Perfil completado de forma decente.</p>
              </div>

              <nav className="space-y-1">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="font-medium">Algo sobre mí</span>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    <span>Relaciones</span>
                  </div>
                  <span className="text-green-600">✓</span>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                    <span>Cultura</span>
                  </div>
                  <span className="text-green-600">✓</span>
                </button>

                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Estilo de vida</span>
                </button>
              </nav>

              <div className="mt-6 bg-gray-800 rounded-lg p-4 text-white text-center">
                <div className="mb-3">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="mx-auto text-yellow-400">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="text-sm mb-2">Completa elementos destacados como posiciones, para que sea más fácil para alguien encontrarte!</p>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Algo sobre mí
              </h2>

              {/* Frases cortas */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Breve sobre mí</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No busco nada..."
                  defaultValue="Niepotrebujem sa hrať na niečo čo nie som, len aby som zaujal. Náčo by to bolo dobré? Radšej budem sám sebou aj keby som mal zostať sám."
                />
              </div>

              {/* Altura y Peso */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Altura</label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue="183" className="w-20" />
                    <span className="flex items-center text-gray-600">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso</label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue="95" className="w-20" />
                    <span className="flex items-center text-gray-600">kg</span>
                  </div>
                </div>
              </div>

              {/* Tipo de cuerpo */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de cuerpo</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="body" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="body" className="w-4 h-4" />
                    <span>delgado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="body" className="w-4 h-4" />
                    <span>promedio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="body" className="w-4 h-4" />
                    <span>deportista</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="body" className="w-4 h-4" />
                    <span>completo</span>
                  </label>
                </div>
                <Input
                  type="text"
                  placeholder="¿Qué más agregar?"
                  className="mt-3"
                />
              </div>

              {/* Color de ojos */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Color de ojos</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>negro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>marrón</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>verde</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>azul</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="eyes" className="w-4 h-4" />
                    <span>gris</span>
                  </label>
                </div>
              </div>

              {/* Color de cabello */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Color de cabello</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4" />
                    <span>rubio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4" />
                    <span>negro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4" />
                    <span>marrón</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4" />
                    <span>rojizo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hair" className="w-4 h-4 checked:bg-blue-600" defaultChecked />
                    <span>otro</span>
                  </label>
                </div>
              </div>

              {/* Educación completada */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Educación completada</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="education" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="education" className="w-4 h-4" />
                    <span>básico</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="education" className="w-4 h-4" />
                    <span>secundaria</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="education" className="w-4 h-4" />
                    <span>licenciatura</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="education" className="w-4 h-4" />
                    <span>superior</span>
                  </label>
                </div>
                <Input
                  type="text"
                  placeholder="Por ejemplo, nombre de escuela o dirección"
                  className="mt-3"
                />
              </div>

              {/* Profesión */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Profesión</label>
                <Input
                  type="text"
                  placeholder="¿Cuál es tu trabajo?"
                  className="w-full"
                />
              </div>

              {/* Relación con el tabaquismo */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Relación con el tabaquismo</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="smoking" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="smoking" className="w-4 h-4" />
                    <span>cuídate de mí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="smoking" className="w-4 h-4" />
                    <span>nunca fumo</span>
                  </label>
                </div>
              </div>

              {/* Signo del zodiaco */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Signo del zodiaco</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>no diría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>carnero</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>toro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>geminis</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>león</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>panna</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>escorpio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>sagitario</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>cabra</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>vodnar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>conejo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="zodiac" className="w-4 h-4" />
                    <span>pez</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                  Guardar cambios
                </Button>
                <Button variant="outline">
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
