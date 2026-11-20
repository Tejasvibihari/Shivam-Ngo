/**
 * Single source of truth for the /news pages (newspaper coverage).
 *
 * HOW TO ADD A NEWS ARTICLE
 *  1. Put the cutting / photo in /public/news/ (for example /public/news/my-article.jpg).
 *  2. Copy the article object below, change the slug, texts and image path.
 *  Every article has a Hindi (hi) and an English (en) version. Hindi is shown first.
 *
 * RULES
 *  - `date` is OPTIONAL. Leave it out when the date is not known and nothing is shown on the page.
 *    Accepted formats: "2025-03-14" (full date), "2025-03" (month and year) or "2025" (year only).
 *  - `publication` (newspaper name) is OPTIONAL too and is shown only when set.
 */

export type Lang = "hi" | "en";
export type Localized<T = string> = Record<Lang, T>;

export type NewsBlock =
    | { type: "h2"; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] };

export type NewsItem = {
    /** URL: /news/<slug> */
    slug: string;
    category: Localized;
    subcategory: Localized;
    title: Localized;
    subtitle: Localized;
    /** short excerpt shown on the News & Events page */
    summary: Localized;
    /** under ~160 characters, used as the search-engine description */
    metaDescription: string;
    keywords: string[];
    /** image shown on the card and in the article */
    image: string;
    imageAlt: Localized;
    /** Newspaper name, e.g. "Dainik Jagran". Optional. */
    publication?: string;
    /** "YYYY-MM-DD", "YYYY-MM" or "YYYY". Leave out when unknown. */
    date?: string;
    body: Localized<NewsBlock[]>;
    /** optional highlighted closing statement */
    closing?: Partial<Localized<{ label: string; text: string }>>;
};

