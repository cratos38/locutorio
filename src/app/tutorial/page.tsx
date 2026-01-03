"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function TutorialPage() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-connect-bg-dark text-white font-display">
      <header className="flex w-full items-center justify-between px-6 py-6 md:px-10 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">LoCuToRiO</span>
        </Link>

        <Link
          href="/"
          className="group flex cursor-pointer items-center justify-center rounded-full bg-transparent px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-primary hover:bg-white/5"
        >
          <span>Saltar tutorial</span>
          <svg className="ml-1 w-[18px] h-[18px] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center relative w-full px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col w-full max-w-[1024px] z-10 gap-8 md:gap-12">
          <div className="flex flex-col items-center text-center space-y-4 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
              Bienvenido a <span className="text-primary">LoCuToRiO</span>
            </h1>
            <p className="text-connect-muted text-lg md:text-xl font-normal max-w-2xl leading-relaxed">
              Descubre una nueva forma de conectar. Desde chats en vivo hasta álbumes privados, tu espacio social comienza aquí.
            </p>
          </div>

          <div className="w-full relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
              <Link href="/connect/tutorial/la-cuenta">
              <Card className="w-full flex flex-col gap-4 rounded-3xl bg-connect-card p-4 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 cursor-pointer hover:border-primary/50">
                <div className="w-full aspect-[4/3] rounded-2xl bg-black/20 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                    <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-lg font-bold text-white">La Cuenta</p>
                  <p className="text-sm text-connect-muted leading-relaxed">
                    Guía completa sobre tu perfil, seguridad, verificación y reglas de la comunidad.
                  </p>
                </div>
              </Card>
              </Link>

              <Link href="/connect/tutorial/chat">
              <Card className="w-full flex flex-col gap-4 rounded-3xl bg-connect-card p-4 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 cursor-pointer hover:border-primary/50">
                <div className="w-full aspect-[4/3] rounded-2xl bg-black/20 overflow-hidden relative group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD20if7sHzblwP3n5MMLdrojgbHgC4n1CfW4wMJsOwnLNBDxjKzCWWnn-svwz2L50uShxZkHCvNnJkDuw_Td5sh0IaqYl7UNV_zU8g4BQF-mIFVRnix7qXv8T8hFB1Jg_lhUhaT5pzB1CixbeFVnCa85_SPracbSl4TD-w16-2L_x76rNZMbjSQUaYRaETHu1e0OJecEp3fO2BOezRy9lvtlADJnZJPZz5yxy5N3diC1TntJ9U39BRq2bj_KhJ4vU8_g_fM7k5p5mah')"
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-lg font-bold text-white">Chat en Vivo</p>
                  <p className="text-sm text-connect-muted leading-relaxed">
                    Únete a salas públicas o inicia conversaciones privadas al instante con personas afines a ti.
                  </p>
                </div>
              </Card>
              </Link>

              <Link href="/connect/tutorial/foto-albumes">
              <Card className="w-full flex flex-col gap-4 rounded-3xl bg-connect-card p-4 shadow-xl border border-primary/20 transition-transform hover:-translate-y-1 ring-1 ring-primary/20 cursor-pointer hover:border-primary">
                <div className="w-full aspect-[4/3] rounded-2xl bg-black/20 overflow-hidden relative group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8PIehPrL8R6wYARqGWkNtrwMR9XTeHB1NKKLAE5LQ0u1Ki5cfQgcvuFTKwrQzzd_tU4k3a9IEGpvoB7tiBIB7MZzbv0X5yffLJj5kGPJOtRNxU9yuft3Qnd2CGSZ6OZH6LEB0p0flUcznvf9KEf20zhT25Ro1C_aZcgZHLoFCNq6IiANuPPN_Wo4eHdKRv-JvnY2K0Hg_6oxQEsLiFT_yrvotBVZggRMKJNycI2KWbMoXt0NnrU5dKMgDxEf5AXjxDM_WgFUX2U6x')"
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-primary text-connect-bg-dark rounded-full p-2 shadow-lg shadow-primary/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-lg font-bold text-white">Foto Álbumes</p>
                  <p className="text-sm text-connect-muted leading-relaxed">
                    Comparte tu vida con quien tú elijas. Control total sobre la privacidad de tus recuerdos.
                  </p>
                </div>
              </Card>
              </Link>

              <Link href="/connect/tutorial/busqueda">
              <Card className="w-full flex flex-col gap-4 rounded-3xl bg-connect-card p-4 shadow-xl border border-white/5 transition-transform hover:-translate-y-1 cursor-pointer hover:border-primary/50">
                <div className="w-full aspect-[4/3] rounded-2xl bg-black/20 overflow-hidden relative group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQA4eb49ktYzQqS1rfnKGox0sK-WUTs-rMP7-v-A8hmN9WHHshX5MXfWiMQLN9fq7u_QrCgiUEBm1QRqcoK0Xz7Jn_mjdJJgae0klQ9MhGbhH9QBn5s3qLxLbtjqT_LKZJJFaouPWd4sIBwE3kVCs2542LlAOAQtHw0uhZ6iAwdLuRMbK4gjxsYZKPAu75GNoG3tKo9agiMVPMDrbs5-hrw3F8Uf9NVnzRmRBS0VAv_7HXo2X6nhOmMXhXvtXNBOk6w3j57A5PYUiB')"
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2">
                  <p className="text-lg font-bold text-white">Búsqueda Avanzada</p>
                  <p className="text-sm text-connect-muted leading-relaxed">
                    Encuentra exactamente lo que buscas: amor, amistad o simplemente una buena charla.
                  </p>
                </div>
              </Card>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 cursor-pointer hover:bg-white/40 transition-colors"></div>
              <div className="w-8 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(43,238,121,0.4)] cursor-pointer"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 cursor-pointer hover:bg-white/40 transition-colors"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/20 cursor-pointer hover:bg-white/40 transition-colors"></div>
            </div>

            <div className="flex justify-center w-full px-4">
              <Link href="/mi-espacio">
                <Button className="relative flex w-full max-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-connect-bg-dark hover:brightness-110 hover:shadow-[0_0_20px_rgba(43,238,121,0.3)] active:scale-95 group font-bold text-base">
                  <span className="mr-2">Ir a Mi Espacio Personal</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/>
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
