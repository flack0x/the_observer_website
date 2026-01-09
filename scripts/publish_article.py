"""
Manual Article Publisher for The Observer
Publishes long-form articles directly to Supabase (bypassing Telegram).

Usage:
    python scripts/publish_article.py

This script inserts the Iran Protests analysis article in both EN and AR.
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Fix Windows console encoding for Arabic
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Article ID prefix for manual website articles
ARTICLE_PREFIX = 'website'

def generate_article_id(slug: str, channel: str) -> str:
    """Generate a unique article ID for manual articles."""
    return f"{ARTICLE_PREFIX}/{slug}-{channel}"


def publish_article(supabase: Client, article: dict) -> bool:
    """Publish a single article to Supabase."""
    try:
        result = supabase.table('articles').upsert(
            article,
            on_conflict='telegram_id'
        ).execute()
        print(f"  Published: {article['title'][:60]}...")
        return True
    except Exception as e:
        print(f"  Error publishing article: {e}")
        return False


def main():
    """Main function to publish the Iran protests articles."""
    print("=" * 60)
    print("The Observer - Manual Article Publisher")
    print("=" * 60)

    if not SUPABASE_KEY:
        print("\nError: Missing SUPABASE_SERVICE_KEY in environment.")
        print("Please set it in your .env file.")
        return

    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected!")

    # Current timestamp
    now = datetime.utcnow().isoformat()
    article_date = "2026-01-09T12:00:00"  # Article date
    slug = "2026-iran-protests-analysis"

    # Image URL (ISW map) - we'll upload this separately or use a placeholder
    # For now, using a direct reference - you can upload the image to Supabase Storage
    image_url = None  # Will be set after upload

    # ========================================
    # ENGLISH ARTICLE
    # ========================================
    english_content = """TITLE: Asymmetric Warfare and Internal Fissures: A Geopolitical Deconstruction of the 2026 Iran Protests

CATEGORY: Geopolitics

COUNTRIES: Iran, USA, Israel, Iraq

ORGS: IRGC, Mossad, Komala, Kurdistan Free Life Party (PJAK)

---

The demonstrations currently sweeping across Iran, which escalated following the December 28, 2025 budget defense by President Masoud Pezeshkian, cannot be analyzed as a vacuum-sealed domestic phenomenon. While triggered by immediate economic grievances—specifically a 75% currency depreciation and inflation exceeding 50%—these events are the product of a sophisticated intersection between structural domestic failures and a decades-long strategy of "maximum pressure" orchestrated by Washington and Tel Aviv.

## The Macro-Economic Siege

The current unrest is rooted in an economy systematically decapitated by international sanctions. Recent data indicates that Iran's middle class has shrunk by nearly 30 percentage points since 2012, with per capita income losses averaging $3,000 per citizen. This economic contraction is not merely a byproduct of policy; it is a deliberate geopolitical tool.

The collapse of the rial to approximately 1.4 million per USD in early 2026 has transformed "currency anxiety" into a survival crisis. When the United States and Israel engage in what is effectively economic warfare, they do not just target the state's ability to fund its regional "Axis of Resistance"; they hollow out the social contract between the Iranian state and its citizenry. By restricting oil revenues to just 16% of projected targets in 2025, external powers have ensured that any state budget—regardless of the administration's intent—is DOA (Dead on Arrival), thereby manufacturing the very conditions for social explosion.

## Military Threats and the "Siege Mentality"

A critical, yet often overlooked, factor is the impact of constant military signaling. The summer 2025 "12-Day War," involving Israeli strikes on Iranian infrastructure and U.S. strikes on nuclear facilities in Fordow and Natanz, has recalibrated Iran's internal security doctrine.

