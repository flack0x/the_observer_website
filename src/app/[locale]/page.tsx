import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import LiveFeed from "@/components/sections/LiveFeed";
import SituationRoomPreview from "@/components/sections/SituationRoomPreview";
import FeaturedVoices from "@/components/sections/FeaturedVoices";
import { getDictionary, type Locale } from "@/lib/i18n";

const IntelDashboard = dynamic(() => import("@/components/sections/IntelDashboard"));
const Community = dynamic(() => import("@/components/sections/Community"));

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const validLocale = locale as Locale;
  const dict = getDictionary(validLocale);

  return (
    <main>
      <HeroSection locale={validLocale} dict={dict} />
      <LiveFeed locale={validLocale} dict={dict} />
      <SituationRoomPreview locale={validLocale} dict={dict} />
      <IntelDashboard locale={validLocale} dict={dict} />
      <FeaturedVoices locale={validLocale} dict={dict} />
      <Community locale={validLocale} dict={dict} />
    </main>
  );
}
