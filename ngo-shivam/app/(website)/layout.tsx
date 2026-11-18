import LeafCursor from '@/components/effects/LeafCursor'
import SplashScreen from '@/components/effects/SplashScreen'
import Footer from '@/components/layout/Footer'
import NavbarDemo from '@/components/layout/Navbar'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <SplashScreen />
            <LeafCursor density={3} speed={1} />
            <NavbarDemo />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}