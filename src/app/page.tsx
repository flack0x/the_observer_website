"use client";

import HeroSection from "@/components/sections/HeroSection";
import LiveFeed from "@/components/sections/LiveFeed";
import IntelDashboard from "@/components/sections/IntelDashboard";
import Community from "@/components/sections/Community";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LiveFeed />
      <IntelDashboard />
      <Community />
    </main>
  );
}
