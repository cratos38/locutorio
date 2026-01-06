"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  
  // Redirigir automáticamente a /create-profile
  useEffect(() => {
    router.replace("/create-profile");
  }, [router]);

  return (
    <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
