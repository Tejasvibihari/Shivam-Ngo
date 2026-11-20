import AboutSection from '@/features/home/components/AboutSection'
import ContactSection from '@/features/home/components/ContactSection'
import DonateSection from '@/features/home/components/DonateSection'
import GallerySection from '@/features/home/components/GallerySection'
import HeroSection from '@/features/home/components/HeroSection'
import ImpactSection from '@/features/home/components/ImpactSection'
import OurProject from '@/features/home/components/OurProject'
import TeamSection from '@/features/home/components/TeamSection'
import VolunteerSection from '@/features/home/components/VolunteerSection'
import WhatWeDoSection from '@/features/home/components/WhatWeDoSection'
import JsonLd from '@/components/shared/JsonLd'
import { buildMetadata } from '@/lib/seo'
import { SITE_DESCRIPTION, SITE_KEYWORDS, organizationJsonLd, websiteJsonLd } from '@/lib/site'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = buildMetadata({
    title: 'Shivam Jan Swasthya Evem Sarwangin Vikash Kendra – NGO in Patna',
    absoluteTitle: true,
    description: SITE_DESCRIPTION,
    path: '/',
    keywords: SITE_KEYWORDS,
})

export default function hello() {
    return (
        <div>
            <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organizationJsonLd(), websiteJsonLd()] }} />
            <HeroSection />
            <GallerySection />
            <AboutSection />
            <WhatWeDoSection />
            <OurProject />
            <ImpactSection />
            <TeamSection />
            <DonateSection />
            <VolunteerSection />
            <ContactSection />
        </div>
    )
}
