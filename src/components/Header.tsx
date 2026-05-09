'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-base'
import { Settings } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm flex justify-center">
            <div className="container max-w-6xl mx-auto px-4 h-20 flex items-center justify-between relative">
                {/* Logo centered absolutely */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <img
                            src="/favicon.svg"
                            alt="TAPAUU"
                            className="h-14 w-auto"
                        />
                    </Link>
                </div>

                {/* Right side Actions */}
                <div className="ml-auto">
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