On January 6, 2026, Iran's newly formed Supreme National Defense Council warned it would treat "objective signs of threat" as a basis for preemptive action. This shift reflects a state that perceives domestic dissent not through a lens of civil reform, but through the lens of national survival. Persistent threats from the Trump administration—including public warnings of intervention—provide the Iranian security apparatus with a strategic rationale to treat protestors as "elements of unrest" linked to foreign hybrid warfare. This dynamic creates a closed loop: external pressure fuels economic misery; the misery fuels protests; the external military threat forces a securitized response, which in turn radicalizes the protests and legitimizes further external pressure.

## The Kurdish Question: Grievance vs. Instrumentalization

The Kurdish regions, particularly cities like Kermanshah, Sanandaj, and Mahabad, have emerged as central nodes of the 2026 uprising. The Kurdish issue in Iran is a dual-layered challenge:

**Legitimate Marginalization:**
Decades of economic underdevelopment in the western provinces and the suppression of Kurdish cultural identity provide a fertile ground for dissent.

**Foreign Instrumentalization:**
Groups such as Komala and the Kurdistan Free Life Party (PJAK), operating from the Kurdistan Region of Iraq (KRI), have historically been viewed by Tehran as conduits for Mossad and CIA operations.

In January 2026, the call for a general strike by Iraq-based Kurdish opposition parties was framed by Western media as a triumph of "ethnic solidarity." However, within the geopolitical context, this mobilization is also a pressure point. By selectively highlighting Kurdish activism, foreign actors can frame the protests as a separatist threat, thereby forcing the IRGC into a heavy-handed response that can then be used at the UN to justify further sanctions or "humanitarian" intervention. This instrumentalization often drowns out the legitimate social demands of Kurdish Iranians, subordinating their welfare to the broader objective of destabilizing the central government.

## Media Narratives and Selective Foregrounding

Western and Israeli media narratives frequently employ a strategy of selective foregrounding. They emphasize the "spontaneous struggle for freedom" while rendering invisible the cyber operations, assassinations, and "grey zone" tactics that have characterized the U.S.-Israeli approach to Iran over the last year.

By de-emphasizing the structural impact of the 2025 military strikes and the total blockade of the banking system, these narratives present the Iranian state as an irrational actor responding to peaceful dissent. This framing ignores the reality of asymmetric geopolitical warfare, where the "street" becomes a secondary battlefield. The objective is rarely the establishment of a liberal democracy, but rather the degradation of Iran's deterrence capacity and the severance of its regional ties to Lebanon, Syria, and Iraq.

## Conclusion: The Contested Political Space

The 2026 demonstrations are more than an "uprising against the regime." They represent a contested political space where the genuine suffering of the Iranian people is being leveraged in a high-stakes geopolitical gambit. As protests continue in Tehran's Grand Bazaar, Isfahan, and Shiraz, the intersection of domestic mismanagement and external aggression suggests that as long as the "siege" continues, the possibility for organic political reform remains suppressed under the weight of national security imperatives.

---

**References:**

- Al Jazeera. "Iran's New Year Demonstrations and the Question of Regime Survival." Al Jazeera, January 6, 2026.
- Britannica. "2026 Iranian Protests: Cause, Events, and International Reaction." Encyclopedia Britannica, January 2026.
- Critical Threats Project. "Iran Update, January 5, 2026." American Enterprise Institute/ISW, 2026.
- Economic Research Forum. "Sanctions and the Shrinking Size of Iran's Middle Class." ERF Policy Brief, September 30, 2025.
- Iran International. "Iran Warns it May Act Before an Attack if it Detects a Threat." Iran International, January 6, 2026.
- Middle East Council on Global Affairs. "Is Iran Changing Its Defense Doctrine?" MECGA Blog, January 8, 2026.
- VoxDev. "How Sanctions Eroded Iran's Middle Class." VoxDev, October 17, 2025.

