"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeVisitadoPage() {
  const visited = [
    { id: 1, username: "sofia-m", name: "Sofía M.", age: 24, city: "Madrid", gender: "M", time: "Hace 3 min", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic", online: true },
    { id: 2, username: "pablo-r", name: "Pablo R.", age: 29, city: "Barcelona", gender: "H", time: "Hace 15 min", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ", online: false },
    { id: 3, username: "elena-g", name: "Elena G.", age: 26, city: "Valencia", gender: "M", time: "Hace 32 min", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB", online: true },
    { id: 4, username: "diego-s", name: "Diego S.", age: 31, city: "Sevilla", gender: "H", time: "Hace 1 hora", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk", online: false },
  ];

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/mi-espacio" className="flex items-center gap-2">
          <div className="size-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide">LoCuToRiO</span>
        </Link>

        <button
          onClick={() => window.close()}
          className="text-connect-muted hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Perfiles que he visitado</h1>
          <p className="text-connect-muted">Has visitado 45 perfiles esta semana</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-connect-border">
          <button className="px-4 py-2 text-sm font-medium text-white border-b-2 border-primary">
            Hoy (12)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-connect-muted hover:text-white transition-colors">
            Esta semana (45)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-connect-muted hover:text-white transition-colors">
            Este mes (289)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-connect-muted hover:text-white transition-colors">
            Todas
          </button>
        </div>

        {/* Visited Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visited.map((user) => (
            <Link
              key={user.id}
              href={`/perfil/${user.username}`}
              target="_blank"
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 cursor-pointer">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                {user.online && (
                  <span className="absolute bottom-2 right-2 w-3 h-3 bg-primary border-2 border-connect-card rounded-full"></span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                  {user.name}
                </p>
                <p className="text-xs text-connect-muted">
                  {user.gender} • {user.age} • {user.city}
                </p>
                <p className="text-[10px] text-connect-muted mt-0.5">{user.time}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-connect-border text-white hover:bg-white/5"
          >
            Cargar más
          </Button>
        </div>
      </main>
    </div>
  );
}
