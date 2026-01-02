"use client";

import HeroSection from "@/components/sections/HeroSection";
import LiveFeed from "@/components/sections/LiveFeed";
import IntelDashboard from "@/components/sections/IntelDashboard";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LiveFeed />
      <IntelDashboard />
    </main>
  );
}
