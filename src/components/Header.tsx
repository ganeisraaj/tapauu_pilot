'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-base'
import { Settings } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
            <div className="container max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
                {/* Logo on the Left */}
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <img
                        src="/favicon.svg"
                        alt="TAPAUU"
                        className="h-20 w-auto"
                    />
                </Link>

                {/* Right side Actions */}
                <div className="flex items-center">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="font-bold text-slate-500 hover:text-primary gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
