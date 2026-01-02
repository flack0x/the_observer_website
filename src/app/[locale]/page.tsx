import HeroSection from "@/components/sections/HeroSection";
import LiveFeed from "@/components/sections/LiveFeed";
import IntelDashboard from "@/components/sections/IntelDashboard";
import Community from "@/components/sections/Community";
import { getDictionary, type Locale } from "@/lib/i18n";

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
      <IntelDashboard locale={validLocale} dict={dict} />
      <Community locale={validLocale} dict={dict} />
    </main>
  );
}
