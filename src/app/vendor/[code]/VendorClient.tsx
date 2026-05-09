'use client'

import React, { useState } from 'react'
import { Button, Card, Input, Badge } from '@/components/ui-base'
import { redeemAction } from '../../actions'
import { DailyMeal, Vendor, Reservation } from '@/lib/db'
import { Utensils, CheckCircle, Search, QrCode, ClipboardList, TrendingUp, Home as HomeIcon, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function VendorDashboard({
    vendor,
    meal,
    reservations
}: {
    vendor: Vendor,
    meal: DailyMeal | undefined,
    reservations: Reservation[]
}) {
    const [voucherInput, setVoucherInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [mounted, setMounted] = useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const handleRedeem = async (code?: string) => {
        const targetCode = code || voucherInput
        if (!targetCode) return

        setLoading(true)
        setMessage(null)
        const res = await redeemAction(targetCode)
        if (res.success) {
            setMessage({ type: 'success', text: `Voucher ${targetCode} redeemed!` })
            setVoucherInput('')
            // Small delay then reload to show updated list
            setTimeout(() => window.location.reload(), 1000)
        } else {
            setMessage({ type: 'error', text: res.error || 'Redemption failed' })
        }
        setLoading(false)
    }

    const confirmedCount = reservations.length
    const redeemedCount = reservations.filter(r => r.status === 'redeemed').length

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <img src="/logo.jpg" alt="TAPAUU" className="h-12 w-auto object-contain" />
                </div>
                <nav className="flex items-center gap-6">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-xs font-black tracking-widest uppercase text-slate-400 hover:text-primary transition-colors"
                    >
                        HOME
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="text-xs font-black tracking-widest uppercase text-slate-400 hover:text-primary transition-colors"
                    >
                        ADMIN
                    </button>
                </nav>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 space-y-8 pb-32">
                {/* Vendor Header */}
                <div className="space-y-4">
                    <Badge className="bg-[#FFEDD5] text-[#EA580C] border-none font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full">
                        VENDOR PORTAL • {vendor.code}
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {vendor.name} (Rock Cafe)
                    </h1>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6 flex flex-col items-center justify-center space-y-1">
                        <span className="text-5xl font-black text-[#EA580C]">{confirmedCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</span>
                    </Card>
                    <Card className="rounded-[2rem] border-none shadow-sm bg-[#F0FDF4] p-6 flex flex-col items-center justify-center space-y-1">
                        <span className="text-5xl font-black text-[#10B981]">{redeemedCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/60">Redeemed</span>
                    </Card>
                </div>

                {/* Today's Meal Section */}
                <div className="rounded-[2rem] border-2 border-[#FFEDD5] bg-white overflow-hidden shadow-sm">
                    <div className="bg-[#FFF7ED] px-6 py-3 flex items-center gap-2 border-b border-[#FFEDD5]">
                        <Utensils className="h-5 w-5 text-[#EA580C]" />
                        <span className="text-xs font-black uppercase tracking-widest text-[#EA580C]">Today's Meal</span>
                    </div>
                    <div className="p-10 flex flex-col items-center text-center space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                            {meal?.meal_name || 'No meal set for today'}
                        </h2>
                        <p className="text-slate-400 font-medium font-Inter">
                            Pickup starts after cutoff.
                        </p>
                    </div>
                </div>

                {/* Quick Redeem Card */}
                <Card className="rounded-[2rem] border-2 border-slate-900 p-8 space-y-8 shadow-xl shadow-slate-200">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <QrCode className="h-6 w-6 text-slate-900" />
                            <h3 className="text-2xl font-black text-slate-900">Quick Redeem</h3>
                        </div>
                        <p className="text-slate-400 font-medium">Enter voucher code manually</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 italic">
                            <Input
                                placeholder="e.g. A-2403-01"
                                value={voucherInput}
                                onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                                className="text-center font-mono text-3xl font-black tracking-widest h-20 bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-200 text-slate-600"
                            />
                        </div>
                        <Button
                            onClick={() => handleRedeem()}
                            disabled={loading || !voucherInput}
                            className="w-full h-16 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xl font-black uppercase tracking-tight shadow-lg shadow-orange-200 transition-all border-none"
                        >
                            {loading ? 'Processing...' : 'Redeem Now'}
                        </Button>
                    </div>

                    {message && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn(
                            "p-4 rounded-2xl text-center font-black uppercase tracking-widest text-sm",
                            message.type === 'success' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                            {message.text}
                        </motion.div>
                    )}
                </Card>

                {/* Voucher Log (Mobile Style) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            Voucher Log <ClipboardList className="text-slate-400" />
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {mounted ? new Date().toLocaleDateString('en-GB') : ''}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {reservations
                            .slice()
                            .sort((a, b) => {
                                if (a.status !== b.status) return a.status === 'reserved' ? -1 : 1
                                return b.created_at.localeCompare(a.created_at)
                            })
                            .map(res => (
                                <Card key={res.id} className={cn(
                                    "p-6 rounded-3xl border-none shadow-sm flex items-center justify-between transition-all",
                                    res.status === 'redeemed' ? "bg-slate-100/50 opacity-60" : "bg-white"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center font-mono font-black text-xl border-4",
                                            res.status === 'redeemed' ? "bg-slate-100 text-slate-300 border-slate-50" : "bg-white text-primary border-primary/10 shadow-sm"
                                        )}>
                                            {res.voucher.split('-').pop()}
                                        </div>
                                        <div>
                                            <p className="font-mono font-black text-slate-900 tracking-wider text-sm">{res.voucher}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={cn(
                                                    "rounded-lg font-black text-[10px] px-2 py-0.5 border-none",
                                                    res.status === 'redeemed' ? "bg-slate-200 text-slate-500" : "bg-primary/10 text-primary"
                                                )}>
                                                    {res.status.toUpperCase()}
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.pickup_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {res.status === 'reserved' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleRedeem(res.voucher)}
                                            className="rounded-xl font-black h-10 px-4 bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            REDEEM
                                        </Button>
                                    )}
                                </Card>
                            ))}

                        {reservations.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium italic">Waiting for reservations...</p>
                            </div>
                        )}
                    </div>
                </section>

                <footer className="text-center space-y-4 pt-12 opacity-50">
                    <p className="text-xs font-bold text-slate-400">© 2026 TAPAUU Network. Built for speed.</p>
                </footer>
            </main>
        </div>
    )
}
