'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-base'
import { Settings } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
            <div className="container max-w-2xl mx-auto px-4 h-24 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <img
                            src="/logo.jpg"
                            alt="TAPAUU Logo"
                            className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-primary/10 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                            V2
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-3xl tracking-tighter text-slate-900 leading-none">TAPAUU</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Student Savings</span>
                    </div>
                </Link>

                <nav className="flex items-center gap-3">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-xs font-black gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 transition-all">
                            <Settings className="w-4 h-4" />
                            Admin
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
