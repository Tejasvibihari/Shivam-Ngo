/**
 * Single source of truth for the individual activity pages.
 * Used by: /activities/[slug] pages, the "All Activities" overview (Read more links)
 * and the Activities dropdown in the navbar.
 * To add a new activity: add one object to ACTIVITIES (the page, card, menu link and SEO tags follow).
 */

export type ActivityIconKey =
    | "droplet"
    | "sparkles"
    | "home"
    | "tools"
    | "book"
    | "heartbeat"
    | "users";

export type ActivityBlock = { heading: string; paragraphs: string[] };

export type Activity = {
    slug: string;
    /** label in the Activities dropdown */
    navLabel: string;
    /** short name used in cards, breadcrumbs and "related" links */
    shortTitle: string;
    /** page <h1> */
    title: string;
    tagline: string;
    icon: ActivityIconKey;
    image: { src: string; alt: string };
    meta: { title: string; description: string; keywords: string[] };
    /** card text on the All Activities page */
    summary: string;
    highlights: string[];
    introHeading: string;
    intro: string[];
    /** extra context for readers and search engines */
    whyHeading: string;
    why: string[];
    /** narrative blocks shown before the numbered list */
    before?: ActivityBlock[];
    itemsHeading: string;
    itemsIntro?: string;
    items: { title: string; text: string }[];
    /** narrative blocks shown after the numbered list */
    after?: ActivityBlock[];
    support?: { heading: string; intro: string; items: string[] };
    commitment: string[];
    closing: { label: string; text: string };
    faqs: { q: string; a: string }[];
};