*Image Credit: ISW - January 7, 2026*"""

    english_excerpt = "The demonstrations currently sweeping across Iran cannot be analyzed as a vacuum-sealed domestic phenomenon. While triggered by immediate economic grievances—specifically a 75% currency depreciation and inflation exceeding 50%—these events are the product of a sophisticated intersection between structural domestic failures and a decades-long strategy of 'maximum pressure' orchestrated by Washington and Tel Aviv."

    english_article = {
        'telegram_id': generate_article_id(slug, 'en'),
        'channel': 'en',
        'title': 'Asymmetric Warfare and Internal Fissures: A Geopolitical Deconstruction of the 2026 Iran Protests',
        'excerpt': english_excerpt,
        'content': english_content,
        'category': 'Geopolitics',
        'countries': ['Iran', 'USA', 'Israel', 'Iraq'],
        'organizations': ['IRGC', 'Mossad', 'Komala', 'PJAK'],
        'is_structured': True,
        'telegram_link': f"https://al-muraqeb.com/en/frontline/{slug}",
        'telegram_date': article_date,
        'image_url': image_url,
        'video_url': None,
    }

    # ========================================
    # ARABIC ARTICLE
    # ========================================
    arabic_content = """العنوان: الحرب غير المتكافئة والصدوع الداخلية: تفكيك جيوسياسي لاحتجاجات إيران 2026

المصنف: جيوسياسي

الدول: ايران، الولايات المتحدة، العراق، اسرائيل

المؤسسات: الحرس الثوري الإيراني، الموساد، كومله، حزب الحياة الحرة الكردستاني (بيجاك)

---

لا يمكن تحليل المظاهرات التي تجتاح إيران حالياً، والتي تصاعدت عقب دفاع الرئيس مسعود بزشكيان عن الميزانية في 28 ديسمبر 2025، كظاهرة محلية معزولة. فبينما اندلعت شرارتها بسبب مظالم اقتصادية مباشرة — وتحديداً انخفاض قيمة العملة بنسبة 75% وتضخم تجاوز 50% — إلا أن هذه الأحداث هي نتاج تقاطع معقد بين الفشل الهيكلي المحلي واستراتيجية "الضغوط القصوى" طويلة الأمد التي تديرها واشنطن وتل أبيب.

## الحصار الاقتصادي الكلي

تتجذر الاضطرابات الحالية في اقتصاد تعرض لعملية "قطع رأس" ممنهجة بسبب العقوبات الدولية. تشير البيانات الأخيرة إلى أن الطبقة الوسطى في إيران تقلصت بنحو 30 نقطة مئوية منذ عام 2012، مع بلوغ متوسط خسائر دخل الفرد 3000 دولار. هذا الانكماش الاقتصادي ليس مجرد نتاج عرضي للسياسات؛ بل هو أداة جيوسياسية متعمدة.

إن انهيار الريال ليصل إلى حوالي 140 ألف تومان مقابل الدولار الواحد في أوائل عام 2026 حول "قلق العملة" إلى أزمة بقاء. عندما تنخرط الولايات المتحدة وإسرائيل فيما هو فعلياً "حرب اقتصادية"، فإنهما لا يستهدفان فقط قدرة الدولة على تمويل "محور المقاومة" الإقليمي، بل يفرغان العقد الاجتماعي بين الدولة الإيرانية ومواطنيها. ومن خلال تقييد عائدات النفط لتصل إلى 16% فقط من الأهداف المقررة في عام 2025، ضمنت القوى الخارجية أن أي ميزانية للدولة — بغض النظر عن نوايا الإدارة — ستولد ميتة، مما يؤدي إلى تصنيع الظروف الملائمة للانفجار الاجتماعي.

## التهديدات العسكرية و"عقلية الحصار"

هناك عامل حاسم، وغالباً ما يتم تجاهله، وهو تأثير الرسائل العسكرية المستمرة. لقد أعادت "حرب الـ 12 يوماً" في صيف 2025، والتي شملت ضربات إسرائيلية على البنية التحتية الإيرانية وضربات أمريكية على المنشآت النووية في فوردو ونطنز، معايرة العقيدة الأمنية الداخلية لإيران.

