"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";

type CoffeeUser = {
  id: number;
  username: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
};

export default function InicioPage() {
  const [statusText, setStatusText] = useState("");

  // Mensajes privados
  const privateMessages = [
    { id: 1, userId: 1, name: "María", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB", message: "Hola! ¿Cómo estás?", unread: 2 },
    { id: 2, userId: 2, name: "Laura", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", message: "Gracias por aceptar", unread: 1 },
    { id: 3, userId: 3, name: "Sofia", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop", message: "Nos vemos pronto", unread: 0 }
  ];

  const openMessages = (userId?: number) => {
    console.log('Opening messages for user:', userId);
  };

  // Estado para el widget de Tomar Café
  const [coffeeUsers] = useState<CoffeeUser[]>([
    { id: 1, username: "maria8163", name: "María", age: 24, city: "Maracaibo", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 2, username: "laura_g", name: "Laura", age: 25, city: "Caracas", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { id: 3, username: "sofia_m", name: "Sofia", age: 26, city: "Valencia", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
  ]);
  const [currentCoffeeIndex, setCurrentCoffeeIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const currentCoffeeUser = coffeeUsers[currentCoffeeIndex];

  // Sonidos
  const playAcceptSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0vLTgjMGHm7A7+OZSA0PVanm8LJjHwU7k9r0z38uBihyyO3cnEQIEFyt5O+pWBYLTKXh9MBlKAYthMrz16g9CRdxwu7hnUsOElmr5fCyYx8FO5Pa9M5+LgYnccnt3JxECA9dru3+UlP=');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const playRejectSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhYAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YfL9//8A');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // Animación de confetti
  const triggerConfetti = async () => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2bee79', '#4ade80', '#22c55e', '#86efac']
      });
    } catch (error) {
      // Confetti no disponible, continuar sin animación
      console.log('Confetti not available');
    }
  };

  // Manejar aceptar invitación
  const handleAcceptCoffee = () => {
    if (!currentCoffeeUser) return;

    // Reproducir sonido y confetti
    playAcceptSound();
    triggerConfetti();

    // Guardar en localStorage con timestamp
    const accepted = JSON.parse(localStorage.getItem('coffeeAccepted') || '[]');
    const newAccepted = {
      ...currentCoffeeUser,
      acceptedAt: new Date().toISOString(),
      status: 'accepted'
    };
    localStorage.setItem('coffeeAccepted', JSON.stringify([...accepted, newAccepted]));

    // Siguiente usuario
    setTimeout(() => {
      if (currentCoffeeIndex < coffeeUsers.length - 1) {
        setCurrentCoffeeIndex(currentCoffeeIndex + 1);
      } else {
        setCurrentCoffeeIndex(0);
      }
    }, 500);
  };

  // Manejar rechazar invitación
  const handleRejectCoffee = () => {
    if (!currentCoffeeUser) return;

    // Reproducir sonido
    playRejectSound();

    // Guardar en localStorage con timestamp
    const rejected = JSON.parse(localStorage.getItem('coffeeRejected') || '[]');
    const newRejected = {
      ...currentCoffeeUser,
      rejectedAt: new Date().toISOString(),
      status: 'rejected'
    };
    localStorage.setItem('coffeeRejected', JSON.stringify([...rejected, newRejected]));

    // Cerrar modal y siguiente usuario
    setShowRejectModal(false);
    setTimeout(() => {
      if (currentCoffeeIndex < coffeeUsers.length - 1) {
        setCurrentCoffeeIndex(currentCoffeeIndex + 1);
      } else {
        setCurrentCoffeeIndex(0);
      }
    }, 300);
  };

  // Simulamos un pool de usuarios según filtro de búsqueda
  const allUsers = useMemo(() => [
    { id: 1, username: "javier-s", name: "Javier S.", age: 28, city: "Madrid", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 2, username: "laura-g", name: "Laura G.", age: 25, city: "Barcelona", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic" },
    { id: 3, username: "carlos-r", name: "Carlos R.", age: 30, city: "Valencia", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 4, username: "maria-p", name: "Maria P.", age: 27, city: "Sevilla", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 5, username: "sofia-m", name: "Sofía M.", age: 24, city: "Bilbao", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw" },
    { id: 6, username: "pablo-r", name: "Pablo R.", age: 29, city: "Málaga", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 7, username: "elena-g", name: "Elena G.", age: 26, city: "Zaragoza", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic" },
    { id: 8, username: "diego-s", name: "Diego S.", age: 31, city: "Alicante", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 9, username: "carmen-v", name: "Carmen V.", age: 23, city: "Murcia", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 10, username: "antonio-l", name: "Antonio L.", age: 33, city: "Granada", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
  ], []);

  const [displayedUsers, setDisplayedUsers] = useState(allUsers.slice(0, 6));

  // Rotar usuarios cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Obtener 6 usuarios aleatorios del pool
      const shuffled = [...allUsers].sort(() => 0.5 - Math.random());
      setDisplayedUsers(shuffled.slice(0, 6));
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [allUsers]);

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display flex flex-col">
      <InternalHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-connect-bg-dark">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#1A2226] border border-white/5 shadow-lg rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                    alt="Ana M."
                    className="w-24 h-24 rounded-full border-4 border-[#1A2226] shadow-lg object-cover"
                  />
                  <button className="absolute bottom-0 right-0 p-1.5 bg-[#1A2226] border border-white/10 rounded-full text-primary hover:bg-primary hover:text-[#0F1416] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <h2 className="text-xl font-bold font-heading text-white">Ana M.</h2>
                <p className="text-sm text-gray-400 mb-4">26 años • Madrid</p>

                <div className="w-full h-px bg-white/5 mb-4"></div>

                <div className="w-full flex justify-between text-sm mb-4">
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">128</span>
                    <span className="text-xs text-gray-400">Amigos</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">45</span>
                    <span className="text-xs text-gray-400">Fotos</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">89%</span>
                    <span className="text-xs text-gray-400">Completo</span>
                  </div>
                </div>

                <Link href="/profile" className="block w-full">
                  <Button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main Menu */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/2">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Menú Principal
                </h3>
              </div>

              <div className="p-2 space-y-1">
                <button onClick={() => openMessages()} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Mensajes</span>
                  </div>
                  <span className="bg-primary text-[#0F1416] text-xs font-bold px-1.5 py-0.5 rounded">3</span>
                </button>

                <Link href="/chat" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span>Salas de Chat</span>
                  </div>
                </Link>

                <Link href="/amigos" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Amigos</span>
                  </div>
                </Link>

                <Link href="/meetings" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2zm10 4h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M4 18h16" />
                    </svg>
                    <span>Invitaciones</span>
                  </div>
                  <span className="bg-primary text-[#0F1416] text-xs font-bold px-1.5 py-0.5 rounded">5</span>
                </Link>

                <Link href="/albums" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Álbumes</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Security */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl p-5">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Seguridad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estado de cuenta</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    Protegida
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.1)]" style={{ width: '100%' }}></div>
                </div>
                <Button variant="outline" className="w-full py-1.5 mt-2 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs transition-colors">
                  Revisar actividad reciente
                </Button>
              </div>
            </div>
          </div>

          {/* Center Column - Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Status Update */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-4">
              <div className="flex gap-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                  alt="Me"
                  className="w-10 h-10 rounded-full object-cover border border-connect-border"
                />
                <div className="flex-1">
                  <Input
                    placeholder="¿Qué estás pensando, Ana?"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full bg-connect-bg-dark border-connect-border rounded-full px-4 py-2.5 text-sm text-white placeholder-connect-muted"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pl-14">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-xs text-connect-muted hover:text-white transition-colors">
                    <svg className="w-[18px] h-[18px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Foto
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-xs text-connect-muted hover:text-white transition-colors">
                    <svg className="w-[18px] h-[18px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estado
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Visits Widget - UNIFIED with 2 sides */}
            <div className="bg-gradient-to-r from-deep-green/40 to-connect-card border border-primary/20 rounded-xl p-5 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Left Side: Who visited me */}
                <div>
                  <h3 className="font-bold text-white text-base mb-2">Me Visitaron</h3>
                  <Link
                    href="/visitas/me-vieron"
                    target="_blank"
                    className="text-sm text-primary font-medium mb-3 hover:underline cursor-pointer inline-block"
                  >
                    28 hoy
                  </Link>

                  <div className="flex -space-x-2 mt-3">
                    <Link href="/perfil/javier-s" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Javier S."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/perfil/laura-g" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic"
                        alt="Laura G."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/perfil/maria-p" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB"
                        alt="Maria P."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/visitas/me-vieron" target="_blank">
                      <div className="w-9 h-9 rounded-full border-2 border-connect-bg-dark bg-connect-card flex items-center justify-center text-xs text-white font-bold hover:bg-white/10 cursor-pointer hover:scale-110 transition-transform">
                        +25
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Right Side: Who I visited */}
                <div className="text-right">
                  <h3 className="font-bold text-white text-base mb-2">He Visitado</h3>
                  <Link
                    href="/visitas/he-visitado"
                    target="_blank"
                    className="text-sm text-primary font-medium mb-3 hover:underline cursor-pointer inline-block"
                  >
                    12 hoy
                  </Link>

                  <div className="flex -space-x-2 justify-end mt-3">
                    <Link href="/perfil/carlos-r" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                        alt="Carlos R."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/perfil/sofia-m" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                        alt="Sofía M."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/perfil/pablo-r" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Pablo R."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/visitas/he-visitado" target="_blank">
                      <div className="w-9 h-9 rounded-full border-2 border-connect-bg-dark bg-connect-card flex items-center justify-center text-xs text-white font-bold hover:bg-white/10 cursor-pointer hover:scale-110 transition-transform">
                        +9
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Personas - Full Width Horizontal */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Personas
                </h3>
                <Link href="/people" className="text-xs text-primary hover:underline">
                  Ver más
                </Link>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {displayedUsers.map((user) => (
                  <Link key={user.id} href={`/perfil/${user.username}`} target="_blank" className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 cursor-pointer">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                      {user.id % 2 === 1 && (
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-primary border border-connect-card rounded-full"></span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-medium text-white group-hover:text-primary transition-colors truncate">{user.name}</p>
                      <p className="text-[9px] text-connect-muted">{user.gender} • {user.age}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Two Column Cards: Tomar Café + Mensajes Privados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tomar Café */}
              <div className="bg-connect-card border border-connect-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2zm10 4h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M4 18h16" />
                    </svg>
                    Invitaciones para Café
                  </h3>
                  <Link href="/meetings" className="text-xs text-primary hover:underline">
                    Ver más
                  </Link>
                </div>

                {currentCoffeeUser ? (
                  <div className="relative rounded-xl overflow-hidden group">
                    <img
                      src={currentCoffeeUser.avatar}
                      alt={currentCoffeeUser.name}
                      className="w-full h-64 object-cover"
                    />

                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    {/* Badge de invitación */}
                    <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-connect-bg-dark">Nueva Invitación</span>
                    </div>

                    {/* Botones de aceptar/rechazar */}
                    <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 px-4">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="w-16 h-16 bg-white/90 hover:bg-white rounded-full font-bold shadow-lg hover:scale-110 transition-all flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleAcceptCoffee}
                        className="w-16 h-16 bg-primary hover:brightness-110 rounded-full font-bold shadow-[0_0_25px_rgba(43,238,121,0.4)] hover:shadow-[0_0_35px_rgba(43,238,121,0.6)] hover:scale-110 transition-all flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-connect-bg-dark" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                      </button>
                    </div>

                    {/* Info del usuario */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white">
                      <h4 className="text-lg font-bold">{currentCoffeeUser.name}, {currentCoffeeUser.age}</h4>
                      <p className="text-sm opacity-90 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {currentCoffeeUser.city}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white/5 border border-dashed border-white/10 h-64 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="text-4xl mb-3">☕</div>
                      <p className="text-white font-bold mb-1">No hay invitaciones</p>
                      <p className="text-xs text-connect-muted">Visita "Personas" para enviar invitaciones</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensajes Privados */}
              <div className="bg-connect-card border border-connect-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Mensajes Privados
                  </h3>
                  <button onClick={() => openMessages()} className="text-xs text-primary hover:underline">
                    Ver todos
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Mensaje 1 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Javier"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-connect-card rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">Javier Solis</h4>
                        <span className="text-[10px] text-gray-400">12:30</span>
                      </div>
                      <p className="text-xs text-white font-medium truncate">
                        Hola, ¿viste las fotos que...
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>

                  {/* Mensaje 2 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic"
                        alt="Laura"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-gray-400 truncate">Laura G.</h4>
                        <span className="text-[10px] text-gray-400">Ayer</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">¡Te envió una invitación!</p>
                    </div>
                  </div>

                  {/* Mensaje 3 */}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                        alt="Carlos"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-connect-card rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-gray-400 truncate">Carlos R.</h4>
                        <span className="text-[10px] text-gray-400">14 Dic</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">¿Nos vemos este fin de...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* My Interests */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl p-5">
              <h3 className="font-heading font-bold text-sm text-white mb-4">Mis Intereses</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white rounded-md cursor-pointer transition-colors border border-white/5">
                  Música
                </span>
                <span className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white rounded-md cursor-pointer transition-colors border border-white/5">
                  Viajes
                </span>
                <span className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white rounded-md cursor-pointer transition-colors border border-white/5">
                  Fotografía
                </span>
                <span className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white rounded-md cursor-pointer transition-colors border border-white/5">
                  Cine
                </span>
                <button className="px-2.5 py-1 text-xs text-primary hover:underline flex items-center gap-1">
                  <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir
                </button>
              </div>
            </div>

            {/* Salas Favoritas */}
            <div className="bg-connect-card border border-connect-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-connect-border bg-white/2 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-bold text-sm text-white">Salas Favoritas</h3>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-primary">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <Link href="/chat" className="text-xs text-primary hover:underline">
                  Ver todas
                </Link>
              </div>

              <div className="p-3 space-y-2">
                {/* Room 1 */}
                <Link href="/chat/general" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">General</h4>
                    <p className="text-xs text-connect-muted">245 conectados</p>
                  </div>
                </Link>

                {/* Room 2 */}
                <Link href="/chat/musica" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">Música</h4>
                    <p className="text-xs text-connect-muted">128 conectados</p>
                  </div>
                </Link>

                {/* Room 3 */}
                <Link href="/chat/citas" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 group-hover:bg-pink-500/30">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">Citas</h4>
                    <p className="text-xs text-connect-muted">89 conectados</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Friends Online */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl p-0">
              <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="font-heading font-bold text-sm text-white">Amigos en línea (4)</h3>
              </div>

              <div className="p-2 grid grid-cols-4 gap-2">
                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                      alt="Pedro"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Pedro
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                      alt="Juan"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Juan
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB"
                      alt="Maria"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Maria
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                      alt="Carlos"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Carlos
                  </span>
                </Link>
              </div>

              <div className="p-2 pt-0">
                <Link href="/amigos" className="w-full block text-center py-2 text-xs text-primary hover:text-primary/80 hover:underline transition-colors">
                  Ver todos mis amigos →
                </Link>
              </div>
            </div>

            {/* Premium Promo */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-4 text-center">
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <h3 className="font-bold text-white text-sm">Modo Invisible</h3>
              <p className="text-xs text-connect-muted mb-3">
                Navega sin dejar rastro en "Perfiles Visitados".
              </p>
              <Button className="w-full bg-primary hover:brightness-110 text-connect-bg-dark text-xs font-bold">
                Activar Premium
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center text-xs text-connect-muted border-t border-connect-border pt-4 max-w-[1600px] mx-auto">
          <p>
            © 2023 LoCuToRiO Inc. •{" "}
            <Link href="/about/proteccion-datos" className="hover:text-primary">
              Privacidad
            </Link>{" "}
            •{" "}
            <Link href="/about/terminos" className="hover:text-primary">
              Términos
            </Link>
          </p>
        </footer>
      </main>

      {/* Modal de Confirmación para Rechazar */}
      {showRejectModal && currentCoffeeUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¿Rechazar invitación?</h2>
              <p className="text-connect-muted">
                ¿Estás seguro que quieres rechazar la invitación a café de{" "}
                <span className="text-white font-bold">{currentCoffeeUser.name}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1 bg-transparent border-connect-border text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejectCoffee}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Sí, rechazar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
