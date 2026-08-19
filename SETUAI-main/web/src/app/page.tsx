import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  HandHeart,
  Lightbulb,
  School,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AiLearningLattice } from "@/components/ai-learning-lattice";
import { AnimatedStatValue } from "@/components/animated-stat-value";
import { ButtonLink } from "@/components/button-link";
import { InteractiveMap } from "@/components/interactive-map";
import { JsonLd } from "@/components/json-ld";
import { LocalizedText } from "@/components/localized-text";
import { MissionHeartbeat } from "@/components/mission-heartbeat";
import { SetuAiMark } from "@/components/setuai-mark";
import type { EditableCard } from "@/content/editable-site";
import { siteConfig } from "@/content/site";
import { getSiteContent } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  book: BookOpen,
  building: Building2,
  heart: HandHeart,
  lightbulb: Lightbulb,
  school: School,
  sparkles: Sparkles,
  users: Users,
};

const hiHome = {
  hero: {
    kicker: "निर्माणाधीन पहल",
    title: "SetuAI",
    body: "SetuAI एक पंजीकरण-पूर्व AI साक्षरता पहल है, जिसे Summit Intelligent Systems, Shikivaa Foundation और SKYPA Foundation मिलकर आकार दे रहे हैं। हम स्कूलों और समुदायों के साथ व्यावहारिक, जिम्मेदार AI सीखने की बुनियाद तैयार कर रहे हैं।",
  },
  intro: {
    kicker: "यह काम क्यों जरूरी है",
    title: "AI बचपन का हिस्सा बन रहा है। युवाओं को इसे समझने का भरोसेमंद रास्ता मिलना चाहिए।",
    featuredStatement:
      "SetuAI का उद्देश्य AI को एक उलझे हुए buzzword से ऐसी चीज में बदलना है जिसे छात्र समझ सकें, उस पर सवाल कर सकें और समझदारी से इस्तेमाल कर सकें।",
    body: [
      "SetuAI अपनी पहचान निर्माणाधीन एक सहयोगी पहल है। Summit Intelligent Systems तकनीक और कार्यान्वयन का अनुभव लाता है, Shikivaa Foundation शिक्षा और सामुदायिक पहुंच का दृष्टिकोण लाता है, और SKYPA Foundation मूल AI साक्षरता और पाठ्यपुस्तक की सोच लेकर आता है।",
      "अगला काम सोच-समझकर होगा: स्कूलों और शिक्षा गैर-लाभकारी संस्थाओं की बात सुनना, समीक्षा योग्य सामग्री बनाना, सुरक्षा उपाय तय करना और तभी किसी डिलीवरी योजना या परिणाम को सार्वजनिक रूप से बताना।",
    ],
  },
  stats: [
    {
      label: "संगठन की स्थिति",
      detail: "SetuAI को एक स्वतंत्र संगठन के रूप में तैयार किया जा रहा है; पंजीकरण, शासन और संचालन की जानकारी अभी तय की जा रही है।",
    },
    {
      label: "पाठ्यपुस्तक और सीखने की सामग्री",
      detail: "छात्र-केंद्रित AI पाठ्यपुस्तक और सहायक सामग्री किसी भी सार्वजनिक वितरण वचन से पहले विकसित की जा रही हैं।",
    },
    {
      label: "शुरुआती बातचीत",
      detail: "अगला कदम स्कूलों, शिक्षा गैर-लाभकारी संस्थाओं और संभावित सहयोगियों को सुनना है, फिर ही तारीखों या परिणामों की घोषणा होगी।",
    },
    {
      label: "डिजाइन सिद्धांत",
      detail: "साफ भाषा, जिम्मेदार उपयोग, वयस्क सहयोग और व्यावहारिक सीखना SetuAI के हर काम की कसौटी हैं।",
    },
  ],
  founding: {
    kicker: "संस्थापक सहयोग",
    title: "तीन संस्थापक साझेदार, एक सोच-समझकर किया गया आरंभ।",
    body: "SetuAI को एक स्वतंत्र पहल के रूप में संगठित किया जा रहा है। इसके संस्थापक साझेदार शिक्षा, तकनीक और समुदाय तक पहुंच के दृष्टिकोण को शुरुआती काम में साथ लाते हैं।",
    partners: [
      {
        role: "तकनीक और कार्यान्वयन पार्टनर",
        body: "Summit संस्थापक सहयोग में उत्पाद, प्रणालियों और कार्यान्वयन का अनुभव देता है।",
      },
      {
        role: "शिक्षा और सामुदायिक पहुंच पार्टनर",
        body: "Shikivaa शिक्षा-केंद्रित दृष्टिकोण और सामुदायिक पहुंच का अनुभव देता है।",
      },
      {
        role: "AI literacy initiative partner",
        body: "SKYPA मूल AI साक्षरता, पाठ्यपुस्तक, स्कूल पहुंच और स्वयंसेवी सोच लेकर आता है जिससे SetuAI की शुरुआत हुई।",
      },
    ],
  },
  learning: {
    title: "सीखने का ऐसा तरीका जो कक्षाओं के लिए हो, प्रचार के लिए नहीं।",
    body: "विकासाधीन तरीका साफ भाषा, वयस्कों के सहयोग से अभ्यास और ऐसी सामग्री पर आधारित है जिसे शिक्षक समीक्षा कर सकें, इससे पहले कि उसे स्कूल के लिए तैयार कहा जाए।",
    cards: [
      {
        title: "अपने आसपास की प्रणालियों को समझना",
        body: "भविष्य की सामग्री prompts, training data, outputs, bias, privacy और मानवीय निर्णय के सरल मॉडल बताएगी।",
      },
      {
        title: "जिम्मेदार टूल्स के साथ अभ्यास",
        body: "किसी भी भविष्य की गतिविधि में जाँच, स्रोत का उल्लेख, सोच-विचार और वयस्कों के सहयोग से अभ्यास को स्पष्ट रखना होगा।",
      },
      {
        title: "सीख को आगे ले जाना",
        body: "पाठ्यपुस्तक पहल को ऐसे टिकाऊ संसाधन के रूप में विकसित किया जा रहा है जिसे छात्र और शिक्षक समय के साथ दोबारा देख और बेहतर बना सकें।",
      },
    ],
  },
  heartbeat: {
    kicker: "काम के पीछे का सिद्धांत",
    title: "मकसद ज्यादा AI नहीं है। मकसद बेहतर निर्णय, साझा पहुंच और साफ विकल्प हैं।",
    body: "SetuAI एक सरल विश्वास के साथ बनाया जा रहा है: AI साक्षरता छात्रों को बेहतर सवाल पूछने में, वयस्कों को जिम्मेदार मार्गदर्शन देने में और समुदायों को भरोसे के योग्य चीज पहचानने में मदद करे।",
    pulses: [
      "ऑटोमेशन से पहले मानवीय निर्णय",
      "तकनीकी भाषा से पहले साफ भाषा",
      "निजी लाभ से पहले सामुदायिक पहुंच",
    ],
  },
  textbook: {
    kicker: "विकासाधीन पाठ्यपुस्तक पहल",
    title: "एक ऐसी पाठ्यपुस्तक जिसे छात्र पकड़ सकें, दोबारा देख सकें और उस पर सवाल कर सकें।",
    body: "SetuAI छात्र-केंद्रित AI साक्षरता पाठ्यपुस्तक विकसित कर रहा है। यह अभी प्रकाशित, पायलट या वितरण के लिए तय नहीं है। प्राथमिकता इसे पहले सटीक, आयु-उपयुक्त, सुलभ और समीक्षा योग्य बनाना है।",
    calloutLabel: "विकास की स्थिति",
    calloutTitle: "समीक्षा और पायलट योजना से पहले वितरण का कोई दावा नहीं।",
    bullets: [
      "सादी भाषा में AI की मूल बातें",
      "सोच-समझकर prompts और सत्यापन",
      "सुरक्षा, bias, privacy और मानवीय निर्णय",
    ],
  },
  audience: {
    title: "हर प्रकार के साझेदार के लिए अगला सरल, कम दबाव वाला कदम।",
    body: "SetuAI अभी खोज और बातचीत के चरण में है। स्कूल, शिक्षा गैर-लाभकारी संस्थाएं, संभावित सहयोगी, स्वयंसेवक और परिवार अपनी बात साझा कर सकते हैं, बिना किसी अपुष्ट कार्यक्रम का वादा पाए।",
    cards: [
      {
        title: "स्कूल",
        body: "भविष्य की AI साक्षरता बातचीत के लिए अपना शैक्षिक संदर्भ, प्रश्न और सीमाएं साझा करें।",
      },
      {
        title: "शिक्षा गैर-लाभकारी संस्थाएं",
        body: "जानें कि स्थानीय ज्ञान और सामुदायिक पहुंच एक जिम्मेदार भविष्य के सहयोग को कैसे आकार दे सकती है।",
      },
      {
        title: "कंपनियां",
        body: "इस साइट पर दान, कर-रसीद या कार्यक्रम-डिलीवरी का वादा किए बिना संभावित समर्थन पर बात करें।",
      },
      {
        title: "स्वयंसेवक",
        body: "समीक्षा, पहुंच, संचालन या स्वीकृत सहयोग जैसे भविष्य के उचित रूप से जांचे गए कार्यों में रुचि दर्ज करें।",
      },
      {
        title: "परिवार",
        body: "वे प्रश्न साझा करें जिनका उत्तर SetuAI को सुलभ सीखने की सामग्री विकसित करते समय देना चाहिए।",
      },
    ],
  },
  process: {
    kicker: "जिम्मेदार साझेदारी का रास्ता",
    title: "पहली बातचीत से एक संभावित, सुरक्षित पायलट तक।",
    body: "प्रक्रिया जानबूझकर सावधान है। किसी जानकारी को भेजना बातचीत खोलता है; यह कार्यशाला, साझेदारी या छात्र-केंद्रित गतिविधि की पुष्टि नहीं है।",
    steps: [
      "परिस्थिति और इच्छित दर्शकों को समझना",
      "सुरक्षा उपायों, क्षमता और सामग्री की तैयारी की समीक्षा करना",
      "यदि उचित हो तो एक छोटा, दर्ज किया गया अगला कदम तय करना",
      "सीखना, समीक्षा करना और नतीजे को ईमानदारी से बताना",
    ],
  },
  closingCta: {
    title: "एक भरोसेमंद AI साक्षरता पहल बनाने में मदद करें।",
    body: "स्कूल या समुदाय का दृष्टिकोण, भावी सहयोग या समीक्षा का अनुभव साझा करें। SetuAI सुनना चाहता है, फिर ऐसा काम डिजाइन करना चाहता है जो दावों से पहले भरोसा कमाए।",
  },
};

