"use client";
import { useMessages } from "@/contexts/MessagesContext";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function BuscarPage() {
  const [ageMin, setAgeMin] = useState(18);
  const { openMessages } = useMessages();
  const [ageMax, setAgeMax] = useState(35);
  const [selectedGender, setSelectedGender] = useState("Mujer");
  const [selectedCity, setSelectedCity] = useState("Caracas");

  // Usuarios de ejemplo - ORDENADOS: primero ONLINE, luego OFFLINE
  const allUsers = [
    { id: 1, name: "Marta", age: 24, city: "Caracas", interests: ["Cine", "Viajes", "Fotografía"], online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 3, name: "Elena", age: 22, city: "Valencia", interests: ["Música", "Festivales", "Arte"], online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic" },
    { id: 4, name: "David", age: 30, city: "Maracaibo", interests: ["Cocina", "Vino"], online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 6, name: "Sergio", age: 29, city: "Barquisimeto", interests: ["Surf", "Playa"], online: true, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    // OFFLINE después
    { id: 2, name: "Carlos", age: 28, city: "Maracay", interests: ["Deportes", "Fitness"], online: false, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 5, name: "Laura", age: 26, city: "Mérida", interests: ["Lectura", "Gatos", "Café"], online: false, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw" },
  ];

  const users = allUsers;

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold">LoCuToRiO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white">Mi Espacio Personal</Link>
          <button onClick={() => openMessages()} className="text-sm font-medium text-gray-400 hover:text-white">Mensajes</button>
          <Link href="/notificaciones" className="text-sm font-medium text-gray-400 hover:text-white">Notificaciones</Link>
          <Link href="/userprofile" className="text-sm font-medium text-gray-400 hover:text-white">Mi Perfil</Link>
        </nav>

        <Button variant="outline" className="hidden md:block bg-connect-card border-connect-border text-white hover:bg-white/5">
          Cerrar Sesión
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex justify-center py-8 px-4 md:px-8">
        <div className="max-w-[1280px] w-full flex flex-col gap-6">

          {/* Page Heading */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-connect-border">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Encuentra tu conexión</h1>
              <p className="text-connect-muted text-base">Utiliza los filtros para buscar personas con tus mismos intereses.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold text-lg">1,240</span>
              <span className="text-white text-lg">usuarios activos ahora</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Sidebar Filters */}
            <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-24">
              <div className="bg-connect-card rounded-xl p-5 border border-connect-border">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h2 className="text-white text-xl font-bold">Filtros</h2>
                </div>

                {/* Name Search */}
                <div className="space-y-2 mb-6">
                  <label className="text-white text-sm font-medium">Buscar usuario</label>
                  <Input
                    placeholder="Nombre o nick..."
                    className="bg-connect-bg-dark border-connect-border text-white placeholder-connect-muted"
                  />
                </div>

                {/* Age Range - Dual Slider (18-99 años) */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-white text-sm font-medium">
                    <span>Edad</span>
                    <span className="text-primary">{ageMin} - {ageMax}</span>
                  </div>
                  <div className="relative h-10 flex items-center">
                    {/* Fondo del slider */}
                    <div className="absolute w-full h-1 bg-connect-border rounded-full"></div>
                    {/* Barra activa entre los dos valores */}
                    <div
                      className="absolute h-1 bg-primary rounded-full pointer-events-none"
                      style={{
                        left: `${((ageMin - 18) / (99 - 18)) * 100}%`,
                        right: `${100 - ((ageMax - 18) / (99 - 18)) * 100}%`
                      }}
                    ></div>

                    {/* Slider MIN */}
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={ageMin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= ageMax - 1) setAgeMin(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-lg"
                      style={{ zIndex: ageMin > ageMax - 10 ? 5 : 3 }}
                    />

                    {/* Slider MAX */}
                    <input
                      type="range"
                      min="18"
                      max="99"
                      value={ageMax}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= ageMin + 1) setAgeMax(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-lg"
                      style={{ zIndex: 4 }}
                    />
                  </div>
                  <p className="text-xs text-connect-muted">Mínimo: 18 años (legal) • Máximo: 99 años</p>
                </div>

                {/* Gender */}
                <div className="space-y-2 mb-6">
                  <label className="text-white text-sm font-medium">Sexo</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedGender("Hombre")}
                      className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                        selectedGender === "Hombre"
                          ? "bg-primary text-connect-bg-dark font-bold"
                          : "bg-connect-bg-dark text-connect-muted border border-connect-border hover:bg-white/5"
                      }`}
                    >
                      Hombre
                    </button>
                    <button
                      onClick={() => setSelectedGender("Mujer")}
                      className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                        selectedGender === "Mujer"
                          ? "bg-primary text-connect-bg-dark font-bold"
                          : "bg-connect-bg-dark text-connect-muted border border-connect-border hover:bg-white/5"
                      }`}
                    >
                      Mujer
                    </button>
                    <button
                      onClick={() => setSelectedGender("Todos")}
                      className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                        selectedGender === "Todos"
                          ? "bg-primary text-connect-bg-dark font-bold"
                          : "bg-connect-bg-dark text-connect-muted border border-connect-border hover:bg-white/5"
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>

                {/* Estado - Venezuela */}
                <div className="space-y-2 mb-6">
                  <label className="text-white text-sm font-medium">Estado</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-connect-bg-dark border border-connect-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    <option>Distrito Capital (Caracas)</option>
                    <option>Miranda</option>
                    <option>Zulia (Maracaibo)</option>
                    <option>Carabobo (Valencia)</option>
                    <option>Lara (Barquisimeto)</option>
                    <option>Aragua (Maracay)</option>
                    <option>Anzoátegui (Barcelona)</option>
                    <option>Táchira (San Cristóbal)</option>
                    <option>Mérida</option>
                    <option>Bolívar (Ciudad Bolívar)</option>
                    <option>Portuguesa (Guanare)</option>
                    <option>Sucre (Cumaná)</option>
                    <option>Monagas (Maturín)</option>
                    <option>Falcón (Coro)</option>
                    <option>Vargas</option>
                  </select>
                </div>

                {/* Looking For */}
                <div className="space-y-3 mb-6">
                  <label className="text-white text-sm font-medium">Buscan</label>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="rounded-full border border-connect-border bg-connect-bg-dark px-3 py-1.5 text-xs font-medium text-connect-muted peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                        Pareja
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="rounded-full border border-connect-border bg-connect-bg-dark px-3 py-1.5 text-xs font-medium text-connect-muted peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                        Amistad
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="rounded-full border border-connect-border bg-connect-bg-dark px-3 py-1.5 text-xs font-medium text-connect-muted peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary transition-all">
                        Charlar
                      </div>
                    </label>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3 mb-8">
                  <label className="text-white text-sm font-medium">Intereses</label>
                  <div className="flex flex-wrap gap-2">
                    {["Cine", "Deportes", "Viajes", "Música", "Gaming"].map((interest) => (
                      <span
                        key={interest}
                        className={`rounded-full px-3 py-1 text-xs cursor-pointer transition-colors ${
                          interest === "Deportes"
                            ? "bg-primary text-connect-bg-dark font-bold"
                            : "bg-connect-bg-dark border border-connect-border text-connect-muted hover:text-white"
                        }`}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold py-3 rounded-full flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Aplicar Filtros
                </Button>
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 w-full">

              {/* Sorting */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-connect-muted text-sm">
                  <span className="text-white font-bold">148</span> resultados encontrados
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-connect-muted text-sm hidden sm:block">Ordenar por:</span>
                  <select className="bg-connect-card border border-connect-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary">
                    <option>Más recientes</option>
                    <option>Más populares</option>
                    <option>Cercanía</option>
                  </select>
                </div>
              </div>

              {/* User Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="group bg-connect-card rounded-2xl p-5 border border-connect-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div
                        className="size-28 rounded-full bg-cover bg-center border-4 border-connect-bg-dark group-hover:border-primary/20 transition-colors"
                        style={{ backgroundImage: `url('${user.avatar}')` }}
                      ></div>
                      <div
                        className={`absolute bottom-1 right-1 size-5 rounded-full border-4 border-connect-card ${
                          user.online ? "bg-primary" : "bg-gray-500"
                        }`}
                      ></div>
                    </div>

                    <div className="text-center w-full mb-4">
                      <h3 className="text-white text-xl font-bold group-hover:text-primary transition-colors">
                        {user.name}, {user.age}
                      </h3>
                      <p className="text-connect-muted text-sm flex items-center justify-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {user.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5 mb-5 h-12 overflow-hidden">
                      {user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-white/5 text-connect-muted text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-auto">
                      <Link
                        href={`/publicprofile/${user.name.toLowerCase()}`}
                        className="py-2 px-4 rounded-full border border-connect-border text-white text-sm font-bold hover:bg-white/5 transition-colors text-center"
                      >
                        Ver Perfil
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <button className="w-full py-2 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2zm10 4h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M4 18h16" />
                          </svg>
                          Invitar
                        </button>

                        {user.online ? (
                            <button onClick={() => openMessages(user.id)} className="w-full py-2 px-3 rounded-full bg-primary hover:brightness-110 text-connect-bg-dark text-xs font-bold shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_25px_rgba(43,238,121,0.5)] transition-all flex items-center justify-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              MP
                            </button>
                        ) : (
                          <button disabled className="w-full py-2 px-3 rounded-full bg-white/5 text-white/50 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            MP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button className="size-10 flex items-center justify-center rounded-full bg-connect-card border border-connect-border text-white hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="size-10 flex items-center justify-center rounded-full bg-primary text-connect-bg-dark font-bold">
                    1
                  </button>
                  <button className="size-10 flex items-center justify-center rounded-full bg-connect-card border border-connect-border text-white hover:bg-white/5 transition-colors">
                    2
                  </button>
                  <button className="size-10 flex items-center justify-center rounded-full bg-connect-card border border-connect-border text-white hover:bg-white/5 transition-colors">
                    3
                  </button>
                  <span className="flex items-end justify-center px-1 text-connect-muted">...</span>
                  <button className="size-10 flex items-center justify-center rounded-full bg-connect-card border border-connect-border text-white hover:bg-white/5 transition-colors">
                    12
                  </button>
                  <button className="size-10 flex items-center justify-center rounded-full bg-connect-card border border-connect-border text-white hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