export const NEWS_ITEMS: NewsItem[] = [
    {
        slug: "city-deluxe-public-toilets",
        category: { hi: "नगर विकास", en: "Urban Development" },
        subcategory: { hi: "स्वच्छता एवं सार्वजनिक सुविधाएं", en: "Sanitation & Public Amenities" },
        title: {
            hi: "शहर में बनेंगे डीलक्स शौचालय, महिला-पुरुष के लिए होंगी अलग-अलग सुविधाएं",
            en: "Deluxe Public Toilets to Be Constructed at Five Locations in the City",
        },
        subtitle: {
            hi: "पांच प्रमुख स्थानों पर आधुनिक शौचालयों का होगा निर्माण, वॉश बेसिन और स्वच्छता की भी रहेगी विशेष व्यवस्था।",
            en: "Separate facilities for men and women, washbasins, modern amenities and improved sanitation arrangements planned.",
        },
        summary: {
            hi: "नगर निगम शहर के पांच प्रमुख स्थानों (जिला स्कूल के सामने, शिवगंज, जगजीवन मार्केट, कलेक्ट्रेट परिसर और पावरगंज) पर डीलक्स शौचालय बनाएगा। इनमें महिलाओं और पुरुषों के लिए अलग-अलग सुविधाएं, वॉश बेसिन, गुणवत्तापूर्ण टाइल्स और साफ-सफाई की विशेष व्यवस्था होगी। नगर आयुक्त वीरेंद्र कुमार के अनुसार अन्य उपयुक्त स्थानों को भी चिह्नित किया जा रहा है।",
            en: "The Municipal Corporation is preparing to build deluxe public toilets at five locations: in front of the District School, Shivganj, Jagjivan Market, Collectorate Campus and Pawarganj. The toilets will have separate facilities for men and women, washbasins, quality tiles and a strong focus on cleanliness and maintenance. Municipal Commissioner Virendra Kumar said more suitable locations are also being identified.",
        },
        metaDescription:
            "Deluxe public toilets with separate facilities for men and women, washbasins and better sanitation will be built at five city locations, says the Municipal Corporation.",
        keywords: [
            "deluxe public toilets",
            "public toilet construction",
            "urban sanitation",
            "municipal corporation",
            "separate toilets for men and women",
            "Jagjivan Market",
            "Collectorate Campus",
            "Pawarganj",
            "Shivganj",
            "डीलक्स शौचालय",
            "सार्वजनिक शौचालय",
            "नगर निगम",
            "स्वच्छता",
        ],
        image: "/news/new1.webp",
        imageAlt: {
            hi: "शहर में बनने वाले डीलक्स शौचालय",
            en: "Proposed deluxe public toilets in the city",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "शहरवासियों को बेहतर सार्वजनिक सुविधाएं उपलब्ध कराने की दिशा में नगर निगम ने एक महत्वपूर्ण पहल की है। शहर के पांच प्रमुख स्थानों पर डीलक्स शौचालयों का निर्माण कराया जाएगा। इन शौचालयों में महिलाओं और पुरुषों के लिए अलग-अलग व्यवस्था होगी। साथ ही, हाथ धोने के लिए वॉश बेसिन और अन्य आधुनिक सुविधाएं भी उपलब्ध कराई जाएंगी।",
                },
                {
                    type: "p",
                    text: "नगर निगम की योजना के अनुसार, शहर के जिला स्कूल के सामने, शिवगंज, जगजीवन मार्केट, कलेक्ट्रेट परिसर और पावरगंज में डीलक्स शौचालय बनाए जाएंगे।",
                },
                { type: "h2", text: "आधुनिक सुविधाओं से होंगे लैस" },
                {
                    type: "p",
                    text: "प्रस्तावित डीलक्स शौचालयों में लोगों की जरूरतों को ध्यान में रखते हुए कई सुविधाएं उपलब्ध कराई जाएंगी। शौचालयों में महिलाओं और पुरुषों के लिए अलग-अलग सेक्शन होंगे। महिलाओं के लिए अलग बाथरूम और वॉश बेसिन की व्यवस्था रहेगी, जबकि पुरुषों के लिए भी अलग सुविधाएं विकसित की जाएंगी।",
                },
                {
                    type: "p",
                    text: "शौचालयों में साफ-सफाई का विशेष ध्यान रखा जाएगा। फर्श पर अच्छी गुणवत्ता की टाइल्स लगाई जाएंगी और दीवारों पर भी टाइल्स लगाई जाएंगी। इसके अलावा, हाथ धोने के लिए पर्याप्त वॉश बेसिन लगाए जाएंगे।",
                },
                { type: "h2", text: "इन पांच स्थानों पर होगा निर्माण" },
                {
                    type: "ol",
                    items: ["जिला स्कूल के सामने", "शिवगंज", "जगजीवन मार्केट", "कलेक्ट्रेट परिसर", "पावरगंज"],
                },
                { type: "h2", text: "अधिकारियों ने क्या कहा?" },
                {
                    type: "p",
                    text: "नगर आयुक्त वीरेंद्र कुमार ने बताया कि नागरिक सुविधाओं को बेहतर बनाने की दिशा में यह एक सकारात्मक प्रयास है। डीलक्स शौचालयों के निर्माण के लिए शहर के अन्य उपयुक्त स्थानों को भी चिह्नित किया जा रहा है। नगर निगम का प्रयास है कि शहरवासियों को अधिक से अधिक सुविधाएं उपलब्ध कराई जा सकें।",
                },
                {
                    type: "p",
                    text: "नगर निगम के अनुसार, शौचालयों के निर्माण और संचालन के लिए आवश्यक व्यवस्थाएं की जाएंगी। इनके रखरखाव और साफ-सफाई पर भी विशेष ध्यान दिया जाएगा।",
                },
                { type: "h2", text: "नागरिकों की प्रतिक्रिया" },
                {
                    type: "p",
                    text: "शहर में सार्वजनिक शौचालयों की मौजूदा स्थिति को लेकर नागरिकों ने अपनी राय रखी। उनका कहना है कि कई स्थानों पर शौचालयों में पर्याप्त सुविधाएं नहीं हैं और लोगों को पानी की समस्या का भी सामना करना पड़ता है।",
                },
                {
                    type: "p",
                    text: "नागरिकों ने उम्मीद जताई कि नए डीलक्स शौचालय बनने से शहरवासियों को राहत मिलेगी और सार्वजनिक स्वच्छता व्यवस्था में सुधार होगा।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "In an important step towards improving public amenities, the Municipal Corporation has initiated preparations for the construction of deluxe public toilets at five major locations across the city.",
                },
                {
                    type: "p",
                    text: "The proposed toilets will feature separate facilities for men and women, along with washbasins and other modern amenities. The initiative aims to provide residents and visitors with clean, hygienic and convenient public sanitation facilities.",
                },
                {
                    type: "p",
                    text: "According to the proposed plan, deluxe public toilets will be constructed at the following locations:",
                },
                {
                    type: "ul",
                    items: [
                        "In front of the District School",
                        "Shivganj, near the main entrance of Sadar Hospital",
                        "Jagjivan Market",
                        "Collectorate Campus",
                        "Pawarganj",
                    ],
                },
                { type: "h2", text: "Equipped with Modern Facilities" },
                {
                    type: "p",
                    text: "The proposed deluxe toilets will be designed to meet the needs of the public. Separate sections will be developed for men and women to ensure privacy and convenience.",
                },
                {
                    type: "p",
                    text: "The facilities will include separate bathrooms, washbasins for handwashing and improved sanitation arrangements. Special attention will also be given to cleanliness and maintenance.",
                },
                {
                    type: "p",
                    text: "Quality tiles will be installed on the floors and walls to ensure a better and more hygienic environment. Adequate water facilities and proper arrangements for handwashing will also be provided.",
                },
                { type: "h2", text: "Five Locations Identified for Construction" },
                {
                    type: "ol",
                    items: ["In front of District School", "Shivganj", "Jagjivan Market", "Collectorate Campus", "Pawarganj"],
                },
                { type: "h2", text: "What Do the Officials Say?" },
                {
                    type: "p",
                    text: "Municipal Commissioner Virendra Kumar stated that the initiative is part of the corporation's efforts to improve public amenities. Additional suitable locations are also being identified for the construction of deluxe public toilets.",
                },
                {
                    type: "p",
                    text: "The Municipal Corporation aims to provide better sanitation facilities to residents and make public spaces more convenient and hygienic.",
                },
                {
                    type: "p",
                    text: "Engineer Sachidanand Mishra also discussed the proposed construction arrangements, including the use of quality tiles and improved infrastructure.",
                },
                { type: "h2", text: "Citizens Welcome the Initiative" },
                {
                    type: "p",
                    text: "Local residents have highlighted the difficulties caused by the lack of proper public toilet facilities in the city. They pointed out that existing facilities often lack adequate water supply and proper maintenance.",
                },
                {
                    type: "p",
                    text: "Citizens have expressed hope that the construction of new deluxe public toilets will provide significant relief, particularly to women and other people who depend on public facilities.",
                },
                { type: "h2", text: "A Step Towards Better Urban Sanitation" },
                {
                    type: "p",
                    text: "The initiative is expected to improve public convenience, promote hygiene and strengthen sanitation infrastructure across the city.",
                },
                {
                    type: "p",
                    text: "With separate facilities for men and women, washbasins and improved maintenance arrangements, the proposed deluxe toilets represent an important step towards creating a cleaner and more accessible urban environment.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "शहर में बेहतर सार्वजनिक सुविधाएं उपलब्ध कराना, स्वच्छता को बढ़ावा देना और महिलाओं एवं पुरुषों के लिए अलग-अलग सुविधाओं के साथ सुविधाजनक सार्वजनिक शौचालय विकसित करना।",
            },
        },
    },

    {
        slug: "vocational-training-for-employment",
        category: {
            hi: "रोजगार एवं कौशल विकास",
            en: "Employment & Skill Development",
        },
        subcategory: {
            hi: "प्रशिक्षण एवं रोजगार",
            en: "Vocational Training & Employment",
        },
        title: {
            hi: "रोजगार के लिए लोगों को दी ट्रेनिंग, कंप्यूटर की दी गई जानकारी",
            en: "Training Provided to People for Employment, Computer Skills Also Taught",
        },
        subtitle: {
            hi: "स्वर्ण जयंती शहरी रोजगार गारंटी योजना के तहत सिलाई, बुनाई, कढ़ाई, ब्यूटीशियन और कंप्यूटर सहित विभिन्न कौशलों का दिया गया प्रशिक्षण।",
            en: "Vocational training in sewing, knitting, embroidery, beauty services and computer skills organized under the Swarna Jayanti Shahari Rozgar Yojana.",
        },
        summary: {
            hi: "स्वर्ण जयंती शहरी रोजगार गारंटी योजना के तहत आरा की पकड़ी न्यू कॉलोनी में शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र के तत्वावधान में प्रशिक्षण कार्यक्रम आयोजित किया गया। कार्यक्रम की अध्यक्षता महापौर लक्ष्मण चौरसिया ने की और उद्घाटन डीएम सफीना एएन ने दीप प्रज्ज्वलित कर किया। प्रशिक्षण में सिलाई, बुनाई, कढ़ाई, ब्यूटीशियन, कंप्यूटर और अचार बनाने जैसे कौशलों की जानकारी दी गई। प्रशिक्षण के बाद लोगों को स्वरोजगार के अवसर उपलब्ध कराने और उत्पादों की बिक्री में सहायता देने की बात कही गई।",
            en: "A vocational training programme was organized by Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra in Pakri New Colony, Ara, under the Swarna Jayanti Shahari Rozgar Yojana. Mayor Laxman Chaurasia presided over the programme, which was inaugurated by DM Safina A.N. by lighting a ceremonial lamp. Participants received information about sewing, knitting, embroidery, beauty services, computers and pickle-making. The initiative aimed to help people develop skills, access raw materials and create opportunities for self-employment.",
        },
        metaDescription:
            "Vocational training in sewing, embroidery, beauty services and computers organized in Ara under the Swarna Jayanti Shahari Rozgar Yojana to promote employment and self-employment.",
        keywords: [
            "vocational training",
            "employment training",
            "Swarna Jayanti Shahari Rozgar Yojana",
            "skill development",
            "self employment",
            "computer training",
            "sewing training",
            "beautician training",
            "Shivam Jan Swasthya",
            "Ara Bihar",
            "रोजगार प्रशिक्षण",
            "स्वर्ण जयंती शहरी रोजगार गारंटी योजना",
            "कौशल विकास",
            "स्वरोजगार",
            "कंप्यूटर प्रशिक्षण",
            "सिलाई प्रशिक्षण",
            "ब्यूटीशियन प्रशिक्षण",
            "आरा",
        ],
        image: "/news/new3.webp",
        imageAlt: {
            hi: "स्वर्ण जयंती शहरी रोजगार गारंटी योजना के तहत आयोजित रोजगार प्रशिक्षण कार्यक्रम",
            en: "Vocational training programme organized under the Swarna Jayanti Shahari Rozgar Yojana",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "स्वर्ण जयंती शहरी रोजगार गारंटी योजना के तहत आरा की पकड़ी न्यू कॉलोनी में शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र के तत्वावधान में प्रशिक्षण कार्यक्रम का आयोजन किया गया। कार्यक्रम की अध्यक्षता महापौर लक्ष्मण चौरसिया ने की।",
                },
                {
                    type: "p",
                    text: "प्रशिक्षण कार्यक्रम का उद्घाटन डीएम सफीना एएन ने दीप प्रज्ज्वलित कर किया। इस अवसर पर उन्होंने बताया कि यह केंद्र सरकार द्वारा प्रायोजित योजना है, जिसमें राज्य सरकार की भी भागीदारी है।",
                },
                {
                    type: "h2",
                    text: "प्रशिक्षण के बाद मिलेगा स्वरोजगार का अवसर",
                },
                {
                    type: "p",
                    text: "कार्यक्रम में बताया गया कि प्रशिक्षण पूरा होने के बाद लोगों को व्यवसाय शुरू करने के अवसर उपलब्ध कराए जाएंगे। स्वयंसेवी संगठनों के माध्यम से कच्चा माल उपलब्ध कराने की जानकारी भी दी जाएगी, ताकि प्रशिक्षित लोग अपने उत्पाद तैयार कर उन्हें बाजार में बेच सकें।",
                },
                {
                    type: "p",
                    text: "इस कार्य को समूह या व्यक्तिगत रूप से किया जा सकता है। अधिकारियों के अनुसार, इस तरह की पहल को बढ़ावा देने से अधिक से अधिक लोगों को रोजगार मिल सकेगा।",
                },
                {
                    type: "h2",
                    text: "सिलाई, बुनाई और कंप्यूटर सहित कई विषयों का प्रशिक्षण",
                },
                {
                    type: "p",
                    text: "प्रशिक्षण कार्यक्रम में सिलाई, बुनाई, कढ़ाई, ब्यूटीशियन, कंप्यूटर और अचार बनाने सहित कई प्रकार के कौशलों के बारे में जानकारी दी जा रही है। इसका उद्देश्य लोगों को व्यावहारिक कौशल प्रदान करना और उन्हें आत्मनिर्भर बनने के लिए प्रोत्साहित करना है।",
                },
                {
                    type: "h2",
                    text: "प्रशासन और जनता के बीच कड़ी है एनजीओ",
                },
                {
                    type: "p",
                    text: "डीएम ने एनजीओ को प्रशासन और जनता के बीच की महत्वपूर्ण कड़ी बताया। उन्होंने कहा कि ऐसे संगठनों के माध्यम से सरकारी योजनाओं की जानकारी और लाभ आम लोगों तक पहुंचाने में मदद मिलती है।",
                },
                {
                    type: "p",
                    text: "उद्घाटन समारोह में नगर आयुक्त अशोक कुमार सिंह, अपर नगर आयुक्त परमेश्वर राम, वार्ड पार्षद भरत पासवान, निशी देवी और वीणा सहित अन्य लोग उपस्थित थे।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "A vocational training programme was organized under the Swarna Jayanti Shahari Rozgar Yojana at Pakri New Colony in Ara. The programme was conducted under the supervision of Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra and presided over by Mayor Laxman Chaurasia.",
                },
                {
                    type: "p",
                    text: "The training programme was inaugurated by District Magistrate Safina A.N. by lighting a ceremonial lamp. On the occasion, she explained that the initiative was sponsored by the Central Government with participation from the State Government as well.",
                },
                {
                    type: "h2",
                    text: "Employment and Self-Employment Opportunities After Training",
                },
                {
                    type: "p",
                    text: "It was explained that participants would be provided with opportunities to start their own businesses after completing the training. Information about obtaining raw materials through voluntary organizations would also be provided, helping participants manufacture products and sell them in the market.",
                },
                {
                    type: "p",
                    text: "These activities could be carried out individually or in groups. Officials stated that promoting such initiatives would help create employment opportunities for more people.",
                },
                {
                    type: "h2",
                    text: "Training in Sewing, Knitting, Embroidery and Computers",
                },
                {
                    type: "p",
                    text: "The training programme covered various skills, including sewing, knitting, embroidery, beauty services, computer education and pickle-making. The objective was to provide practical skills and encourage participants to become self-reliant.",
                },
                {
                    type: "h2",
                    text: "NGOs as a Link Between Administration and the Public",
                },
                {
                    type: "p",
                    text: "The District Magistrate described non-governmental organizations (NGOs) as an important link between the administration and the public. Such organizations help communicate government schemes and make their benefits accessible to ordinary citizens.",
                },
                {
                    type: "p",
                    text: "The inauguration ceremony was attended by Municipal Commissioner Ashok Kumar Singh, Additional Municipal Commissioner Parmeshwar Ram, Ward Councillor Bharat Paswan, Nishi Devi and Veena, among others.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "लोगों को व्यावसायिक कौशल का प्रशिक्षण देकर स्वरोजगार के अवसर उपलब्ध कराना, आत्मनिर्भरता को बढ़ावा देना और शहरी रोजगार के साधन विकसित करना।",
            },
        },
    },

    {
        slug: "saharsa-city-cleaning-handed-over-to-ngos",
        category: {
            hi: "नगर विकास",
            en: "Urban Development",
        },
        subcategory: {
            hi: "स्वच्छता एवं सफाई व्यवस्था",
            en: "Sanitation & Cleaning Management",
        },
        title: {
            hi: "सहरसा शहर की सफाई भागलपुर की एनजीओ के हवाले",
            en: "Cleaning of Saharsa City Handed Over to NGOs from Bhagalpur",
        },
        subtitle: {
            hi: "शहर के सभी 40 वार्डों की सफाई का जिम्मा पटना और भागलपुर की एनजीओ को सौंपा गया, नियमित निगरानी के भी निर्देश।",
            en: "Cleaning responsibilities for all 40 wards of Saharsa have been assigned to NGOs from Patna and Bhagalpur, with regular monitoring planned.",
        },
        summary: {
            hi: "21 सितंबर 2016 की दैनिक जागरण की रिपोर्ट के अनुसार, सहरसा शहर के सभी 40 वार्डों की सफाई का जिम्मा पटना और भागलपुर की एनजीओ को सौंप दिया गया। पहले 20 वार्डों की जिम्मेदारी कुछ दिन पहले दी गई थी, जबकि शेष 20 वार्डों की जिम्मेदारी मंगलवार को सौंपी गई। नगर परिषद के कार्यपालक पदाधिकारी ने नियमित निगरानी और मुख्य सड़कों के साथ गली-मोहल्लों की सफाई के निर्देश दिए। हालांकि, स्थानीय लोगों ने सफाई कर्मियों की अनुपस्थिति और जलजमाव को लेकर शिकायतें भी कीं।",
            en: "According to a Dainik Jagran report dated 21 September 2016, cleaning responsibilities for all 40 wards of Saharsa city were handed over to NGOs from Patna and Bhagalpur. The first 20 wards had been assigned earlier, while the remaining 20 were handed over on Tuesday. The Municipal Council's Executive Officer directed regular monitoring and cleaning of both main roads and residential streets. However, residents raised concerns about the absence of cleaning workers and persistent waterlogging.",
        },
        metaDescription:
            "Saharsa Municipal Council handed over sanitation responsibilities for all 40 wards to NGOs from Patna and Bhagalpur in September 2016, with regular monitoring planned.",
        keywords: [
            "Saharsa city cleaning",
            "Saharsa sanitation",
            "NGO cleaning services",
            "Municipal Council Saharsa",
            "urban cleanliness",
            "40 wards cleaning",
            "waterlogging in Saharsa",
            "sanitation management Bihar",
            "सहरसा शहर की सफाई",
            "सहरसा नगर परिषद",
            "एनजीओ सफाई अभियान",
            "40 वार्डों की सफाई",
            "स्वच्छता व्यवस्था",
            "जलजमाव",
            "नगर विकास",
            "बिहार",
        ],
        image: "/news/new2.webp",
        imageAlt: {
            hi: "सहरसा शहर के 40 वार्डों की सफाई की जिम्मेदारी एनजीओ को सौंपने से संबंधित समाचार",
            en: "Newspaper report about NGOs taking responsibility for cleaning all 40 wards of Saharsa city",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "शहर का कोई भी वार्ड सफाई से वंचित नहीं रहेगा। सहरसा शहर के सभी 40 वार्डों में सफाई का जिम्मा एनजीओ को सौंप दिया गया है। बीस वार्डों की जिम्मेदारी कुछ दिन पहले ही एनजीओ को दे दी गई थी, जबकि शेष 20 वार्डों की सफाई का जिम्मा भी मंगलवार को एनजीओ को सौंप दिया गया।",
                },
                {
                    type: "p",
                    text: "नगर परिषद के कार्यपालक पदाधिकारी ने बताया कि पटना और भागलपुर के एनजीओ को सफाई की जिम्मेदारी सौंपी गई है। शहर के सभी वार्डों में एनजीओ के कर्मचारियों द्वारा सफाई अभियान चलाया जाएगा, जिसकी नियमित रूप से निगरानी भी की जाएगी।",
                },
                {
                    type: "h2",
                    text: "मुख्य सड़कों के साथ गली-मोहल्लों की भी होगी सफाई",
                },
                {
                    type: "p",
                    text: "सफाई अभियान के तहत केवल मुख्य सड़कों की ही नहीं, बल्कि गली-मोहल्लों की सड़कों की भी सफाई करने का निर्देश दिया गया है। शहर में जलजमाव की समस्या के अस्थायी समाधान को लेकर भी प्रयास किए जा रहे हैं।",
                },
                {
                    type: "p",
                    text: "कार्यपालक पदाधिकारी ने बताया कि साफ-सफाई को लेकर लगातार मिल रही शिकायतों के बाद एनजीओ को सफाई कार्य की जिम्मेदारी दी गई है। नगर परिषद का उद्देश्य शहर की सफाई व्यवस्था को बेहतर बनाना है।",
                },
                {
                    type: "h2",
                    text: "सड़क पर नहीं दिखते थे एनजीओ के कर्मचारी",
                },
                {
                    type: "p",
                    text: "कुछ दिन पहले शहर के 20 वार्डों की सफाई का जिम्मा एनजीओ को सौंपा गया था। एसडीओ ने सीटी बजाकर सुपर बाजार से इसकी विधिवत शुरुआत कराई थी। पहले दिन एनजीओ के कर्मचारी और मजदूर सफाई करते नजर आए, लेकिन इसके बाद किसी भी दिन उनके कर्मचारी और मजदूर सफाई करते दिखाई नहीं दिए।",
                },
                {
                    type: "p",
                    text: "स्थानीय लोगों का कहना था कि सफाई अभियान के उद्घाटन के दूसरे ही दिन सफाई व्यवस्था की स्थिति ऐसी हो गई, तो आने वाले दिनों में शहर कितना साफ रह पाएगा।",
                },
                {
                    type: "h2",
                    text: "जलजमाव से स्थिति नारकीय",
                },
                {
                    type: "p",
                    text: "नगर परिषद क्षेत्र की लगभग सभी मुख्य सड़कों और गली-मोहल्लों में जलजमाव के कारण स्थिति नारकीय बनी हुई थी। लोगों को पैदल या गाड़ियों से सड़कों पर निकलने में परेशानी हो रही थी। पानी से उठने वाली दुर्गंध के कारण बीमारियां फैलने का खतरा भी बना हुआ था।",
                },
                {
                    type: "p",
                    text: "रिपोर्ट के अनुसार, नगर परिषद की ओर से ब्लीचिंग पाउडर और डीडीटी आदि का छिड़काव भी नहीं किया जा रहा था। इस कारण स्थानीय लोगों को जलजमाव और गंदगी की समस्या का सामना करना पड़ रहा था।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "No ward of Saharsa city would remain without cleaning services. The responsibility for sanitation across all 40 wards of the city was handed over to NGOs. The first 20 wards had been assigned to NGOs a few days earlier, while the responsibility for cleaning the remaining 20 wards was also handed over on Tuesday.",
                },
                {
                    type: "p",
                    text: "The Municipal Council's Executive Officer stated that NGOs from Patna and Bhagalpur had been assigned the cleaning responsibilities. Sanitation campaigns would be conducted by NGO workers across all city wards and would be regularly monitored.",
                },
                {
                    type: "h2",
                    text: "Cleaning of Main Roads and Residential Streets",
                },
                {
                    type: "p",
                    text: "The cleaning instructions covered not only the main roads but also the streets and neighbourhood lanes. Efforts were also being made to find temporary solutions to the city's waterlogging problems.",
                },
                {
                    type: "p",
                    text: "The Executive Officer explained that the responsibility had been assigned to NGOs following repeated public complaints about sanitation. The Municipal Council aimed to improve the overall cleanliness of the city.",
                },
                {
                    type: "h2",
                    text: "NGO Cleaning Workers Were Not Seen on the Roads",
                },
                {
                    type: "p",
                    text: "A few days earlier, NGOs had been assigned responsibility for cleaning 20 wards of the city. The Sub-Divisional Officer (SDO) had formally launched the initiative by blowing a whistle at Super Bazaar. NGO workers and labourers were seen cleaning on the first day, but residents reported that they were not visible carrying out cleaning work on subsequent days.",
                },
                {
                    type: "p",
                    text: "Residents questioned the effectiveness of the campaign, saying that if the cleaning situation had deteriorated just one day after its inauguration, it was difficult to know how clean the city would remain in the coming days.",
                },
                {
                    type: "h2",
                    text: "Waterlogging Created Unhygienic Conditions",
                },
                {
                    type: "p",
                    text: "Waterlogging had created difficult conditions on almost all major roads and residential streets within the Municipal Council area. People were facing difficulties travelling on foot or by vehicle. The foul smell coming from stagnant water also increased concerns about the spread of diseases.",
                },
                {
                    type: "p",
                    text: "According to the newspaper report, the Municipal Council was also not carrying out the spraying of bleaching powder and DDT. Residents therefore continued to face problems caused by stagnant water and poor sanitation.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "सहरसा शहर के सभी 40 वार्डों में नियमित सफाई सुनिश्चित करना, गली-मोहल्लों को स्वच्छ रखना और जलजमाव एवं गंदगी की समस्याओं का समाधान करना।",
            },
        },
    },

    {
        slug: "purnia-city-cleaning-campaign-through-ngo",
        category: {
            hi: "नगर विकास",
            en: "Urban Development",
        },
        subcategory: {
            hi: "स्वच्छता एवं सफाई अभियान",
            en: "Sanitation & Cleanliness Campaign",
        },
        title: {
            hi: "एनजीओ के माध्यम से शहर की सफाई का अभियान शुरू",
            en: "Citywide Cleaning Campaign Launched Through NGO",
        },
        subtitle: {
            hi: "पूर्णिया शहर को स्वच्छ बनाने के लिए पटना की संस्था को सौंपी गई सफाई की जिम्मेदारी, अभियान में सात सफाईकर्मी करेंगे काम।",
            en: "A Patna-based organization was assigned responsibility for cleaning Purnia city, with seven sanitation workers deployed for the campaign.",
        },
        summary: {
            hi: "3 फरवरी 2007 को प्रकाशित हिन्दुस्तान की रिपोर्ट के अनुसार, पूर्णिया शहर में एनजीओ के माध्यम से सफाई अभियान की शुरुआत की गई। नगर परिषद अध्यक्ष सैयद शाहिद रजा ने अभियान का उद्घाटन किया। शहर की सफाई का जिम्मा जिला जनस्वास्थ्य व सर्वांगीण विकास केंद्र, पटना की शाखा को सौंपा गया, जिसके तहत सात सफाईकर्मी काम करेंगे। कार्यपालक पदाधिकारी शकील हुसैन ने संस्था को आवश्यक संसाधन उपलब्ध कराने का आश्वासन दिया। शहरवासियों से सफाई व्यवस्था की निगरानी करने की अपील भी की गई।",
            en: "According to a Hindustan newspaper report dated 3 February 2007, a citywide cleanliness campaign was launched in Purnia through an NGO. Municipal Council Chairman Syed Shahid Raza inaugurated the campaign. The responsibility for city cleaning was assigned to a branch of the District Public Health and Comprehensive Development Centre, Patna, with seven sanitation workers. Executive Officer Shakeel Hussain assured the organization of the necessary resources and residents were encouraged to monitor the cleanliness drive.",
        },
        metaDescription:
            "A cleanliness campaign was launched in Purnia in February 2007 through an NGO, with seven sanitation workers assigned to improve the city's cleanliness.",
        keywords: [
            "Purnia cleanliness campaign",
            "Purnia city cleaning",
            "NGO sanitation campaign",
            "urban cleanliness Bihar",
            "Municipal Council Purnia",
            "sanitation workers",
            "public health",
            "Purnia Bihar",
            "पूर्णिया सफाई अभियान",
            "एनजीओ के माध्यम से सफाई",
            "नगर परिषद पूर्णिया",
            "स्वच्छता अभियान",
            "सात सफाईकर्मी",
            "शहरी विकास",
            "जनस्वास्थ्य",
        ],
        image: "/news/new4.webp",
        imageAlt: {
            hi: "पूर्णिया शहर में एनजीओ के माध्यम से शुरू किए गए सफाई अभियान का उद्घाटन",
            en: "Inauguration of the NGO-led city cleaning campaign in Purnia",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "पूर्णिया शहर को स्वच्छ एवं रमणीक बनाने के उद्देश्य से सफाई अभियान की शुरुआत की गई। नगर परिषद अध्यक्ष सैयद शाहिद रजा ने अभियान का उद्घाटन करते हुए दावा किया कि अब पूर्णिया शहर महज दो पखवाड़ों के अंदर स्वच्छ एवं सुंदर स्थान में तब्दील हो जाएगा और कूड़ा-कचरा दूर किया जाएगा।",
                },
                {
                    type: "p",
                    text: "शहर की सफाई का जिम्मा जिला जनस्वास्थ्य व सर्वांगीण विकास केंद्र, पटना की शाखा को दिया गया है। इस अभियान में सात सफाईकर्मी काम करेंगे। इससे शहर में सफाईकर्मियों की कमी महसूस नहीं होगी और सफाई का काम लगातार चलता रहेगा।",
                },
                {
                    type: "h2",
                    text: "एनजीओ को उपलब्ध कराए जाएंगे आवश्यक संसाधन",
                },
                {
                    type: "p",
                    text: "मौके पर उपस्थित कार्यपालक पदाधिकारी शकील हुसैन ने एनजीओ को आवश्यक संसाधन उपलब्ध कराने की प्रतिबद्धता जताई। उन्होंने शहर के सौंदर्यीकरण की शुरुआत के इस अवसर पर शहरवासियों से भी सफाई व्यवस्था पर कड़ी निगरानी रखने का आह्वान किया।",
                },
                {
                    type: "h2",
                    text: "कार्यक्रम में कई गणमान्य लोग रहे मौजूद",
                },
                {
                    type: "p",
                    text: "इस कार्यक्रम में वार्ड आयुक्त रीना मालाकार, सरिता राय, तेजनारायण राम उर्फ बाबाजी, सुरेश यादव और बैश खान सहित अन्य लोग मौजूद थे।",
                },
                {
                    type: "h2",
                    text: "बच्चों का नामांकन कराया",
                },
                {
                    type: "p",
                    text: "इसी समाचार पत्र में प्रकाशित एक अन्य खबर के अनुसार, सहायक खजांची थाना के थानेदार वैदिक पाठक ने दुकानों और होटलों से चार बच्चों की तलाश कर उनका स्कूल में नामांकन कराया। इन बच्चों के नाम पप्पू शर्मा, पवन कुमार, सुल्तान और काजिम हुसैन बताए गए हैं। रिपोर्ट के अनुसार, पुलिस यह कार्य सरकार के आदेश पर कर रही थी।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "A cleanliness campaign was launched with the aim of making Purnia city clean and attractive. While inaugurating the campaign, Municipal Council Chairman Syed Shahid Raza stated that the city would be transformed into a clean and beautiful place within two fortnights, with garbage and waste being cleared.",
                },
                {
                    type: "p",
                    text: "The responsibility for city cleaning was assigned to a branch of the District Public Health and Comprehensive Development Centre, Patna. Seven sanitation workers would participate in the campaign. The initiative was expected to ensure continuous cleaning and address the shortage of sanitation workers in the city.",
                },
                {
                    type: "h2",
                    text: "NGO Promised Necessary Resources",
                },
                {
                    type: "p",
                    text: "Executive Officer Shakeel Hussain, who was present at the event, assured the NGO that the necessary resources would be provided. He also appealed to city residents to closely monitor the cleanliness arrangements as the city beautification initiative began.",
                },
                {
                    type: "h2",
                    text: "Several Dignitaries Attended the Programme",
                },
                {
                    type: "p",
                    text: "The programme was attended by Ward Commissioners Reena Malakar, Sarita Rai, Tejnarayan Ram alias Babaji, Suresh Yadav and Baish Khan, among others.",
                },
                {
                    type: "h2",
                    text: "School Enrolment Arranged for Children",
                },
                {
                    type: "p",
                    text: "A separate report in the same newspaper stated that Vaidik Pathak, the officer-in-charge of Sahayak Khajanchi Police Station, located four children from shops and hotels and arranged their school enrolment. The children were identified as Pappu Sharma, Pawan Kumar, Sultan and Kazim Hussain. According to the report, the police were carrying out this work under government instructions.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "एनजीओ के सहयोग से पूर्णिया शहर में नियमित सफाई व्यवस्था स्थापित करना, कूड़ा-कचरा हटाना और शहर को स्वच्छ एवं सुंदर बनाना।",
            },
        },
    },

    {
        slug: "saharsa-city-cleaning-responsibility-ngos",
        category: {
            hi: "नगर विकास",
            en: "Urban Development",
        },
        subcategory: {
            hi: "स्वच्छता एवं सफाई व्यवस्था",
            en: "Sanitation & Cleaning Management",
        },
        title: {
            hi: "शहर की सफाई एनजीओ के हवाले",
            en: "City Cleaning Responsibility Handed Over to NGOs",
        },
        subtitle: {
            hi: "सहरसा के 40 वार्डों की सफाई के लिए दो एनजीओ को जिम्मेदारी सौंपी गई, 20 वार्डों का जिम्मा बांका की जीवन ज्योति संस्थान और शेष 20 वार्डों का जिम्मा पटना के शिवम केंद्र को दिया गया।",
            en: "Two NGOs assigned sanitation responsibilities across Saharsa's 40 wards, with Jeevan Jyoti Sansthan of Banka and Shivam Centre of Patna handling 20 wards each.",
        },
        summary: {
            hi: "21 सितंबर 2016 की समाचार रिपोर्ट के अनुसार, सहरसा शहर के सभी 40 वार्डों की सफाई एनजीओ के माध्यम से कराई जाएगी। पहले 20 वार्डों की जिम्मेदारी जीवन ज्योति संस्थान, बांका को सौंपी जा चुकी थी। शेष 20 वार्डों की सफाई का जिम्मा शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र, पटना को सौंपने पर सहमति बन गई थी। नगर परिषद के कार्यपालक पदाधिकारी दिनेश राम ने इसकी जानकारी दी।",
            en: "According to a newspaper report dated 21 September 2016, sanitation across all 40 wards of Saharsa city was to be managed through NGOs. Jeevan Jyoti Sansthan of Banka had already been assigned responsibility for 20 wards, while an agreement had been reached to assign the remaining 20 wards to Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra of Patna. Executive Officer Dinesh Ram of the Municipal Council provided the information.",
        },
        metaDescription:
            "Saharsa Municipal Council assigned cleaning responsibilities across 40 wards to Jeevan Jyoti Sansthan, Banka, and Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra, Patna, in September 2016.",
        keywords: [
            "Saharsa city cleaning",
            "Saharsa sanitation",
            "Jeevan Jyoti Sansthan",
            "Shivam Jan Swasthya",
            "NGO cleaning campaign",
            "Municipal Council Saharsa",
            "40 wards sanitation",
            "Banka NGO",
            "Patna NGO",
            "सहरसा शहर की सफाई",
            "एनजीओ सफाई अभियान",
            "जीवन ज्योति संस्थान",
            "शिवम जन स्वास्थ्य",
            "नगर परिषद सहरसा",
            "40 वार्डों की सफाई",
            "स्वच्छता व्यवस्था",
            "बांका",
            "पटना",
        ],
        image: "/news/new5.webp",
        imageAlt: {
            hi: "सहरसा शहर के 40 वार्डों की सफाई की जिम्मेदारी एनजीओ को सौंपने संबंधी समाचार",
            en: "Newspaper report about NGOs receiving cleaning responsibilities for all 40 wards of Saharsa",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "शहर के सभी वार्डों की सफाई एनजीओ द्वारा की जाएगी। सहरसा शहर के 20 वार्डों की जिम्मेदारी पहले ही जीवन ज्योति संस्थान, बांका को सौंपी जा चुकी है। वहीं, शेष 20 वार्डों की सफाई का जिम्मा शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र, पटना को सौंपा जा रहा है।",
                },
                {
                    type: "h2",
                    text: "40 वार्डों की सफाई के लिए दो एनजीओ",
                },
                {
                    type: "p",
                    text: "नगर परिषद के कार्यपालक पदाधिकारी दिनेश राम ने बताया कि शहर के 20 वार्डों की जिम्मेदारी पहले ही सौंपी जा चुकी है। शेष 20 वार्डों की जिम्मेदारी पटना के एनजीओ को सौंपने पर सहमति बन चुकी है।",
                },
                {
                    type: "h2",
                    text: "दो संस्थाओं को मिली सफाई की जिम्मेदारी",
                },
                {
                    type: "ul",
                    items: [
                        "पहले 20 वार्ड: जीवन ज्योति संस्थान, बांका।",
                        "शेष 20 वार्ड: शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र, पटना।",
                    ],
                },
                {
                    type: "p",
                    text: "इस व्यवस्था के तहत सहरसा शहर के सभी 40 वार्डों में सफाई का कार्य एनजीओ के माध्यम से कराया जाना था।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "Cleaning across all wards of Saharsa city was to be carried out through NGOs. Jeevan Jyoti Sansthan of Banka had already been assigned responsibility for 20 wards. The responsibility for cleaning the remaining 20 wards was being assigned to Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra of Patna.",
                },
                {
                    type: "h2",
                    text: "Two NGOs for 40 City Wards",
                },
                {
                    type: "p",
                    text: "Municipal Council Executive Officer Dinesh Ram stated that responsibility for 20 wards had already been assigned. An agreement had also been reached to hand over responsibility for the remaining 20 wards to the NGO from Patna.",
                },
                {
                    type: "h2",
                    text: "Cleaning Responsibilities Assigned to Two Organizations",
                },
                {
                    type: "ul",
                    items: [
                        "First 20 wards: Jeevan Jyoti Sansthan, Banka.",
                        "Remaining 20 wards: Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra, Patna.",
                    ],
                },
                {
                    type: "p",
                    text: "Under this arrangement, sanitation work across all 40 wards of Saharsa city was to be carried out through these two NGOs.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "सहरसा शहर के सभी 40 वार्डों में एनजीओ के माध्यम से सफाई व्यवस्था सुनिश्चित करना और शहर की स्वच्छता को बेहतर बनाना।",
            },
        },
    },

    {
        slug: "shivam-ngo-purnia-city-cleaning-campaign",
        category: {
            hi: "नगर विकास",
            en: "Urban Development",
        },
        subcategory: {
            hi: "स्वच्छता एवं सफाई अभियान",
            en: "Sanitation & Cleanliness Campaign",
        },
        title: {
            hi: "शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र",
            en: "Shivam Public Health and Comprehensive Development Centre",
        },
        subtitle: {
            hi: "पूर्णिया नगर परिषद द्वारा शिवम केंद्र को शहर की सफाई की जिम्मेदारी सौंपे जाने के बाद गुलाबबाग, भट्ठा बाजार सहित कई मोहल्लों में नियमित सफाई अभियान शुरू।",
            en: "Following the assignment of city cleaning responsibilities to Shivam Centre by Purnia Municipal Council, regular sanitation activities began in Gulabbagh, Bhatta Bazar and other localities.",
        },
        summary: {
            hi: "6 फरवरी 2007 को प्रकाशित आज समाचार पत्र की रिपोर्ट के अनुसार, पूर्णिया नगर परिषद ने शहर की साफ-सफाई की जिम्मेदारी शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र को सौंपी थी। संस्था के अध्यक्ष रंजन कुमार के मार्गदर्शन में कर्मचारियों ने गुलाबबाग, भट्ठा बाजार सहित विभिन्न व्यावसायिक क्षेत्रों और मोहल्लों में नियमित सफाई अभियान शुरू किया। अभियान के शुरुआती परिणामों से स्थानीय निवासी संतुष्ट और आशान्वित दिखाई दिए।",
            en: "According to a report published in Aaj newspaper on 6 February 2007, Purnia Municipal Council assigned city sanitation responsibilities to Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra. Under the guidance of its chairman, Ranjan Kumar, the organization's employees started regular cleaning activities in commercial areas such as Gulabbagh and Bhatta Bazar, as well as other localities. Residents expressed satisfaction and optimism about the initial results of the campaign.",
        },
        metaDescription:
            "Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra started a regular city cleaning campaign in Purnia in February 2007, covering Gulabbagh, Bhatta Bazar and other localities.",
        keywords: [
            "Shivam NGO",
            "Shivam Jan Swasthya",
            "Purnia cleaning campaign",
            "Purnia sanitation",
            "Gulabbagh cleaning",
            "Bhatta Bazar",
            "Municipal Council Purnia",
            "Ranjan Kumar",
            "urban development Bihar",
            "NGO sanitation work",
            "शिवम जन स्वास्थ्य केंद्र",
            "पूर्णिया सफाई अभियान",
            "गुलाबबाग सफाई",
            "भट्ठा बाजार",
            "नगर परिषद पूर्णिया",
            "रंजन कुमार",
            "स्वच्छता अभियान",
            "शहरी विकास",
        ],
        image: "/news/new6.webp",
        imageAlt: {
            hi: "पूर्णिया शहर में शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र द्वारा चलाए गए सफाई अभियान का समाचार",
            en: "Newspaper report about the city cleaning campaign conducted by Shivam Centre in Purnia",
        },
        body: {
            hi: [
                {
                    type: "p",
                    text: "पूर्णिया शहर में एनजीओ को सफाई की जिम्मेदारी दिए जाने के बाद विभिन्न मोहल्लों में नियमित सफाई दिखाई देने लगी है। नगर परिषद द्वारा शहर की सफाई का जिम्मा शिवम जन स्वास्थ्य एवं सर्वांगीण विकास केंद्र को सौंपा गया है।",
                },
                {
                    type: "h2",
                    text: "अध्यक्ष रंजन कुमार के मार्गदर्शन में अभियान",
                },
                {
                    type: "p",
                    text: "संस्था के अध्यक्ष रंजन कुमार के कुशल दिशा-निर्देश में कर्मचारियों द्वारा शहर में सफाई अभियान शुरू किया गया। संस्था की टीम गुलाबबाग, भट्ठा बाजार सहित शहर के अन्य व्यावसायिक क्षेत्रों और मोहल्लों में रोजाना सफाई का काम कर रही है।",
                },
                {
                    type: "h2",
                    text: "सफाई अभियान के सकारात्मक परिणाम",
                },
                {
                    type: "p",
                    text: "संस्था द्वारा चलाए जा रहे सफाई अभियान का सकारात्मक परिणाम दिखाई देने लगा है। स्थानीय लोग अभियान को देखकर आशान्वित हैं। इस कार्य से नगर परिषद के प्रति लोगों की सोच में भी सकारात्मक बदलाव देखने को मिल रहा है।",
                },
                {
                    type: "h2",
                    text: "स्थानीय नागरिकों में संतुष्टि",
                },
                {
                    type: "p",
                    text: "स्थानीय मोहल्लावासी सफाई अभियान से खुश हैं। लोगों का विश्वास है कि संस्था जिस तरह से नियमित रूप से काम कर रही है, उससे शहर को गंदगी से छुटकारा मिलेगा और शहर का स्वरूप अधिक सुंदर बनेगा।",
                },
                {
                    type: "h2",
                    text: "नगर परिषद की सफाई व्यवस्था में सहयोग",
                },
                {
                    type: "p",
                    text: "समाचार रिपोर्ट में संस्था के कर्मचारियों के समर्पण और मुस्तैदी की सराहना की गई है। संस्था के शुरुआती पांच दिनों के काम से शहरवासियों में सफाई व्यवस्था को लेकर सकारात्मक प्रतिक्रिया देखने को मिली।",
                },
            ],
            en: [
                {
                    type: "p",
                    text: "Following the assignment of sanitation responsibilities to an NGO, regular cleaning activities became visible in several localities of Purnia. The Municipal Council entrusted the city's cleaning responsibilities to Shivam Jan Swasthya Evam Sarvangeen Vikas Kendra.",
                },
                {
                    type: "h2",
                    text: "Campaign Under the Guidance of Chairman Ranjan Kumar",
                },
                {
                    type: "p",
                    text: "Under the guidance of the organization's chairman, Ranjan Kumar, employees began a citywide cleaning campaign. The team carried out daily cleaning activities in commercial areas such as Gulabbagh and Bhatta Bazar, along with other localities.",
                },
                {
                    type: "h2",
                    text: "Positive Results of the Cleaning Campaign",
                },
                {
                    type: "p",
                    text: "Positive results from the organization's cleaning campaign started becoming visible. Local residents expressed optimism after observing the work. The initiative also began changing public perceptions of the Municipal Council in a positive way.",
                },
                {
                    type: "h2",
                    text: "Local Residents Express Satisfaction",
                },
                {
                    type: "p",
                    text: "Residents of different localities expressed satisfaction with the cleaning campaign. They believed that the organization's regular efforts would help eliminate unclean conditions and make the city more attractive.",
                },
                {
                    type: "h2",
                    text: "Support for Municipal Cleaning Arrangements",
                },
                {
                    type: "p",
                    text: "The newspaper report appreciated the dedication and commitment of the organization's employees. The initial five days of work reportedly generated positive responses from residents regarding the city's sanitation arrangements.",
                },
            ],
        },
        closing: {
            hi: {
                label: "मुख्य उद्देश्य",
                text: "एनजीओ के माध्यम से पूर्णिया शहर के विभिन्न मोहल्लों और व्यावसायिक क्षेत्रों में नियमित सफाई सुनिश्चित करना तथा शहर को स्वच्छ एवं सुंदर बनाना।",
            },
        },
    },


];

export function getNewsItem(slug: string): NewsItem | undefined {
    return NEWS_ITEMS.find((n) => n.slug === slug);
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/** Human-readable date, or null when the date is missing or invalid (so nothing is shown). */
export function formatNewsDate(date?: string): string | null {
    if (!date) return null;
    const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date.trim());
    if (!m) return null;
    const year = m[1];
    const month = m[2] ? Number(m[2]) : null;
    const day = m[3] ? Number(m[3]) : null;
    if (month !== null && (month < 1 || month > 12)) return null;
    if (day !== null && (day < 1 || day > 31)) return null;
    if (month === null) return year;
    if (day === null) return `${MONTHS[month - 1]} ${year}`;
    return `${day} ${MONTHS[month - 1]} ${year}`;
}