function iconFor(card: EditableCard) {
  return iconMap[card.icon || ""] || Sparkles;
}

export async function generateMetadata() {
  const content = await getSiteContent();

  return createMetadata({
    title: content.seo.homeTitle,
    description: content.seo.homeDescription,
    path: "/",
    image: content.seo.homeImage,
  });
}

export default async function Home() {
  const content = await getSiteContent();
  const { global, home, visuals } = content;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: global.siteName || siteConfig.name,
          url: absoluteUrl("/"),
          description: global.description,
        }}
      />

      <section className="relative min-h-[min(820px,calc(88dvh-76px))] overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-deep)] text-stone-50">
        <Image
          src={home.hero.image.src}
          alt={home.hero.image.alt}
          fill
          priority
          sizes="100vw"
          className="kinetic-image object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-[#142d33]/76" />
        {visuals.hero3dEnabled ? (
          <div className="absolute inset-y-8 right-0 hidden w-[48vw] lg:block">
            <AiLearningLattice label={visuals.hero3dLabel} density={visuals.visualDensity} />
          </div>
        ) : null}
        <div className="relative mx-auto grid min-h-[min(820px,calc(88dvh-76px))] w-full max-w-6xl grid-cols-12 items-center px-4 py-16 md:px-8">
          <div className={["col-span-12 max-w-[60ch] motion-reveal lg:col-span-7", visuals.motionEnabled ? "motion-rise" : ""].join(" ")} data-animate>
            <div className="flex items-center gap-3">
              <SetuAiMark className="h-10 w-10 border border-stone-50/25 sm:h-11 sm:w-11" preload sizes="44px" />
              <p className="section-kicker section-kicker-accent">
                <LocalizedText en={home.hero.kicker} hi={hiHome.hero.kicker} />
              </p>
            </div>
            <h1 className="balance mt-6 max-w-4xl text-[clamp(3.25rem,8vw,5.8rem)] font-light leading-none tracking-tight">
              <LocalizedText en={home.hero.title} hi={hiHome.hero.title} />
            </h1>
            <p className="pretty mt-6 max-w-[58ch] text-lg leading-8 text-stone-50/78 sm:text-xl">
              <LocalizedText en={home.hero.body} hi={hiHome.hero.body} />
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink {...home.hero.primaryCta} />
              <ButtonLink
                {...home.hero.secondaryCta}
                className="border-stone-50/65 text-stone-50 hover:border-stone-50 hover:bg-stone-50 hover:text-[var(--color-ink)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--background)] py-8">
        <div className="section-shell">
          <dl className="grid border border-[var(--color-line)] bg-[var(--background)] md:grid-cols-4">
            {home.stats.map((stat, index) => (
              <div key={stat.label} className="kinetic-card motion-reveal border-b border-[var(--color-line)] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" data-animate data-tilt>
                <dt className="text-sm font-medium text-[var(--color-ink-soft)]">
                  <LocalizedText en={stat.label} hi={hiHome.stats[index]?.label} />
                </dt>
                <dd className="mt-2 text-4xl font-light tracking-tight text-[var(--color-deep)]">
                  <AnimatedStatValue value={stat.value} />
                </dd>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  <LocalizedText en={stat.detail} hi={hiHome.stats[index]?.detail} />
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="motion-reveal lg:sticky lg:top-28" data-animate>
            <p className="section-kicker">
              <LocalizedText en={home.intro.kicker} hi={hiHome.intro.kicker} />
            </p>
            <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
              <LocalizedText en={home.intro.title} hi={hiHome.intro.title} />
            </h2>
          </div>
          <div className="grid gap-6 text-lg leading-8 text-[var(--color-muted)]">
            <div className="kinetic-card motion-reveal soft-card p-6 sm:p-8" data-animate data-tilt>
              <p className="pretty text-xl font-normal leading-9 text-[var(--color-ink)]">
                <LocalizedText en={home.intro.featuredStatement} hi={hiHome.intro.featuredStatement} />
              </p>
            </div>
            {home.intro.body.map((paragraph, index) => (
              <p key={paragraph} className="motion-reveal" data-animate>
                <LocalizedText en={paragraph} hi={hiHome.intro.body[index]} />
              </p>
            ))}
          </div>
        </div>
      </section>

      <InteractiveMap />

      <section className="section-pad border-y border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-shell">
          <div className="motion-reveal grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end" data-animate>
            <div>
              <div className="flex items-center gap-3">
                <SetuAiMark className="h-8 w-8 border border-[var(--color-line)]" sizes="32px" />
                <p className="section-kicker">
                  <LocalizedText en="Founding collaboration" hi={hiHome.founding.kicker} />
                </p>
              </div>
              <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
                <LocalizedText
                  en="Three founding partners, one deliberate starting point."
                  hi={hiHome.founding.title}
                />
              </h2>
            </div>
            <p className="pretty text-lg leading-8 text-[var(--color-muted)]">
              <LocalizedText
                en="SetuAI is being organized as an independent initiative. Its founding partners bring education, technology, and community access perspectives into the same early work."
                hi={hiHome.founding.body}
              />
            </p>
          </div>

          <div className="mt-12 grid gap-px bg-[var(--color-line)] lg:grid-cols-3">
            {global.foundingPartners.map((partner, index) => {
              const external = partner.href.startsWith("http");
              const contentNode = (
                <>
                  <span className="flex items-start justify-between gap-5">
                    <span>
                      <span className="block text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-coral)]">
                        <LocalizedText en={partner.role} hi={hiHome.founding.partners[index]?.role} />
                      </span>
                      <span className="mt-4 block text-2xl font-normal leading-8 tracking-tight text-[var(--color-ink)]">
                        {partner.name}
                      </span>
                    </span>
                    {external ? <ExternalLink aria-hidden="true" size={18} className="mt-1 text-[var(--color-muted)]" /> : <ArrowRight aria-hidden="true" size={18} className="mt-1 text-[var(--color-muted)]" />}
                  </span>
                  <span className="pretty mt-6 block text-base leading-7 text-[var(--color-muted)]">
                    <LocalizedText en={partner.body} hi={hiHome.founding.partners[index]?.body} />
                  </span>
                </>
              );

              if (external) {
                return (
                  <a
                    key={partner.name}
                    href={partner.href}
                    target="_blank"
                    rel="noreferrer"
                    className="kinetic-card motion-reveal bg-[var(--background)] p-7 transition-colors hover:bg-white sm:p-8"
                    data-animate
                    data-tilt
                  >
                    {contentNode}
                  </a>
                );
              }

              return (
                <Link
                  key={partner.name}
                  href={partner.href}
                  className="kinetic-card motion-reveal bg-[var(--background)] p-7 transition-colors hover:bg-white sm:p-8"
                  data-animate
                  data-tilt
                >
                  {contentNode}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--color-deep)] py-20 text-stone-50 sm:py-24">
        <Image
          src={home.heartbeat.image.src}
          alt=""
          fill
          sizes="100vw"
          className="kinetic-image object-cover object-center opacity-[0.34] saturate-90"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#1c2526]/82" />
        <div className="section-shell relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className={["motion-reveal", visuals.motionEnabled ? "motion-rise" : ""].join(" ")} data-animate>
                    <p className="section-kicker section-kicker-accent">
              <LocalizedText en={home.heartbeat.kicker} hi={hiHome.heartbeat.kicker} />
            </p>
            <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight sm:text-5xl">
              <LocalizedText en={home.heartbeat.title} hi={hiHome.heartbeat.title} />
            </h2>
            <p className="pretty mt-5 text-lg leading-8 text-stone-50/78">
              <LocalizedText en={home.heartbeat.body} hi={hiHome.heartbeat.body} />
            </p>
            <div className="mt-8 grid gap-3">
              {home.heartbeat.pulses.map((pulse, index) => (
                <div
                  key={pulse}
                  className="kinetic-card mission-pulse-line min-w-0 border border-stone-50/15 bg-stone-50/[0.075] py-4 pl-7 pr-4"
                  data-tilt
                >
                  <span className="text-xs font-medium text-[var(--color-coral)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 break-words text-sm font-medium leading-6 text-stone-50/90 sm:text-base sm:leading-7">
                    <LocalizedText en={pulse} hi={hiHome.heartbeat.pulses[index]} />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="motion-reveal relative min-h-[25rem] min-w-0 lg:min-h-[34rem]" data-animate>
            {visuals.heartbeat3dEnabled ? (
              <MissionHeartbeat
                label={visuals.heartbeat3dLabel}
                density={visuals.visualDensity}
                enabled={visuals.motionEnabled}
              />
            ) : (
              <Image
                src={home.heartbeat.image.src}
                alt={home.heartbeat.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-contain"
              />
            )}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell">
          <div className="motion-reveal max-w-3xl" data-animate>
            <h2 className="balance text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
              <LocalizedText en={home.learning.title} hi={hiHome.learning.title} />
            </h2>
            <p className="pretty mt-5 text-lg leading-8 text-[var(--color-muted)]">
              <LocalizedText en={home.learning.body} hi={hiHome.learning.body} />
            </p>
          </div>
          <div className="mt-12 grid gap-px bg-[var(--color-line)] lg:grid-cols-3">
            {home.learning.cards.map((item, index) => {
              const Icon = iconFor(item);

              return (
              <article key={item.title} className="kinetic-card motion-reveal bg-[var(--background)] p-7 sm:p-8" data-animate data-tilt>
                <Icon aria-hidden="true" className="text-[var(--color-coral)]" size={30} strokeWidth={2.1} />
                <h3 className="mt-8 text-2xl font-normal leading-8 tracking-tight text-[var(--color-ink)]">
                  <LocalizedText en={item.title} hi={hiHome.learning.cards[index]?.title} />
                </h3>
                <p className="pretty mt-4 text-base leading-7 text-[var(--color-muted)]">
                  <LocalizedText en={item.body} hi={hiHome.learning.cards[index]?.body} />
                </p>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--color-deep)] text-stone-50">
        <div className="section-shell grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="kinetic-card motion-reveal relative min-h-[360px] overflow-hidden sm:min-h-[500px]" data-animate data-tilt>
            <Image
              src={home.textbook.image.src}
              alt={home.textbook.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="kinetic-image object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 border border-[var(--color-line)] bg-[var(--background)] p-5 text-[var(--color-ink)] sm:inset-x-8 sm:bottom-8">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                <LocalizedText en={home.textbook.calloutLabel} hi={hiHome.textbook.calloutLabel} />
              </p>
              <p className="mt-1 text-xl font-normal tracking-tight">
                <LocalizedText en={home.textbook.calloutTitle} hi={hiHome.textbook.calloutTitle} />
              </p>
            </div>
          </div>
          <div className="motion-reveal flex flex-col justify-center" data-animate>
            <div className="flex items-center gap-3">
              <SetuAiMark className="h-8 w-8 border border-stone-50/25" sizes="32px" />
              <p className="section-kicker section-kicker-accent">
                <LocalizedText en={home.textbook.kicker} hi={hiHome.textbook.kicker} />
              </p>
            </div>
            <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight sm:text-5xl">
              <LocalizedText en={home.textbook.title} hi={hiHome.textbook.title} />
            </h2>
            <p className="pretty mt-5 text-lg leading-8 text-stone-50/76">
              <LocalizedText en={home.textbook.body} hi={hiHome.textbook.body} />
            </p>
            <div className="mt-8 grid gap-3">
              {home.textbook.bullets.map((item, index) => (
                <div key={item} className="motion-reveal flex items-start gap-3" data-animate>
                  <CheckCircle2 aria-hidden="true" className="mt-1 text-[var(--color-coral)]" size={20} />
                  <span className="text-base font-medium text-stone-50/88">
                    <LocalizedText en={item} hi={hiHome.textbook.bullets[index]} />
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink {...home.textbook.primaryCta} />
              <ButtonLink
                {...home.textbook.secondaryCta}
                className="border-stone-50/65 text-stone-50 hover:border-stone-50 hover:bg-stone-50 hover:text-[var(--color-ink)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <div className="motion-reveal grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end" data-animate>
            <div>
              <h2 className="balance text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
                <LocalizedText en={home.audience.title} hi={hiHome.audience.title} />
              </h2>
            </div>
            <p className="pretty text-lg leading-8 text-[var(--color-muted)]">
              <LocalizedText en={home.audience.body} hi={hiHome.audience.body} />
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
            {home.audience.cards.map((item, index) => {
              const Icon = iconFor(item);

              return (
              <Link
                href={item.href || "/contact"}
                key={item.title}
                className={[
                  "kinetic-card motion-reveal group flex min-h-[230px] flex-col border border-[var(--color-line)] p-6 transition-transform duration-150",
                  index === 0
                    ? "bg-[var(--color-deep)] text-stone-50 lg:col-span-2 lg:row-span-2 lg:min-h-[430px] lg:p-8"
                    : "bg-[var(--background)] text-[var(--color-ink)]",
                ].join(" ")}
                data-animate
                data-tilt
              >
                <Icon
                  aria-hidden="true"
                  className="text-[var(--color-coral)]"
                  size={index === 0 ? 36 : 28}
                  strokeWidth={2.1}
                />
                <h3 className="mt-6 text-2xl font-normal tracking-tight">
                  <LocalizedText en={item.title} hi={hiHome.audience.cards[index]?.title} />
                </h3>
                <p className={["pretty mt-4 flex-1 text-base leading-7", index === 0 ? "text-stone-50/76" : "text-[var(--color-muted)]"].join(" ")}>
                  <LocalizedText en={item.body} hi={hiHome.audience.cards[index]?.body} />
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-coral)]">
                  <LocalizedText en="Learn more" />
                  <ArrowRight aria-hidden="true" size={16} />
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="motion-reveal" data-animate>
            <p className="section-kicker">
              <LocalizedText en={home.process.kicker} hi={hiHome.process.kicker} />
            </p>
            <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-5xl">
              <LocalizedText en={home.process.title} hi={hiHome.process.title} />
            </h2>
            <p className="pretty mt-5 text-lg leading-8 text-[var(--color-muted)]">
              <LocalizedText en={home.process.body} hi={hiHome.process.body} />
            </p>
          </div>
          <ol className="grid gap-4">
            {home.process.steps.map((step, index) => (
              <li key={step} className="kinetic-card motion-reveal soft-card grid grid-cols-[auto_1fr] items-center gap-5 p-5" data-animate data-tilt>
                <span className="grid h-12 w-12 place-items-center border border-[var(--color-coral)] bg-[var(--color-teal-soft)] text-sm font-medium text-[var(--color-deep)]">
                  {index + 1}
                </span>
                <span className="text-lg font-normal tracking-tight text-[var(--color-ink)]">
                  <LocalizedText en={step} hi={hiHome.process.steps[index]} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--color-coral)] py-16 text-white">
        <div className="motion-reveal section-shell flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between" data-animate>
          <div className="max-w-3xl">
            <h2 className="balance text-4xl font-light leading-tight tracking-tight sm:text-5xl">
              <LocalizedText en={home.closingCta.title} hi={hiHome.closingCta.title} />
            </h2>
            <p className="pretty mt-5 text-lg leading-8 text-white/86">
              <LocalizedText en={home.closingCta.body} hi={hiHome.closingCta.body} />
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink {...home.closingCta.primaryCta} />
            <ButtonLink {...home.closingCta.secondaryCta} />
          </div>
        </div>
      </section>
    </>
  );
}
