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
    title: isArabic ? 'شروط الاستخدام | المُراقِب' : 'Terms of Service | The Observer',
  };
}

export default async function TermsPage({ params }: Props) {
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
            {dict.footer.terms}
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-medium">
            {isArabic ? (
              <>
                <p className="text-lg leading-relaxed">
                  آخر تحديث: يناير 2026
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">قبول الشروط</h2>
                <p>
                  باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                  إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">المحتوى</h2>
                <p>
                  جميع المحتويات المقدمة على هذا الموقع هي لأغراض إعلامية فقط.
                  نسعى جاهدين لتقديم معلومات دقيقة وموثوقة، لكننا لا نضمن دقة أو اكتمال أي معلومات.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">الملكية الفكرية</h2>
                <p>
                  جميع المحتويات والتصاميم والشعارات هي ملكية فكرية للمُراقِب.
                  يُحظر إعادة الإنتاج أو التوزيع غير المصرح به.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">إخلاء المسؤولية</h2>
                <p>
                  المعلومات المقدمة هي للتحليل والتعليم فقط ولا تشكل نصيحة مهنية.
                  نحن غير مسؤولين عن أي قرارات تُتخذ بناءً على محتوانا.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">التعديلات</h2>
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت.
                  ستكون التغييرات سارية فور نشرها على هذه الصفحة.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  Last updated: January 2026
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Acceptance of Terms</h2>
                <p>
                  By using this website, you agree to be bound by these terms and conditions.
                  If you do not agree to any part of these terms, please do not use the site.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Content</h2>
                <p>
                  All content provided on this website is for informational purposes only.
                  We strive to provide accurate and reliable information, but we do not guarantee the accuracy or completeness of any information.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Intellectual Property</h2>
                <p>
                  All content, designs, and logos are the intellectual property of The Observer.
                  Unauthorized reproduction or distribution is prohibited.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Disclaimer</h2>
                <p>
                  The information provided is for analysis and education only and does not constitute professional advice.
                  We are not responsible for any decisions made based on our content.
                </p>

                <h2 className="font-heading text-xl font-bold text-slate-light mt-8">Modifications</h2>
                <p>
                  We reserve the right to modify these terms at any time.
                  Changes will be effective immediately upon posting to this page.
                </p>
              </>
            )}
          </div>
        </div>
    </div>
  );
}
