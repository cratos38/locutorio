"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MiEspacioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inicio");
  }, [router]);

  return (
    <div className="min-h-screen bg-forest-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
    </div>
  );
}
