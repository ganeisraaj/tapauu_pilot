'use client'

import React, { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '@/components/ui-base'
import { redeemAction } from '../../actions'
import { DailyMeal, Vendor, Reservation } from '@/lib/db'
import { Utensils, CheckCircle, Search, QrCode, ClipboardList, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
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
        <div className="container max-w-4xl mx-auto p-4 py-8 space-y-8">
            {/* Vendor Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Badge className="bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-widest px-3">
                        Vendor Portal • {vendor.code}
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{vendor.name}</h1>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white border p-4 rounded-2xl shadow-sm flex flex-col items-center min-w-[120px]">
                        <span className="text-3xl font-black text-primary">{confirmedCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bookings</span>
                    </div>
                    <div className="bg-green-50 border-green-100 border p-4 rounded-2xl shadow-sm flex flex-col items-center min-w-[120px]">
                        <span className="text-3xl font-black text-green-600">{redeemedCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Redeemed</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Meal Info & Redemption */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-2 border-primary/20 overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Today's Meal</span>
                        </div>
                        <CardContent className="p-6 space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">{meal?.meal_name || 'No meal set for today'}</h2>
                            <p className="text-sm text-slate-500">Pickup starts after {meal?.cutoff} cutoff.</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-2 border-slate-900 shadow-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <QrCode className="h-5 w-5" /> Quick Redeem
                            </CardTitle>
                            <CardDescription>Enter voucher code manually</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="e.g. A-2403-01"
                                value={voucherInput}
                                onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                                className="text-center font-mono text-xl font-bold tracking-widest h-14 border-2 focus:border-primary"
                            />
                            <Button onClick={() => handleRedeem()} disabled={loading} className="w-full h-12 text-lg font-black uppercase tracking-tight">
                                {loading ? 'Processing...' : 'Redeem Now'}
                            </Button>
                            {message && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(
                                    "p-3 rounded-xl text-center text-sm font-bold",
                                    message.type === 'success' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {message.text}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Voucher List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-slate-400" /> Voucher Log
                        </h2>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Today: {mounted ? new Date().toLocaleDateString() : ''}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
                        {reservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 space-y-2">
                                <TrendingUp className="h-8 w-8 opacity-20" />
                                <p className="italic text-sm">Waiting for reservations...</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {reservations
                                    .slice()
                                    .sort((a, b) => {
                                        // Priority 1: Status (Reserved first)
                                        if (a.status !== b.status) {
                                            return a.status === 'reserved' ? -1 : 1
                                        }
                                        // Priority 2: Newest first
                                        return b.created_at.localeCompare(a.created_at)
                                    })
                                    .map(res => (
                                        <div key={res.id} className={cn(
                                            "p-5 flex items-center justify-between transition-colors",
                                            res.status === 'redeemed' ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center font-mono font-black text-lg",
                                                    res.status === 'redeemed' ? "bg-slate-200 text-slate-400" : "bg-primary/10 text-primary border border-primary/20"
                                                )}>
                                                    {res.voucher.split('-').pop()}
                                                </div>
                                                <div>
                                                    <p className="font-mono font-bold text-slate-900">{res.voucher}</p>
                                                    <p className="text-xs text-slate-400 font-medium">Status: {res.status.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            {res.status === 'reserved' ? (
                                                <Button variant="outline" size="sm" onClick={() => handleRedeem(res.voucher)} className="font-bold border-2 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all">
                                                    Mark Redeemed
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                    <CheckCircle className="h-5 w-5" /> Done
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
