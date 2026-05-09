'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-base'
import { Settings } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="container max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                {/* Left Side (Desktop-only Spacer for centering) */}
                <div className="w-24 hidden md:block" />

                {/* Centered Logo & Branding */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <img
                        src="/logo.jpg"
                        alt="TAPAUU"
                        className="h-9 w-auto object-contain"
                    />
                    <span className="font-black text-2xl tracking-tighter text-[#FF6B35]">TAPAUU</span>
                </Link>

                {/* Right Side Options */}
                <nav className="flex items-center">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="font-bold text-slate-500 hover:text-primary gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
