import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SalasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
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
            <span>17 °C - Bratislava</span>
            <span>Cambiar</span>
            <span>Domingo, 14. 12. Bratislava, Bratislava</span>
          </div>
        </div>
      </nav>

      {/* Header with Logo and Navigation */}
      <header className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">LoCuToRiO</span>
            </Link>
            <span className="text-gray-600">LosCanarias</span>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/mi-espacio" className="text-gray-600 hover:text-blue-600">Qué hay de nuevo</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">correo rápido</a>
              <a href="#" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                email
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600">amigos</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">PLUS</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">buscar</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="/salas" className="text-blue-600 font-medium">salas</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">usuarios</a>
            <a href="#" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              stretko
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
            </a>
            <button className="text-gray-600 hover:text-blue-600">🔔</button>
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Room List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Salas</h2>
            </div>
            <Input
              type="text"
              placeholder="Buscar sala"
              className="w-full"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-500 mb-2 flex items-center justify-between">
                <span>Favoritas</span>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">Gestionar</Button>
              </div>

              {/* Favorite Rooms */}
              <div className="space-y-1 mb-4">
                <button className="w-full p-3 rounded-lg hover:bg-blue-50 text-left flex items-center gap-3 bg-blue-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    Z
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Zoznamka</div>
                    <div className="text-xs text-gray-500">334 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white">
                    😊
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">De buen humor</div>
                    <div className="text-xs text-gray-500">105 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white">
                    ❤️
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Sexoznamka</div>
                    <div className="text-xs text-gray-500">1368 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Jóvenes espíritus</div>
                    <div className="text-xs text-gray-500">15 personas</div>
                  </div>
                </button>
              </div>

              <div className="text-sm font-semibold text-gray-500 mb-2">Principales</div>
              <div className="space-y-1 mb-4">
                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    Z
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Zoznamka</div>
                    <div className="text-xs text-gray-500">334 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white">
                    😊
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">De buen humor</div>
                    <div className="text-xs text-gray-500">94 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Jóvenes espíritus</div>
                    <div className="text-xs text-gray-500">15 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white">
                    📖
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Aficionados a los libros</div>
                    <div className="text-xs text-gray-500">10 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    V
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Veteranos</div>
                    <div className="text-xs text-gray-500">9 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white">
                    ☕
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Kavlareň</div>
                    <div className="text-xs text-gray-500">7 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    N
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">EN LOCUTORIO</div>
                    <div className="text-xs text-gray-500">2 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Romantika</div>
                    <div className="text-xs text-gray-500">2 personas</div>
                  </div>
                </button>
              </div>

              <div className="text-sm font-semibold text-gray-500 mb-2">Regiones y ciudades</div>
              <div className="space-y-1">
                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Poprad</div>
                    <div className="text-xs text-gray-500">25 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    Ž
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Žilina</div>
                    <div className="text-xs text-gray-500">21 personas</div>
                  </div>
                </button>

                <button className="w-full p-3 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    K
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Košice</div>
                    <div className="text-xs text-gray-500">20 personas</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button className="m-4 w-12 h-12 bg-blue-500 rounded-full text-white flex items-center justify-center text-2xl shadow-lg hover:bg-blue-600">
            +
          </button>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                Z
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Zoznamka</h2>
                <div className="text-sm text-gray-500">▼ 334 personas online</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-200 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  <circle cx="19" cy="12" r="1" fill="currentColor"/>
                  <circle cx="5" cy="12" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Chat Messages */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">jauztotonepoch...</span>
                  <span className="text-xs text-gray-500">Z / 35 / NR</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">Na hlavu bol 😂😂</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Malcoma72</span>
                  <span className="text-xs text-gray-500">M / 53 / MI</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">Ahoj mája 10-10</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">ilvinka.27</span>
                  <span className="text-xs text-gray-500">Ž / 46 / LM</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">👍 Tomm, Yum @ilvinka.27 mam krizu stredného veku</p>
                <p className="text-gray-700">Tomáško 😂😂</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">janko.m44</span>
                  <span className="text-xs text-gray-500">M / 7 / BY</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">FEŠANDA NA STRETÁVANIE A SI ZO ŽILINY BYTČE A OKOLIA PÍŠTE RP</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Mildonado</span>
                  <span className="text-xs text-gray-500">M / 31 / TT</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">chce nejaká spoznať muža na vozíku? potetovaná potešť</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">86bully</span>
                  <span className="text-xs text-gray-500">M / 7 / ZV</span>
                  <span className="text-xs text-gray-400">10:29</span>
                </div>
                <p className="text-gray-700">CHATA NA SAMOTE (na prenájom) ......... je vhodná na NERUŠENÉ AKCIE, rodinné oslavy, školenia, firemné akcie, ROZLÚČKY SO SLOBODOU ......... len RP</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Escribe un mensaje. @ marca el destinatario"
                className="flex-1"
              />
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                😊
              </button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                Enviar →
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Online Users */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <button className="text-gray-600 hover:text-blue-600">ℹ️</button>
            </div>

            <h3 className="font-bold text-gray-900 mb-4">Personas en la sala</h3>
            <div className="text-sm text-blue-600 mb-4 cursor-pointer">▼ Filtrar personas: zapatos</div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">1111Lenka11111</div>
                  <div className="text-xs text-gray-500">Ž / 40 / Zámutov</div>
                </div>
              </div>

              <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">123petrana</div>
                  <div className="text-xs text-gray-500">Ž / 46 / Košice - Myslava</div>
                </div>
              </div>

              <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">17Natalka1</div>
                  <div className="text-xs text-gray-500">Ž / 23 / Zlaté Moravce</div>
                </div>
              </div>

              <div className="text-center text-gray-500 text-sm py-4">
                El contenido contiene publicidad bajo reclamo
              </div>

              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white text-center">
                <div className="mb-2">💬</div>
                <h4 className="font-bold mb-1">LoCuToRiO sin anuncios</h4>
                <p className="text-sm mb-3">Activa Pluško y usa LoCuToRiO completo, sin anuncios.</p>
              </div>

              <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">1989.Jany</div>
                  <div className="text-xs text-gray-500">Ž / 36 / Dolný Kubín</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
