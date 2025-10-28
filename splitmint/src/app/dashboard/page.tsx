"use client";

import Dashboard from "@/components/Dashboard";
import { Navbar1 } from "@/components/ui/navbar-1";
import { DevPanel } from "@/components/ui/DevPanel";

export default function DashboardPage() {
  return (
    <>
      <Navbar1 />
      <Dashboard />
      <DevPanel />
    </>
  );
}
