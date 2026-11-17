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
import React from 'react'

export default function hello() {
    return (
        <div>
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