في 6 يناير 2026، حذر المجلس الأعلى للدفاع الوطني المشكل حديثاً في إيران من أنه سيتعامل مع "المؤشرات الموضوعية للتهديد" كأساس لعمل استباقي. يعكس هذا التحول دولة ترى المعارضة الداخلية ليس من خلال عدسة الإصلاح المدني، بل من خلال عدسة البقاء القومي. إن التهديدات المستمرة من إدارة ترامب — بما في ذلك التحذيرات العلنية من التدخل — تمنح الأجهزة الأمنية الإيرانية مبرراً استراتيجياً للتعامل مع المتظاهرين كـ "عناصر شغب" مرتبطة بحرب هجينة أجنبية. تخلق هذه الديناميكية حلقة مغلقة: الضغط الخارجي يغذي البؤس الاقتصادي؛ البؤس يغذي الاحتجاجات؛ والتهديد العسكري الخارجي يفرض رداً أمنياً، والذي بدوره يؤدي إلى راديكالية الاحتجاجات ويشرعن المزيد من الضغوط الخارجية.

## المسألة الكردية: بين المظالم والتوظيف

تتخذ الاضطرابات الحالية في المناطق الحدودية الكردية طابعاً قومياً انفصالياً يتجاوز سياق الحراك المدني التقليدي، وسط تحضيرات تنظيمية أوسع نطاقاً مقارنة باحتجاجات 'مهسا أميني' السابقة. برزت المناطق الكردية، وخاصة مدن مثل كرمانشاه وسنندج ومهاباد، كمراكز أساسية لانتفاضة 2026.

تمثل المسألة الكردية في إيران تحدياً مزدوج الطبقات:

**التهميش المشروع:**
توفر عقود من التخلف الاقتصادي في المقاطعات الغربية وقمع الهوية الثقافية الكردية أرضية خصبة للمعارضة.

**التوظيف الأجنبي:**
تنظر طهران تاريخياً إلى جماعات مثل "كومله" و "حزب الحياة الحرة الكردستاني" (PJAK)، التي تعمل من إقليم كردستان العراق، كقنوات لعمليات الموساد ووكالة المخابرات المركزية.

في يناير 2026، تم تأطير دعوة الأحزاب الكردية المعارضة المتمركزة في العراق لإضراب عام من قبل وسائل الإعلام الغربية كـ "انتصار للتضامن العرقي". ومع ذلك، وضمن السياق الجيوسياسي، تعد هذه التعبئة أيضاً نقطة ضغط. فمن خلال تسليط الضوء بشكل انتقائي على النشاط الكردي، يمكن للجهات الخارجية تصوير الاحتجاجات كتهديد انفصالي، مما يجبر الحرس الثوري الإيراني على رد فعل عنيف يمكن استخدامه لاحقاً في الأمم المتحدة لتبرير المزيد من العقوبات أو التدخل "الإنساني". هذا التوظيف غالباً ما يطمس المطالب الاجتماعية المشروعة للإيرانيين الأكراد، ويجعل رفاهيتهم تابعة للهدف الأوسع المتمثل في زعزعة استقرار الحكومة المركزية.

## السرديات الإعلامية والتسليط الانتقائي

ويعتمد هذا التضليل الإعلامي على تضخيم أحداث محدودة، حيث يتم بث مقاطع لاجتماعات دامت دقائق معدودة في شوارع فرعية ببعض المحافظات وتكرار عرضها في الإعلام العالمي للإيحاء بوجود عصيان مدني شامل. تستخدم وسائل الإعلام الغربية والإسرائيلية في كثير من الأحيان استراتيجية "التسليط الانتقائي". فهي تركز على "النضال العفوي من أجل الحرية" بينما تخفي العمليات السيبرانية، والاغتيالات، وتكتيكات "المنطقة الرمادية" التي ميزت النهج الأمريكي الإسرائيلي تجاه إيران خلال العام الماضي. من خلال التقليل من شأن التأثير الهيكلي للضربات العسكرية لعام 2025 والحصار الشامل للنظام المصرفي، تقدم هذه السرديات الدولة الإيرانية كفاعل غير عقلاني يرد على معارضة سلمية. يتجاهل هذا التأطير واقع الحرب الجيوسياسية غير المتكافئة، حيث يصبح "الشارع" ساحة معركة ثانوية.

