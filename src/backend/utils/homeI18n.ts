// Home page menu labels per UI language. Kannada is the default; add a language by adding a block.
const MENU = {
    kn: {
        name: "ಕನ್ನಡ", language: "ಭಾಷೆ", home: "ಮುಖಪುಟ", intro: "ಪರಿಚಯ", about: "ಯೋಜನೆಯ ಬಗ್ಗೆ",
        how: "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", fonts: "ಸಂಚಯ ಫಾಂಟ್‌ಗಳು", letterStyles: "ಅಕ್ಷರಶೈಲಿಗಳು", books: "ಪುಸ್ತಕಗಳು",
        contribute: "ಕೈಜೋಡಿಸಿ", collection: "ಸಂಗ್ರಹ", manage: "ಸಂಗ್ರಹ ನಿರ್ವಹಣೆ", bookList: "ಪುಸ್ತಕಗಳ ಪಟ್ಟಿ",
        letters: "ಅಕ್ಷರಗಳು", compare: "ಪುಸ್ತಕ ಹೋಲಿಕೆ", login: "ಲಾಗಿನ್", signup: "ನೋಂದಣಿ", sanchaya: "ಸಂಚಯ",
        sanchi: "ಸಂಚಿ ಫೌಂಡೇಶನ್", fontsSanchaya: "ಫಾಂಟ್ಸ್ ಸಂಚಯ", converter: "ಅಕ್ಷರರೂಪ ಪರಿವರ್ತಕ",
    },
    en: {
        name: "English", language: "Language", home: "Home", intro: "About", about: "About the project",
        how: "How it works", fonts: "Sanchaya fonts", letterStyles: "Letter styles", books: "Books",
        contribute: "Contribute", collection: "Collection", manage: "Manage collection", bookList: "Book list",
        letters: "Letters", compare: "Compare books", login: "Log in", signup: "Sign up", sanchaya: "Sanchaya",
        sanchi: "Sanchi Foundation", fontsSanchaya: "Fonts Sanchaya", converter: "Script converter",
    },
    hi: {
        name: "हिन्दी", language: "भाषा", home: "मुखपृष्ठ", intro: "परिचय", about: "परियोजना के बारे में",
        how: "यह कैसे काम करता है", fonts: "संचय फ़ॉन्ट", letterStyles: "अक्षर शैलियाँ", books: "पुस्तकें",
        contribute: "योगदान दें", collection: "संग्रह", manage: "संग्रह प्रबंधन", bookList: "पुस्तक सूची",
        letters: "अक्षर", compare: "पुस्तक तुलना", login: "लॉगिन", signup: "पंजीकरण", sanchaya: "संचय",
        sanchi: "संचि फ़ाउंडेशन", fontsSanchaya: "फ़ॉन्ट्स संचय", converter: "लिपि परिवर्तक",
    },
    ta: {
        name: "தமிழ்", language: "மொழி", home: "முகப்பு", intro: "அறிமுகம்", about: "திட்டம் பற்றி",
        how: "இது எப்படி வேலை செய்கிறது", fonts: "சஞ்சய எழுத்துருக்கள்", letterStyles: "எழுத்து வடிவங்கள்",
        books: "நூல்கள்", contribute: "பங்களியுங்கள்", collection: "தொகுப்பு", manage: "தொகுப்பு மேலாண்மை",
        bookList: "நூல் பட்டியல்", letters: "எழுத்துகள்", compare: "நூல் ஒப்பீடு", login: "உள்நுழை",
        signup: "பதிவு செய்", sanchaya: "சஞ்சய", sanchi: "சஞ்சி அறக்கட்டளை", fontsSanchaya: "ஃபான்ட்ஸ் சஞ்சய",
        converter: "எழுத்துரு மாற்றி",
    },
    te: {
        name: "తెలుగు", language: "భాష", home: "ముఖపుట", intro: "పరిచయం", about: "ప్రాజెక్ట్ గురించి",
        how: "ఇది ఎలా పనిచేస్తుంది", fonts: "సంచయ ఫాంట్లు", letterStyles: "అక్షర శైలులు", books: "పుస్తకాలు",
        contribute: "సహకరించండి", collection: "సంగ్రహం", manage: "సంగ్రహ నిర్వహణ", bookList: "పుస్తకాల జాబితా",
        letters: "అక్షరాలు", compare: "పుస్తక పోలిక", login: "లాగిన్", signup: "నమోదు", sanchaya: "సంచయ",
        sanchi: "సంచి ఫౌండేషన్", fontsSanchaya: "ఫాంట్స్ సంచయ", converter: "లిపి మార్పిడి సాధనం",
    },
    ml: {
        name: "മലയാളം", language: "ഭാഷ", home: "പൂമുഖം", intro: "ആമുഖം", about: "പദ്ധതിയെക്കുറിച്ച്",
        how: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു", fonts: "സഞ്ചയ ഫോണ്ടുകൾ", letterStyles: "അക്ഷരശൈലികൾ",
        books: "പുസ്തകങ്ങൾ", contribute: "പങ്കാളികളാകൂ", collection: "ശേഖരം", manage: "ശേഖര നിർവഹണം",
        bookList: "പുസ്തകപ്പട്ടിക", letters: "അക്ഷരങ്ങൾ", compare: "പുസ്തക താരതമ്യം", login: "ലോഗിൻ",
        signup: "രജിസ്റ്റർ ചെയ്യുക", sanchaya: "സഞ്ചയ", sanchi: "സഞ്ചി ഫൗണ്ടേഷൻ", fontsSanchaya: "ഫോണ്ട്സ് സഞ്ചയ",
        converter: "ലിപി പരിവർത്തനി",
    },
};

type Lang = keyof typeof MENU;
const isLang = (value: unknown): value is Lang => typeof value === "string" && value in MENU;

// ?lang= wins (and is remembered in a cookie by the caller), then the cookie, then Kannada.
export function pickLang(query: unknown, cookieHeader = ""): Lang {
    if (isLang(query)) return query;
    const cookie = cookieHeader.match(/(?:^|;\s*)lang=([a-z]+)/)?.[1];
    return isLang(cookie) ? cookie : "kn";
}

export const menuFor = (lang: Lang) => MENU[lang];
export const uiLanguages = Object.entries(MENU).map(([code, t]) => ({ code, name: t.name }));