export const ACTIVITIES: Activity[] = [
    /* ------------------------------ SANITATION ------------------------------ */
    {
        slug: "sanitation",
        navLabel: "Sanitation",
        shortTitle: "Sanitation",
        title: "Sanitation",
        tagline: "Towards a Cleaner, Healthier and Sanitation-Friendly Society",
        icon: "droplet",
        image: { src: "/activities/sanitation.jpg", alt: "Sanitation awareness work in the community" },
        meta: {
            title: "Sanitation Awareness & FSSM in Patna, Bihar",
            description:
                "Sanitation awareness, hygiene education, faecal sludge and septage management (FSSM) and safe wastewater practices for healthier communities in Patna, Bihar.",
            keywords: [
                "sanitation in Patna",
                "sanitation awareness Bihar",
                "faecal sludge and septage management",
                "FSSM",
                "safe wastewater management",
                "hygiene education",
                "sanitation workers safety",
                "Swachh Bharat",
            ],
        },
        summary:
            "Safe sanitation is a pillar of public health. We promote hygiene education, safe management of human waste and community participation for cleaner, healthier neighbourhoods.",
        highlights: [
            "Hygiene and sanitation awareness",
            "Safe faecal sludge and wastewater management",
            "Community participation and dignity for sanitation workers",
        ],
        introHeading: "Sanitation for a healthy society",
        intro: [
            "Sanitation is one of the fundamental pillars of public health, environmental protection and sustainable community development. Access to safe sanitation facilities is essential for maintaining human dignity, preventing diseases and ensuring a healthy living environment. Despite significant progress in improving sanitation infrastructure across India, several challenges remain, particularly in rural communities, urban settlements and economically disadvantaged areas.",
            "The Swachh Bharat Mission has played an important role in expanding access to household and community toilets and promoting cleanliness across the country. However, achieving sustainable sanitation requires more than the construction of toilets. It also requires effective systems for the safe collection, transportation, treatment and disposal of human waste.",
            "Inadequate sewage management, untreated wastewater, improper disposal of faecal sludge and insufficient sanitation infrastructure can create serious risks to public health and the environment. These challenges particularly affect vulnerable communities living in underserved areas, where access to proper sanitation services and awareness remains limited.",
        ],
        whyHeading: "Why sanitation matters",
        why: [
            "Poor sanitation is closely linked to water-borne illnesses, malnutrition and lost school and work days, and it falls hardest on children, women and the elderly. Clean toilets, safe water and good hygiene habits protect families at home, and safe waste management protects the rivers, ponds and groundwater that whole communities depend on.",
            "Lasting change in cities such as Patna and in villages across Bihar needs more than buildings. It needs informed families, responsible local institutions and respect for the people who keep our surroundings clean.",
        ],
        before: [
            {
                heading: "Our Approach Towards Sanitation",
                paragraphs: [
                    "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra recognizes sanitation as an essential component of public welfare and community development. We aim to promote improved sanitation practices through public awareness, community participation, hygiene education and collaboration with relevant government departments, local authorities and other stakeholders.",
                    "Our approach emphasizes the entire sanitation value chain, from access to toilet facilities and safe containment of human waste to its collection, transportation, treatment and environmentally responsible disposal.",
                    "We also recognize the importance of Faecal Sludge and Septage Management (FSSM), which provides decentralized solutions for managing human waste, particularly in areas where conventional sewerage systems are unavailable or inadequate.",
                ],
            },
        ],
        itemsHeading: "Our Key Focus Areas",
        items: [
            {
                title: "Improved Sanitation Awareness",
                text: "Promoting awareness about personal hygiene, household sanitation, cleanliness and the importance of safe sanitation practices.",
            },
            {
                title: "Faecal Sludge and Septage Management (FSSM)",
                text: "Encouraging awareness and appropriate practices for the safe containment, collection, transportation, treatment and disposal of faecal sludge and septage.",
            },
            {
                title: "Safe Wastewater Management",
                text: "Promoting responsible wastewater management and awareness about preventing the contamination of rivers, ponds, groundwater and other natural resources.",
            },
            {
                title: "Community Participation",
                text: "Encouraging citizens, community groups and local institutions to participate in sanitation programmes, cleanliness campaigns and community development initiatives.",
            },
            {
                title: "Sanitation Workers' Safety and Dignity",
                text: "Supporting awareness regarding occupational safety, protective equipment, health and the dignity of sanitation workers who play an essential role in maintaining public hygiene.",
            },
            {
                title: "Urban and Rural Sanitation Development",
                text: "Promoting inclusive sanitation practices and encouraging improved access to sanitation facilities and services in rural areas, urban settlements and underserved communities.",
            },
        ],
        after: [
            {
                heading: "Towards Sustainable Sanitation",
                paragraphs: [
                    "Achieving sustainable sanitation requires coordinated efforts from government authorities, local institutions, civil society organizations, technical experts and citizens. Proper planning, effective resource utilization, public awareness and community participation are essential for developing reliable sanitation systems.",
                    "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to contribute towards these efforts by promoting sanitation awareness, encouraging responsible waste management practices and supporting development initiatives that improve public health and environmental sustainability.",
                ],
            },
        ],
        commitment: [
            "We believe every person has the right to a clean, safe and dignified living environment, and we work with communities and institutions to make that a reality.",
        ],
        closing: {
            label: "Our Commitment",
            text: "A cleaner environment, safer sanitation practices, healthier communities and dignity for every individual.",
        },
        faqs: [
            {
                q: "What is Faecal Sludge and Septage Management (FSSM)?",
                a: "FSSM covers the safe containment, collection, transportation, treatment and disposal of the waste stored in septic tanks and pits. It is especially important where there is no sewerage network, because it keeps untreated waste out of water sources and public spaces.",
            },
            {
                q: "Does sanitation only mean building toilets?",
                a: "No. Toilets are the first step. Sustainable sanitation also needs hygiene habits, safe emptying and treatment of waste, responsible wastewater management and safe working conditions for sanitation workers.",
            },
            {
                q: "How can I support sanitation work in my community?",
                a: "You can volunteer with us, support our work through the Donate section, or contact us to discuss a sanitation awareness programme for your neighbourhood, school or institution.",
            },
        ],
    },

    /* --------------------------- HOUSEKEEPING SERVICES --------------------------- */
    {
        slug: "housekeeping-services",
        navLabel: "House Keeping",
        shortTitle: "Housekeeping Services",
        title: "Housekeeping Services",
        tagline: "Clean Spaces. Healthy Communities. Better Living Environments.",
        icon: "sparkles",
        image: { src: "/activities/cleanliness.jpg", alt: "Housekeeping and cleaning services" },
        meta: {
            title: "Housekeeping & Facility Management Services in Patna",
            description:
                "Professional housekeeping, institutional cleaning and facility maintenance support with trained personnel for offices, schools, hospitals and public spaces in Patna, Bihar.",
            keywords: [
                "housekeeping services Patna",
                "facility management Bihar",
                "institutional cleaning",
                "hospital housekeeping",
                "office cleaning services",
                "trained housekeeping staff",
                "sanitation workers livelihood",
            ],
        },
        summary:
            "Clean, well-maintained spaces protect health. We support housekeeping and facility upkeep through trained personnel and systematic, responsible cleaning practices.",
        highlights: [
            "Cleaning and upkeep of offices, institutions and public spaces",
            "Waste segregation awareness and responsible disposal",
            "Trained personnel and dignified livelihoods for workers",
        ],
        introHeading: "Housekeeping and facility management",
        intro: [
            "Cleanliness and proper maintenance of public and institutional spaces are essential for maintaining hygiene, preventing the spread of infections and ensuring a safe and healthy environment.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra recognizes the importance of professional housekeeping and sanitation services in public welfare, institutional management and environmental health.",
            "The organization aims to support cleanliness and maintenance initiatives through trained personnel, systematic cleaning practices and responsible sanitation management. These services may be undertaken in collaboration with government departments, educational institutions, healthcare facilities, corporate organizations and other public and private sector establishments.",
        ],
        whyHeading: "Why professional housekeeping matters",
        why: [
            "In schools, hospitals, offices and public buildings, regular and systematic cleaning reduces the spread of infections, keeps premises safe and creates a more comfortable environment for everyone who uses them. Well-maintained facilities also last longer and work better.",
            "Behind every clean building is a team of workers. Training, safety awareness and fair, dignified working conditions improve the quality of service and the lives of the people who provide it.",
        ],
        itemsHeading: "Our Services",
        items: [
            {
                title: "General Housekeeping and Cleaning",
                text: "Daily cleaning and maintenance of offices, buildings, institutions, common areas and other facilities to maintain proper hygiene and cleanliness.",
            },
            {
                title: "Manual and Mechanized Cleaning",
                text: "Promoting the use of appropriate manual cleaning methods and mechanized equipment for effective cleaning and maintenance.",
            },
            {
                title: "Institutional Cleaning Services",
                text: "Housekeeping support for educational institutions, hospitals, healthcare facilities, government establishments and other institutional premises.",
            },
            {
                title: "Sanitation and Hygiene Management",
                text: "Maintaining hygienic surroundings through proper cleaning practices, waste segregation awareness and responsible disposal procedures.",
            },
            {
                title: "Facility Maintenance Support",
                text: "Supporting routine cleanliness, upkeep and maintenance activities to ensure well-maintained and functional premises.",
            },
            {
                title: "Trained Housekeeping Personnel",
                text: "Encouraging skill development, workplace discipline, safety awareness and professional standards among housekeeping and sanitation personnel.",
            },
        ],
        commitment: [
            "We believe that cleanliness is not merely a maintenance activity but an essential part of public health and community well-being.",
            "Through responsible service delivery, trained manpower and coordinated efforts with relevant institutions, Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to contribute towards cleaner workplaces, healthier institutions and safer public environments.",
        ],
        closing: {
            label: "Our Goal",
            text: "To promote cleanliness, hygiene and quality maintenance services while creating dignified livelihood opportunities for housekeeping and sanitation workers.",
        },
        faqs: [
            {
                q: "What kinds of premises can housekeeping services support?",
                a: "Services can support offices, buildings, educational institutions, hospitals and healthcare facilities, government establishments and other institutional or public premises.",
            },
            {
                q: "Do you use trained personnel?",
                a: "Yes. We encourage skill development, workplace discipline, safety awareness and professional standards among housekeeping and sanitation personnel.",
            },
            {
                q: "How can my institution enquire about housekeeping services?",
                a: "Please reach out through our Contact page with your premises, location and requirements, and our team will get back to you to discuss how we can help.",
            },
        ],
    },

    /* ------------------------ SHAUCHALAYA NIRMAN, GHAR KA SAMMAN ------------------------ */
    {
        slug: "shauchalaya-nirman-ghar-ka-samman",
        navLabel: "Shauchalaya Nirman",
        shortTitle: "Shauchalaya Nirman",
        title: "Shauchalaya Nirman, Ghar Ka Samman",
        tagline: "Building Toilets. Protecting Dignity. Promoting Health.",
        icon: "home",
        image: { src: "/activities/shauchalaya.jpg", alt: "Household toilet construction in a village" },
        meta: {
            title: "Shauchalaya Nirman, Ghar Ka Samman | Household Toilets in Bihar",
            description:
                "Support for household toilet construction, rural sanitation and hygiene awareness in Bihar under the Shauchalaya Nirman, Ghar Ka Samman initiative.",
            keywords: [
                "Shauchalaya Nirman Ghar Ka Samman",
                "household toilet construction Bihar",
                "rural sanitation Bihar",
                "toilet for every home",
                "hygiene awareness",
                "women's dignity and sanitation",
            ],
        },
        summary:
            "A toilet at home protects health, safety and dignity. We support household toilet construction and hygiene awareness, especially for economically weaker and underserved families.",
        highlights: [
            "Support for household toilet construction",
            "Hygiene and toilet-usage awareness for families",
            "Protecting women's dignity and family health",
        ],
        introHeading: "Household toilet construction and rural sanitation",
        intro: [
            "Access to safe and hygienic sanitation facilities is a basic necessity for every household. Proper sanitation plays a vital role in protecting public health, maintaining personal dignity, preventing diseases and improving the overall quality of life, particularly in rural and underserved communities.",
            "The Government of Bihar has undertaken various initiatives to improve household sanitation and access to essential facilities. The Shauchalaya Nirman, Ghar Ka Samman initiative, associated with the state's development agenda, reflects the importance of providing household toilet facilities and encouraging better sanitation practices.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra recognizes household sanitation as an important component of rural development and community welfare. The organization aims to support efforts towards improving sanitation infrastructure by encouraging toilet construction, creating awareness about hygiene and promoting the adoption of safe sanitation practices.",
        ],
        whyHeading: "Why a toilet at home matters",
        why: [
            "A household toilet means families no longer depend on open spaces. It reduces the spread of disease, keeps children healthier and removes the risks and indignity faced by women and girls who must wait for darkness or travel long distances.",
            "A toilet only changes lives when it is built well, used regularly and kept clean. That is why construction support and hygiene awareness go hand in hand in our work.",
        ],
        itemsHeading: "Our Work Towards Rural Sanitation",
        itemsIntro:
            "Our focus is on supporting households, particularly those belonging to economically weaker and underserved communities, in improving access to proper toilet facilities. Our key activities include:",
        items: [
            {
                title: "Household Toilet Construction",
                text: "Supporting initiatives for the construction of individual household toilets to improve access to safe and hygienic sanitation facilities.",
            },
            {
                title: "Rural Sanitation Development",
                text: "Encouraging improved sanitation infrastructure in villages and underserved communities through community-oriented development activities.",
            },
            {
                title: "Hygiene and Sanitation Awareness",
                text: "Educating families about toilet usage, personal hygiene, cleanliness and the importance of maintaining sanitary surroundings.",
            },
            {
                title: "Community Participation",
                text: "Encouraging individuals, families and local communities to participate in sanitation initiatives and take collective responsibility for maintaining clean surroundings.",
            },
            {
                title: "Health and Dignity",
                text: "Promoting household sanitation as an essential measure for protecting women's dignity, improving family health and ensuring a safer living environment for all.",
            },
        ],
        commitment: [
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra believes that every household deserves access to a safe and hygienic toilet facility.",
            "Through sanitation awareness, community participation and development-oriented initiatives, we strive to contribute towards cleaner villages, healthier families and a more dignified standard of living.",
        ],
        closing: {
            label: "Our Vision",
            text: "Every home with a toilet, every family with dignity, and every community with a cleaner and healthier environment.",
        },
        faqs: [
            {
                q: "What is Shauchalaya Nirman, Ghar Ka Samman?",
                a: "It is an initiative associated with the Government of Bihar's development agenda that highlights the importance of household toilet facilities and better sanitation practices. We support these efforts through awareness and community participation.",
            },
            {
                q: "Who can benefit from household toilet support?",
                a: "Our focus is on households from economically weaker and underserved communities that need better access to proper toilet facilities. For eligibility under government schemes, please check with your local authorities or contact us for guidance.",
            },
            {
                q: "Why is hygiene awareness part of toilet construction?",
                a: "A toilet delivers its full health benefit only when it is used regularly and kept clean, and when family members follow good hygiene habits such as handwashing.",
            },
        ],
    },

    /* ------------------------------ VOCATIONAL TRAINING ------------------------------ */
    {
        slug: "vocational-training",
        navLabel: "Vocational Training",
        shortTitle: "Vocational Training",
        title: "Vocational Training",
        tagline: "Empowering People Through Skills, Knowledge and Opportunities",
        icon: "tools",
        image: { src: "/activities/vocational-training.jpg", alt: "Vocational training session for skill development" },
        meta: {
            title: "Vocational Training & Skill Development in Patna, Bihar",
            description:
                "Skill development and vocational training for youth and women in Patna, Bihar: employment-oriented skills, entrepreneurship guidance and awareness of government schemes.",
            keywords: [
                "vocational training Patna",
                "skill development Bihar",
                "women empowerment skills",
                "employment oriented training",
                "self-employment guidance",
                "skill development schemes",
                "livelihood training",
            ],
        },
        summary:
            "Skills create opportunities. We promote practical, employment-oriented training and entrepreneurship guidance so people can earn a secure and independent livelihood.",
        highlights: [
            "Technical and employment-oriented skills",
            "Livelihood training for women and youth",
            "Guidance on entrepreneurship and government schemes",
        ],
        introHeading: "Skill development and vocational training",
        intro: [
            "Vocational training plays an important role in building a skilled, capable and self-reliant society. It provides individuals with practical knowledge, technical skills and professional training required to pursue employment, self-employment and entrepreneurial opportunities.",
            "In a developing country like India, unemployment, poverty, limited access to education and lack of professional skills remain significant challenges, particularly among economically weaker sections, rural communities, women and unemployed youth.",
            "Recognizing these challenges, Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to promote skill development and vocational education as important tools for social and economic empowerment.",
            "Our objective is to help individuals acquire practical skills that match changing employment requirements and real-world opportunities. We believe that appropriate training, professional guidance and access to relevant information can enable people to improve their livelihoods and achieve financial independence.",
        ],
        whyHeading: "Why skills matter",
        why: [
            "A practical skill can be the difference between irregular daily work and a steady income. For young people, women and families in rural and urban settlements, training opens doors to jobs, small businesses and a greater say in household decisions.",
            "Skill development also strengthens whole communities: when more people earn, families can invest in better health, education and housing for the next generation.",
        ],
        before: [
            {
                heading: "Our Approach to Skill Development",
                paragraphs: [
                    "We focus on encouraging practical learning, developing professional competencies and creating awareness about available employment and self-employment opportunities.",
                ],
            },
        ],
        itemsHeading: "Our Key Focus Areas",
        items: [
            {
                title: "Technical and Vocational Skills",
                text: "Promoting practical training in various trades, technical occupations, crafts and other skill-based professions according to local needs and opportunities.",
            },
            {
                title: "Employment-Oriented Training",
                text: "Encouraging job-oriented learning and professional skill development to improve the employability of young people and other job seekers.",
            },
            {
                title: "Women Empowerment Through Skills",
                text: "Supporting women through vocational education, livelihood training and opportunities for self-employment and financial independence.",
            },
            {
                title: "Entrepreneurship and Self-Employment",
                text: "Encouraging entrepreneurial thinking, small-business development and income-generating activities through appropriate training and guidance.",
            },
            {
                title: "Awareness of Government Schemes",
                text: "Creating awareness about relevant government welfare, education, employment and skill development schemes. We also aim to guide eligible individuals regarding application procedures, required documentation and available benefits.",
            },
            {
                title: "Practical Learning and Professional Guidance",
                text: "Promoting hands-on training, guidance from qualified trainers and exposure to practical working environments wherever appropriate.",
            },
            {
                title: "Social and Economic Empowerment",
                text: "Addressing challenges such as poverty, social discrimination, inequality and limited access to opportunities by promoting education, awareness, skills and self-reliance.",
            },
        ],
        commitment: [
            "We believe that skills create opportunities and opportunities build stronger communities.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to contribute towards a skilled, educated and economically empowered society by encouraging vocational education, professional development and livelihood opportunities.",
            "Our efforts are directed towards helping individuals recognize their potential, develop useful skills, access available opportunities and move towards a more secure and independent future.",
        ],
        closing: {
            label: "Our Vision",
            text: "A skilled and self-reliant India where every individual has the knowledge, abilities and opportunities to build a better livelihood.",
        },
        faqs: [
            {
                q: "Who can benefit from vocational training?",
                a: "Our focus is on economically weaker sections, rural communities, women and unemployed youth, although anyone looking to learn a useful skill is welcome to get in touch.",
            },
            {
                q: "Do you help with government skill development schemes?",
                a: "We aim to create awareness about relevant government skill, employment and welfare schemes and to guide eligible individuals on application procedures, required documents and available benefits.",
            },
            {
                q: "Can vocational training lead to self-employment?",
                a: "Yes. Alongside practical skills, we encourage entrepreneurial thinking, small-business development and income-generating activities through training and guidance.",
            },
        ],
    },

    /* --------------------------------- EDUCATION --------------------------------- */
    {
        slug: "education",
        navLabel: "Education",
        shortTitle: "Education",
        title: "Education",
        tagline: "Educating Minds. Empowering Lives. Building a Better Future.",
        icon: "book",
        image: { src: "/activities/education.jpg", alt: "Children learning at an education awareness programme" },
        meta: {
            title: "Education for All: Literacy & Learning Programmes in Patna",
            description:
                "Education awareness, adult literacy, girls' education and digital literacy for underprivileged children and families in Patna, Bihar. Learn how we promote learning for all.",
            keywords: [
                "education programmes Patna",
                "adult literacy Bihar",
                "girls education awareness",
                "education for underprivileged children",
                "digital literacy",
                "scholarship scheme awareness",
                "community education",
            ],
        },
        summary:
            "Learning opens doors. We promote literacy, school participation and digital awareness so that children, women and adults can build a better future.",
        highlights: [
            "Basic education, literacy and adult learning",
            "Girls' and women's education",
            "Digital literacy and awareness of education schemes",
        ],
        introHeading: "Education for all",
        intro: [
            "Education is one of the most powerful instruments for transforming society, reducing poverty, promoting equality and creating opportunities for a better future. It empowers individuals with knowledge, develops critical thinking and enables people to make informed decisions about their lives and communities.",
            "Despite significant progress in the field of education, many children, women and adults across India continue to face challenges in accessing quality education. Poverty, social inequality, lack of educational infrastructure, limited resources and inadequate awareness often prevent individuals from receiving the education they deserve.",
            "Lack of basic literacy and learning opportunities can further restrict access to employment, healthcare information, government welfare schemes and social participation. Therefore, ensuring inclusive and equitable educational opportunities is essential for sustainable development.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra believes that education is not merely a means of acquiring qualifications but a foundation for personal growth, social empowerment and economic independence.",
        ],
        whyHeading: "Why education matters",
        why: [
            "Education improves health, income and decision-making across generations. A child who stays in school, a girl who completes her studies or an adult who learns to read can change the future of an entire family.",
            "In a fast-changing world, digital literacy and awareness of available scholarships and schemes are as important as the classroom itself, because they help people reach services and opportunities that were once out of their reach.",
        ],
        before: [
            {
                heading: "Our Approach Towards Education",
                paragraphs: [
                    "The organization aims to promote educational awareness, literacy and learning opportunities, particularly among children, women, economically weaker sections and disadvantaged communities. Our key focus areas include:",
                ],
            },
        ],
        itemsHeading: "Our Key Focus Areas",
        items: [
            {
                title: "Promotion of Basic Education",
                text: "Encouraging access to education and supporting initiatives that promote learning among children and individuals from underserved communities.",
            },
            {
                title: "Literacy and Adult Education",
                text: "Promoting basic reading, writing and numeracy skills among adults and individuals who have had limited access to formal education.",
            },
            {
                title: "Education for Underprivileged Children",
                text: "Encouraging educational opportunities for children belonging to economically weaker and socially disadvantaged families.",
            },
            {
                title: "Women and Girls' Education",
                text: "Promoting awareness about the importance of girls' education, women's literacy and equal educational opportunities.",
            },
            {
                title: "Digital Literacy and Awareness",
                text: "Encouraging digital awareness and basic technology skills to help individuals access information, educational resources and online public services.",
            },
            {
                title: "Educational Awareness Programmes",
                text: "Organizing and supporting awareness initiatives related to education, school participation, learning opportunities and the importance of continuing education.",
            },
            {
                title: "Government Educational Schemes Awareness",
                text: "Creating awareness about relevant government education schemes, scholarships and educational support programmes, while guiding eligible individuals regarding application procedures and available benefits.",
            },
            {
                title: "Community Participation in Education",
                text: "Encouraging parents, community members, educational institutions and other stakeholders to participate in promoting education and improving learning opportunities.",
            },
        ],
        commitment: [
            "We believe that every child deserves an opportunity to learn and every individual deserves the chance to improve their life through education.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to contribute towards an educated, aware and empowered society by promoting literacy, educational awareness and inclusive learning opportunities.",
            "Through community participation and development-oriented initiatives, we strive to make education more accessible and encourage individuals to become active contributors to society.",
        ],
        closing: {
            label: "Our Vision",
            text: "An educated and empowered society where knowledge is accessible to everyone, regardless of economic or social background.",
        },
        faqs: [
            {
                q: "Who are your education programmes for?",
                a: "Our focus is on children, women, adults with limited schooling and families from economically weaker and disadvantaged communities.",
            },
            {
                q: "Do you help families with scholarships and education schemes?",
                a: "We aim to create awareness about relevant government education schemes and scholarships and to guide eligible individuals on application procedures and available benefits.",
            },
            {
                q: "How can I contribute to education in my community?",
                a: "You can volunteer your time, support our work through the Donate section or contact us to discuss how parents, schools and local groups can work together to improve learning opportunities.",
            },
        ],
    },

    /* --------------------------------- HEALTH --------------------------------- */
    {
        slug: "health-programmes",
        navLabel: "Health",
        shortTitle: "Health Programmes",
        title: "Health Programmes",
        tagline: "Promoting Better Health. Spreading Awareness. Supporting Lives.",
        icon: "heartbeat",
        image: { src: "/activities/health-awareness.jpg", alt: "Community health awareness camp" },
        meta: {
            title: "Health Programmes & Community Health Awareness in Patna",
            description:
                "Preventive healthcare, health camps, maternal and child health, cancer support, eye care and cataract awareness for vulnerable communities in Patna, Bihar.",
            keywords: [
                "health awareness Patna",
                "community health programmes Bihar",
                "maternal and child health",
                "cancer patient support",
                "cataract awareness",
                "eye care awareness",
                "visually impaired support",
                "nutrition and preventive healthcare",
            ],
        },
        summary:
            "Good health is the foundation of a productive society. We promote preventive healthcare, health camps, maternal and child health, cancer support and eye care awareness.",
        highlights: [
            "Preventive healthcare and health awareness",
            "Maternal and child health and nutrition",
            "Cancer support, eye care and cataract awareness",
        ],
        introHeading: "Healthcare and community health development",
        intro: [
            "Good health is the foundation of a healthy and productive society. Access to healthcare, preventive medical services, health education and proper nutrition plays an essential role in improving the quality of life and overall well-being of individuals and communities.",
            "Despite progress in healthcare facilities and medical technology, many people across India, particularly those from economically weaker sections, rural communities and underserved urban settlements, continue to face difficulties in accessing affordable and appropriate healthcare services.",
            "Limited awareness, financial constraints, inadequate healthcare facilities, poor sanitation and lack of timely medical attention can increase the risk of preventable diseases and other health complications.",
            "Recognizing the importance of healthcare in social development, Shivam Jan Swasthya Evem Sarwangin Vikash Kendra considers public health and community well-being as important areas of its social welfare activities.",
            "The organization aims to promote preventive healthcare, health awareness, medical guidance and support for vulnerable individuals through community-based initiatives and cooperation with relevant healthcare institutions and professionals.",
        ],
        whyHeading: "Why preventive health awareness matters",
        why: [
            "Many serious health problems can be prevented, or treated far more effectively, when they are noticed early. Knowing about hygiene, nutrition, vaccination and regular check-ups helps families act before a small problem becomes an expensive emergency.",
            "Awareness also helps people find what already exists: public health programmes, nearby facilities and government welfare schemes that many eligible families never use simply because they do not know about them.",
        ],
        itemsHeading: "Our Key Health Initiatives",
        items: [
            {
                title: "General Health Awareness",
                text: "Promoting awareness about common diseases, preventive healthcare, personal hygiene, healthy lifestyles and the importance of regular medical check-ups.",
            },
            {
                title: "Health Camps and Medical Awareness",
                text: "Encouraging community health programmes, medical awareness camps and initiatives that help people understand available healthcare services.",
            },
            {
                title: "Maternal and Child Health",
                text: "Promoting awareness about maternal care, child health, immunization, nutrition and the importance of timely medical attention.",
            },
            {
                title: "Cancer Patient Support",
                text: "Supporting awareness about cancer prevention, early detection and available treatment facilities, while encouraging assistance for patients from economically disadvantaged backgrounds.",
            },
            {
                title: "Eye Care and Cataract Awareness",
                text: "Promoting eye health awareness, early identification of vision-related problems and guidance regarding available treatment facilities, including cataract surgery for eligible individuals.",
            },
            {
                title: "Support for Persons with Visual Impairment",
                text: "Encouraging the welfare, inclusion and empowerment of visually impaired individuals through awareness, guidance and access to relevant support services.",
            },
            {
                title: "Nutrition and Preventive Healthcare",
                text: "Promoting awareness about balanced nutrition, hygiene, disease prevention and healthy practices, particularly among women, children and vulnerable communities.",
            },
            {
                title: "Healthcare Access and Guidance",
                text: "Helping individuals understand available healthcare facilities, public health programmes and relevant government welfare schemes, including guidance for accessing eligible benefits.",
            },
        ],
        support: {
            heading: "Support Our Healthcare Initiatives",
            intro: "Your contribution can help strengthen healthcare awareness and support humanitarian initiatives for people who need assistance. You can support causes such as:",
            items: [
                "Healthcare and medical assistance for underprivileged families.",
                "Support for economically disadvantaged cancer patients.",
                "Eye care awareness and cataract treatment assistance.",
                "Welfare and support for visually impaired individuals.",
                "Community health awareness and medical programmes.",
                "Health and nutrition initiatives for women and children.",
            ],
        },
        commitment: [
            "We believe that access to healthcare should not be limited by financial or social circumstances. Every individual deserves the opportunity to live a healthy and dignified life.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra aims to contribute towards healthier communities by promoting preventive healthcare, medical awareness, social support and inclusive health initiatives.",
            "Together, we can work towards a society where healthcare awareness reaches every community and no vulnerable individual is left without guidance or support.",
        ],
        closing: {
            label: "Our Vision",
            text: "Healthy individuals, empowered communities and accessible healthcare opportunities for all.",
        },
        faqs: [
            {
                q: "What health areas do you focus on?",
                a: "We focus on general health awareness, health camps, maternal and child health, cancer awareness and patient support, eye care and cataract awareness, support for visually impaired persons, nutrition and guidance on accessing healthcare.",
            },
            {
                q: "Can you guide me about government health schemes?",
                a: "We aim to help people understand available healthcare facilities, public health programmes and relevant government welfare schemes, including guidance on accessing eligible benefits. Please contact us to discuss your situation.",
            },
            {
                q: "How can I support your health initiatives?",
                a: "You can donate towards healthcare awareness and assistance, volunteer at community health programmes, or help spread awareness among families and neighbours.",
            },
        ],
    },

    /* ------------------------------- SOCIAL REFORMS ------------------------------- */
    {
        slug: "social-reforms",
        navLabel: "Social Reform",
        shortTitle: "Social Reforms",
        title: "Social Reforms",
        tagline: "Building Awareness. Promoting Equality. Transforming Society.",
        icon: "users",
        image: { src: "/activities/social-development.jpg", alt: "Community awareness gathering on social issues" },
        meta: {
            title: "Social Reforms: Equality, Awareness & Women's Empowerment",
            description:
                "Social awareness programmes on equality, gender sensitivity, menstrual health, youth participation and environmental sustainability from our base in Patna, Bihar.",
            keywords: [
                "social reforms Bihar",
                "gender equality awareness",
                "women empowerment Patna",
                "menstrual hygiene awareness",
                "youth awareness programmes",
                "social justice and equality",
                "environmental awareness",
            ],
        },
        summary:
            "Real change starts with awareness. We promote equality, gender sensitivity, menstrual health awareness, youth participation and environmental responsibility.",
        highlights: [
            "Equality, human rights and gender sensitivity",
            "Youth awareness and participation",
            "Menstrual health, environmental and social awareness",
        ],
        introHeading: "Social awareness and community transformation",
        intro: [
            "Social reform is an essential part of building a progressive, inclusive and sustainable society. It involves addressing social inequalities, challenging harmful practices, promoting human rights and creating awareness about issues that affect individuals and communities.",
            "Despite social and economic progress, several challenges continue to affect society, including discrimination, gender inequality, social stigma, lack of awareness, environmental degradation and unequal access to opportunities. These challenges often prevent individuals, particularly women, children and disadvantaged communities, from exercising their rights and participating fully in society.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra believes that meaningful social change begins with education, awareness, dialogue and active community participation.",
            "The organization aims to promote positive social transformation by encouraging people, especially youth and the younger generation, to understand social responsibilities, respect human dignity and actively contribute towards a fair and inclusive society.",
        ],
        whyHeading: "Why social awareness matters",
        why: [
            "Laws and schemes alone cannot end discrimination or stigma. Attitudes change when people talk openly, learn the facts and see their neighbours, friends and families lead by example.",
            "Young people play a special role. When they understand equality, health, personal safety and environmental responsibility, they carry those values into their homes, schools and workplaces for decades to come.",
        ],
        itemsHeading: "Our Key Areas of Focus",
        items: [
            {
                title: "Social Justice and Equality",
                text: "Promoting awareness about equality, human rights, dignity and social justice while encouraging a society free from discrimination based on caste, gender, religion, economic status or social background.",
            },
            {
                title: "Youth Awareness and Participation",
                text: "Encouraging young people to participate in social development activities, awareness programmes, educational discussions and community initiatives.",
            },
            {
                title: "Environmental Justice and Sustainability",
                text: "Creating awareness about environmental protection, climate-related challenges, pollution, natural resource conservation and the relationship between environmental sustainability and social well-being.",
            },
            {
                title: "Gender Equality and Women's Empowerment",
                text: "Promoting awareness about equal rights, women's dignity, gender sensitivity, education and opportunities for women's social and economic empowerment.",
            },
            {
                title: "Menstrual Health and Hygiene Awareness",
                text: "Encouraging open and informed discussions about menstruation, menstrual hygiene, reproductive health and the importance of removing social stigma and misconceptions surrounding these subjects.",
            },
            {
                title: "Health and Sex Education Awareness",
                text: "Promoting age-appropriate, scientifically informed awareness about personal health, reproductive health, body awareness, personal safety and responsible decision-making.",
            },
            {
                title: "Elimination of Social Stigma and Discrimination",
                text: "Encouraging constructive dialogue and awareness to challenge harmful stereotypes, social taboos, discrimination and practices that restrict individual freedom and dignity.",
            },
            {
                title: "Educational Seminars and Awareness Campaigns",
                text: "Organizing and supporting seminars, workshops, interactive sessions, educational discussions and community awareness programmes on important social and environmental issues.",
            },
        ],
        after: [
            {
                heading: "Our Approach",
                paragraphs: [
                    "We believe that awareness is the first step towards social transformation.",
                    "Our approach focuses on engaging communities through educational activities, interactive discussions, awareness campaigns and participatory initiatives. Special emphasis is placed on encouraging young people to become informed, responsible and active members of society.",
                    "We aim to create an environment where individuals can express themselves freely, discuss important social issues without fear or discrimination and contribute to positive change.",
                ],
            },
        ],
        commitment: [
            "A progressive society is one where every individual is respected, every voice matters and everyone has equal opportunities to grow and contribute.",
            "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra strives to promote social harmony, environmental responsibility, gender equality and human dignity through awareness, education and community participation.",
            "Together, we can challenge harmful social practices, break barriers and build a more informed, responsible and inclusive society.",
        ],
        closing: {
            label: "Our Vision",
            text: "A society founded on equality, justice, awareness, respect and sustainable development, where every individual has the freedom and opportunity to live with dignity.",
        },
        faqs: [
            {
                q: "What does social reform mean in your work?",
                a: "It means using education, awareness and dialogue to address discrimination, gender inequality, stigma and other barriers, and to encourage equality, human dignity and environmental responsibility.",
            },
            {
                q: "Why do you talk about menstrual health and health education?",
                a: "Open, scientifically informed conversations remove stigma and misconceptions, help young people protect their health and safety, and support the dignity of women and girls.",
            },
            {
                q: "Can schools or youth groups organize an awareness session with you?",
                a: "We organize and support seminars, workshops and interactive sessions on social and environmental issues. Please contact us to discuss a programme for your school, college or community group.",
            },
        ],
    },
];

export function getActivity(slug: string): Activity | undefined {
    return ACTIVITIES.find((a) => a.slug === slug);
}
