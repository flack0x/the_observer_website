"use client";

import HeroSection from "@/components/sections/HeroSection";
import FeaturedAnalysis from "@/components/sections/FeaturedAnalysis";
import SituationRoomPreview from "@/components/sections/SituationRoomPreview";
import LatestIntel from "@/components/sections/LatestIntel";
import DossierPreview from "@/components/sections/DossierPreview";
import ArsenalPreview from "@/components/sections/ArsenalPreview";
import CounterNarrativePreview from "@/components/sections/CounterNarrativePreview";
import ChroniclesPreview from "@/components/sections/ChroniclesPreview";
import PollsSection from "@/components/sections/PollsSection";

export default function Home() {
  return (
    <div className="bg-grid-pattern">
      <HeroSection />
      <LatestIntel />
      <FeaturedAnalysis />
      <SituationRoomPreview />
      <DossierPreview />
      <ArsenalPreview />
      <CounterNarrativePreview />
      <ChroniclesPreview />
      <PollsSection />
    </div>
  );
}
