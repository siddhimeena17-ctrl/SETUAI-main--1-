export type Locale = "en" | "hi";

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  hi: "हिन्दी",
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "hi";
}

const hindiPhrases: Record<string, string> = {
  "A bridge into responsible AI": "जिम्मेदार AI तक पहुंच का पुल",
  "AI literacy for every curious student": "हर जिज्ञासु छात्र के लिए AI साक्षरता",
  "AI Literacy": "AI साक्षरता",
  "AI literacy support": "AI साक्षरता सहायता",
  "AI Textbook": "AI पाठ्यपुस्तक",
  "AI basics in student language": "छात्रों की भाषा में AI की बुनियाद",
  "About": "हमारे बारे में",
  "Ask about programs…": "कार्यक्रमों के बारे में पूछें...",
  "Bring SetuAI pilots, workshops, and resources to your school.":
    "अपने स्कूल में SetuAI पायलट, वर्कशॉप और संसाधन लाएं।",
  "Clear language before technical jargon": "तकनीकी शब्दों से पहले साफ भाषा",
  "Community access before private advantage": "निजी लाभ से पहले सामुदायिक पहुंच",
  "Companies": "कंपनियां",
  "Contact": "संपर्क",
  "Corporate Partners": "कॉरपोरेट पार्टनर",
  "Current initiative": "वर्तमान पहल",
  "Education nonprofits": "शिक्षा गैर-लाभकारी संस्थाएं",
  "Email": "ईमेल",
  "Explore programs": "कार्यक्रम देखें",
  "Explore the textbook": "पाठ्यपुस्तक देखें",
  "FAQ": "सवाल-जवाब",
  "Families": "परिवार",
  "For Audiences": "दर्शकों के लिए",
  "Founding Partners": "संस्थापक पार्टनर",
  "Get Involved": "साथ जुड़ें",
  "Get Updates": "अपडेट पाएं",
  "Get involved": "साथ जुड़ें",
  "Help more students meet AI with confidence, not confusion.":
    "ज्यादा छात्रों को भ्रम नहीं, आत्मविश्वास के साथ AI से मिलाएं।",
  "Human judgment before automation": "ऑटोमेशन से पहले मानवीय निर्णय",
  "Impact": "प्रभाव",
  "Interest": "रुचि",
  "Latest Updates": "नए अपडेट",
  "Language selector": "भाषा चुनें",
  "Learn more": "और जानें",
  "Message": "संदेश",
  "Mission": "मिशन",
  "Name": "नाम",
  "Organization": "संस्था",
  "Main navigation": "मुख्य नेविगेशन",
  "Open menu": "मेन्यू खोलें",
  "Outreach form": "संपर्क फॉर्म",
  "Parent night": "अभिभावक सत्र",
  "Parents": "अभिभावक",
  "Partner with SetuAI": "SetuAI से पार्टनरशिप करें",
  "Partners": "पार्टनर",
  "Practice with responsible tools": "जिम्मेदार टूल्स के साथ अभ्यास",
  "Programs": "कार्यक्रम",
  "Resources": "संसाधन",
  "School Partnerships": "स्कूल पार्टनरशिप",
  "School partnership": "स्कूल पार्टनरशिप",
  "School partnership path": "स्कूल पार्टनरशिप मार्ग",
  "School workshop": "स्कूल वर्कशॉप",
  "Schools": "स्कूल",
  "Send Inquiry": "पूछताछ भेजें",
  "Send the basics. SetuAI can follow up with the right program, sponsorship, or volunteer path.":
    "बुनियादी जानकारी भेजें। SetuAI सही कार्यक्रम, स्पॉन्सरशिप या स्वयंसेवा मार्ग के साथ जवाब देगा।",
  "Sponsor": "स्पॉन्सर",
  "Sponsor copies": "प्रतियां स्पॉन्सर करें",
  "Start a partnership": "पार्टनरशिप शुरू करें",
  "Start a school inquiry": "स्कूल पूछताछ शुरू करें",
  "Start the conversation": "बातचीत शुरू करें",
  "Stories": "कहानियां",
  "Students": "छात्र",
  "Take Action": "कार्रवाई करें",
  "Team": "टीम",
  "Teacher Training": "शिक्षक प्रशिक्षण",
  "Teacher training": "शिक्षक प्रशिक्षण",
  "Textbook Initiative": "पाठ्यपुस्तक पहल",
  "Textbook access students can keep in hand.": "ऐसी पाठ्यपुस्तक पहुंच जिसे छात्र अपने पास रख सकें।",
  "Textbook pilot": "पाठ्यपुस्तक पायलट",
  "The collaboration behind SetuAI.org.": "SetuAI.org के पीछे की साझेदारी।",
  "Three organizations, one clear mission: make AI literacy reachable.":
    "तीन संगठन, एक साफ मिशन: AI literacy को पहुंच योग्य बनाना।",
  "Thinking…": "सोच रहा है...",
  "Updates": "अपडेट",
  "Volunteer": "स्वयंसेवा",
  "Volunteers": "स्वयंसेवक",
  "Why AI literacy belongs in every community.": "AI साक्षरता हर समुदाय में क्यों जरूरी है।",
  "Choose one": "एक चुनें",
  "General question": "सामान्य सवाल",
  "General support": "सामान्य सहायता",
  "School pilot": "स्कूल पायलट",
  "Corporate volunteering": "कॉरपोरेट स्वयंसेवा",
  "Textbook sponsorship": "पाठ्यपुस्तक स्पॉन्सरशिप",
  "Workshop support": "वर्कशॉप सहायता",
  "Curriculum review": "पाठ्यक्रम समीक्षा",
  "Outreach": "आउटरीच",
  "Operations": "संचालन",
  "Sponsorship": "स्पॉन्सरशिप",
  "Sending…": "भेजा जा रहा है...",
  "Thanks. Your inquiry was received.": "धन्यवाद। आपकी पूछताछ मिल गई है।",
  "Something went wrong. Please try again or email SetuAI directly.":
    "कुछ गलत हुआ। कृपया फिर कोशिश करें या SetuAI को सीधे ईमेल करें।",
  "Joint AI literacy initiative": "संयुक्त AI साक्षरता पहल",
  "Serving schools, education nonprofits, and sponsor partners":
    "स्कूलों, शिक्षा गैर-लाभकारी संस्थाओं और स्पॉन्सर पार्टनरों के लिए",
  "SetuAI.org. All rights reserved.": "SetuAI.org. सर्वाधिकार सुरक्षित।",
  "Bridging AI literacy and community access.": "AI साक्षरता और सामुदायिक पहुंच के बीच पुल।",
  "Close assistant": "Assistant बंद करें",
  "Open SetuAI assistant": "SetuAI assistant खोलें",
  "Send message": "संदेश भेजें",
  "Send SetuAI a message": "SetuAI को संदेश भेजें",
  "Skip to content": "मुख्य सामग्री पर जाएं",
  "Tell us about grade levels, timeline, location, or how you would like to help…":
    "हमें grade levels, timeline, location या आप कैसे मदद करना चाहते हैं, इसके बारे में बताएं...",
  "View textbook initiative": "पाठ्यपुस्तक पहल देखें",
  "SetuAI.org is a joint AI literacy initiative created by Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation to help schools, education nonprofits, and sponsors bring practical AI learning to students.":
    "SetuAI.org Summit Intelligent Systems, Shikivaa Foundation और SKYPA Foundation द्वारा बनाई गई संयुक्त AI साक्षरता पहल है, जो schools, education nonprofits और sponsors को छात्रों तक practical AI learning पहुंचाने में मदद करती है।",
  "SetuAI.org is an independent initiative, but its strength comes from founding partners that bring education, technology, and community access into the same room.":
    "SetuAI.org एक स्वतंत्र पहल है, लेकिन इसकी ताकत उन founding partners से आती है जो education, technology और community access को साथ लाते हैं।",
};

export function translatePhrase(value: string, locale: Locale) {
  if (locale === "en") return value;
  return hindiPhrases[value] || value;
}
