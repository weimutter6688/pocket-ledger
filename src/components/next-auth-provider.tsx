"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

interface NextAuthProviderProps {
  children: ReactNode;
  session: Session | null;
}

export default function NextAuthProvider({ 
  children,
  session
}: NextAuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}