نادراً ما يكون الهدف هو إقامة ديمقراطية ليبرالية، بل بالأحرى إضعاف قدرة الردع الإيرانية وقطع صلاتها الإقليمية بلبنان وسوريا والعراق.

## الخلاصة: الفضاء السياسي المتنازع عليه

إن تظاهرات عام 2026 هي أكثر من مجرد "انتفاضة ضد النظام". إنها تمثل فضاءً سياسياً متنازعاً عليه حيث يتم استغلال المعاناة الحقيقية للشعب الإيراني في مقامرة جيوسياسية عالية المخاطر. ومع استمرار الاحتجاجات في بازار طهران الكبير، وأصفهان، وشيراز، يشير تقاطع سوء الإدارة المحلية والعدوان الخارجي إلى أنه طالما استمر "الحصار"، فإن إمكانية الإصلاح السياسي العضوي ستظل مكبوتة تحت وطأة ضرورات الأمن القومي.

---

**المراجع:**

- Al Jazeera. "Iran's New Year Demonstrations and the Question of Regime Survival." Al Jazeera, January 6, 2026.
- Britannica. "2026 Iranian Protests: Cause, Events, and International Reaction." Encyclopedia Britannica, January 2026.
- Critical Threats Project. "Iran Update, January 5, 2026." American Enterprise Institute/ISW, 2026.
- Economic Research Forum. "Sanctions and the Shrinking Size of Iran's Middle Class." ERF Policy Brief, September 30, 2025.
- Iran International. "Iran Warns it May Act Before an Attack if it Detects a Threat." Iran International, January 6, 2026.
- Middle East Council on Global Affairs. "Is Iran Changing Its Defense Doctrine?" MECGA Blog, January 8, 2026.
- VoxDev. "How Sanctions Eroded Iran's Middle Class." VoxDev, October 17, 2025.

*مصدر الصورة: ISW - 7 يناير 2026*"""

    arabic_excerpt = "لا يمكن تحليل المظاهرات التي تجتاح إيران حالياً كظاهرة محلية معزولة. فبينما اندلعت شرارتها بسبب مظالم اقتصادية مباشرة — وتحديداً انخفاض قيمة العملة بنسبة 75% وتضخم تجاوز 50% — إلا أن هذه الأحداث هي نتاج تقاطع معقد بين الفشل الهيكلي المحلي واستراتيجية 'الضغوط القصوى' طويلة الأمد التي تديرها واشنطن وتل أبيب."

    arabic_article = {
        'telegram_id': generate_article_id(slug, 'ar'),
        'channel': 'ar',
        'title': 'الحرب غير المتكافئة والصدوع الداخلية: تفكيك جيوسياسي لاحتجاجات إيران 2026',
        'excerpt': arabic_excerpt,
        'content': arabic_content,
        'category': 'Geopolitics',
        'countries': ['Iran', 'USA', 'Israel', 'Iraq'],
        'organizations': ['IRGC', 'Mossad', 'Komala', 'PJAK'],
        'is_structured': True,
        'telegram_link': f"https://al-muraqeb.com/ar/frontline/{slug}",
        'telegram_date': article_date,
        'image_url': image_url,
        'video_url': None,
    }

    # ========================================
    # PUBLISH ARTICLES
    # ========================================
    print("\nPublishing articles...")

    success_en = publish_article(supabase, english_article)
    success_ar = publish_article(supabase, arabic_article)

    print("\n" + "=" * 60)
    if success_en and success_ar:
        print("Both articles published successfully!")
        print(f"\nEnglish: https://al-muraqeb.com/en/frontline/{slug}")
        print(f"Arabic:  https://al-muraqeb.com/ar/frontline/{slug}")
    else:
        print("Some articles failed to publish. Check errors above.")
    print("=" * 60)


if __name__ == '__main__':
    main()
