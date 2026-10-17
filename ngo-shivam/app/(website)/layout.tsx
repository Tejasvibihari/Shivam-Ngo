import Footer from '@/components/layout/Footer'
import NavbarDemo from '@/components/layout/Navbar'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <NavbarDemo />
            {/* no top padding: the navbar is fixed and floats over the hero */}
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}