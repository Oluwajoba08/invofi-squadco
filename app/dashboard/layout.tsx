"use client"; // Required for useAuthStore

import { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// Define the interface clearly for the Next.js compiler
interface DashboardLayoutProps {
  children: ReactNode;
  vendor: ReactNode;
  admin: ReactNode;
  institution: ReactNode;
  individual: ReactNode;
}

export default function Layout({
  children,
  vendor,
  admin,
  institution,
  individual,
}: DashboardLayoutProps) {
  const { userType } = useAuthStore();

  // Helper to determine which slot to show
  const renderSlot = () => {
    switch (userType) {
      case "individual": return individual;
      case "institution": return institution;
      case "vendor": return vendor;
      case "admin": return admin;
      default: return null;
    }
  };

  return (
    <>
      {renderSlot()}
      {children}
    </>
  );
}