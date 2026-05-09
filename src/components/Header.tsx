'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-base'
import { Settings } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
                    <span className="font-extrabold text-xl tracking-tight text-primary">TAPAUU</span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="text-xs font-bold gap-2 text-slate-500 hover:text-primary">
                            <Settings className="w-4 h-4" />
                            Admin
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
