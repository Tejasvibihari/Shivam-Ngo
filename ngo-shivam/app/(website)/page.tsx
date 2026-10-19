import AboutSection from '@/features/home/components/AboutSection'
import GallerySection from '@/features/home/components/GallerySection'
import HeroSection from '@/features/home/components/HeroSection'
import ImpactSection from '@/features/home/components/ImpactSection'
import OurProject from '@/features/home/components/OurProject'
import TeamSection from '@/features/home/components/TeamSection'
import React from 'react'

export default function hello() {
    return (
        <div>
            <HeroSection />
            <GallerySection />
            <AboutSection />
            <OurProject />
            <ImpactSection />
            <TeamSection />
        </div>
    )
}
