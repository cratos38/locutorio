"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import FloatingMessagesWindow from "@/components/FloatingMessagesWindow";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <AuthProvider>
      <MessagesProvider>
        <div className="antialiased">
          {children}
          <FloatingMessagesWindow />
        </div>
      </MessagesProvider>
    </AuthProvider>
  );
}
