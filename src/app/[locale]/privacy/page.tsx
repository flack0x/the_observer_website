import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return {
    title: isArabic ? 'سياسة الخصوصية | المُراقِب' : 'Privacy Policy | The Observer',
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  const dict = getDictionary(validLocale);
  const isArabic = validLocale === 'ar';

  return (
    <div className="min-h-screen bg-midnight-900 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href={`/${validLocale}`}
            className="inline-flex items-center gap-2 text-slate-medium hover:text-tactical-red transition-colors mb-8"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span className="text-sm font-heading uppercase tracking-wider">
              {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
            </span>
          </Link>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wider text-slate-light mb-8">
            {dict.footer.privacy}
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-medium">
            {isArabic ? (
              <>
                <p className="text-lg leading-relaxed">
                  آخر تحديث: يناير 2026
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">المعلومات التي نجمعها</h2>
                <p>
                  نحن لا نجمع معلومات شخصية إلا إذا قمت بتقديمها طوعاً عبر نموذج الاشتراك في النشرة الإخبارية.
                  المعلومات الوحيدة التي نجمعها هي عنوان بريدك الإلكتروني إذا اخترت الاشتراك.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">كيف نستخدم معلوماتك</h2>
                <p>
                  نستخدم عنوان بريدك الإلكتروني فقط لإرسال تحديثات استخباراتية دورية.
                  لن نبيع أو نشارك بريدك الإلكتروني مع أطراف ثالثة.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">ملفات تعريف الارتباط</h2>
                <p>
                  قد نستخدم ملفات تعريف الارتباط الأساسية لتحسين تجربة التصفح.
                  لا نستخدم ملفات تعريف الارتباط للتتبع أو الإعلانات.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">اتصل بنا</h2>
                <p>
                  لأي استفسارات تتعلق بالخصوصية، يمكنك التواصل معنا عبر قنواتنا على تيليجرام.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  Last updated: January 2026
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Information We Collect</h2>
                <p>
                  We do not collect personal information unless you voluntarily provide it through our newsletter subscription form.
                  The only information we collect is your email address if you choose to subscribe.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">How We Use Your Information</h2>
                <p>
                  We use your email address solely to send periodic intelligence updates.
                  We will not sell or share your email with third parties.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Cookies</h2>
                <p>
                  We may use essential cookies to improve your browsing experience.
                  We do not use tracking or advertising cookies.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Contact Us</h2>
                <p>
                  For any privacy-related inquiries, you can reach us through our Telegram channels.
                </p>
              </>
            )}
          </div>
        </div>
    </div>
  );
}
