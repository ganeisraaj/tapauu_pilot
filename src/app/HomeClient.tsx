'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Badge } from '@/components/ui-base'
import { getProfileByAuthIdAction, reserveMealAction, checkUserAction } from './actions'
import { DailyMeal, Vendor, Reservation, User } from '@/lib/db'
import { Utensils, Clock, CheckCircle, History, User as UserIcon, LogOut, ArrowRight, Wallet, Calendar, MapPin, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { cn, getMYTDateString } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const FloatingOrb = ({ className, style }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('absolute rounded-full blur-3xl opacity-20 animate-pulse', className)} style={style} />
)

export default function Home({
    initialMeals,
    initialVendors,
    allReservations
}: {
    initialMeals: DailyMeal[],
    initialVendors: Vendor[],
    allReservations: Reservation[]
}) {
    const router = useRouter()
    const [tapauuId, setTapauuId] = useState<string>('')
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [todayReservation, setTodayReservation] = useState<Reservation | null>(null)
    const [tomorrowReservation, setTomorrowReservation] = useState<Reservation | null>(null)
    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today')
    const [selectedPickupTimes, setSelectedPickupTimes] = useState<Record<string, string>>({})
    const [mounted, setMounted] = useState(false)

    // Derived: vendors and meals scoped to the logged-in user's university
    const scopedVendors = user?.university_id
        ? initialVendors.filter(v => v.university_id === user.university_id)
        : initialVendors
    const scopedVendorIds = new Set(scopedVendors.map(v => v.id))
    const scopedMeals = initialMeals.filter(m => scopedVendorIds.has(m.vendor_id))

    useEffect(() => {
        if (!user || !mounted) return

        const userReservations = allReservations.filter(r => r.user_id === user.id)
        const todayMYT = getMYTDateString()
        const tomorrowMYT = getMYTDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))

        const todayRes = userReservations.find(r => r.date === todayMYT && r.status !== 'cancelled')
        const tomorrowRes = userReservations.find(r => r.date === tomorrowMYT && r.status !== 'cancelled')

        setTodayReservation(todayRes || null)
        setTomorrowReservation(tomorrowRes || null)

    }, [user, allReservations, mounted])

    useEffect(() => {
        setMounted(true)
        const checkSession = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const res = await getProfileByAuthIdAction(authUser.id)
                if (res.success && res.user) {
                    setUser(res.user)
                    setTapauuId(res.user.tapauu_id)
                }
            } else {
                // Redirect if no session
                router.push('/login')
            }
        }
        checkSession()
    }, [router])

    const handleCheckUser = async (id?: string) => {
        const targetId = id || tapauuId
        if (!targetId) return

        setLoading(true)
        const res = await checkUserAction(targetId)
        if (res.success && res.user) {
            setUser(res.user)
            localStorage.setItem('tapauu_id', targetId)
            setMessage(null)
        } else {
            setMessage({ type: 'error', text: res.error || 'User not found' })
        }
        setLoading(false)
    }

    const handleReserve = async (mealId: string) => {
        const pickupTime = selectedPickupTimes[mealId]
        if (!user || !pickupTime) return
        setLoading(true)
        const formData = new FormData()
        formData.append('tapauuId', user.tapauu_id)
        formData.append('mealId', mealId)
        formData.append('pickupTime', pickupTime)

        const res = await reserveMealAction(formData)
        if (res.success) {
            setMessage({ type: 'success', text: 'Reservation successful!' })
            window.location.reload()
        } else {
            setMessage({ type: 'error', text: res.error || 'Reservation failed' })
        }
        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        localStorage.removeItem('tapauu_id')
        setUser(null)
        setTapauuId('')
        window.location.href = '/'
    }

    const todayStr = mounted ? new Date().toLocaleDateString('en-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : ''

    if (!user) return null

    return (
        <div className="min-h-screen bg-[hsl(20,20%,10%)] relative overflow-x-hidden text-white pb-12">
            {/* Animated Background Elements */}
            <FloatingOrb className="w-[500px] h-[500px] bg-primary/20 top-[-250px] right-[-100px]" />
            <FloatingOrb className="w-[300px] h-[300px] bg-orange-400/10 bottom-[-100px] left-[-50px]" style={{ animationDelay: '2s' }} />
            <FloatingOrb className="w-[400px] h-[400px] bg-amber-600/5 top-[20%] left-[-200px]" style={{ animationDelay: '4s' }} />

            <div className="container max-w-4xl mx-auto p-4 py-8 space-y-10 relative z-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                        >
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{todayStr}</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                            Welcome, <span className="text-primary italic">{user.name.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-white/30 text-lg font-medium">What's for lunch today?</p>
                    </div>

                    {/* Profile & Logout desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm font-black text-white/40 uppercase tracking-widest leading-none mb-1">{user.tapauu_id}</p>
                            <button onClick={handleLogout} className="text-[10px] font-black text-white/20 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto uppercase tracking-widest">
                                <LogOut className="w-3 h-3" /> Sign Out
                            </button>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white/60" />
                        </div>
                    </div>
                </header>

                {/* Credits / Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gradient-to-br from-primary to-orange-600 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/20 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000" />
                        <div className="space-y-1 relative z-10">
                            <p className="text-white/60 text-xs font-black uppercase tracking-widest">TAPAUU Credits</p>
                            <h2 className="text-7xl font-black text-white tracking-tighter">{user.credits}</h2>
                        </div>
                        <div className="relative z-10 pt-4 flex items-center gap-4">
                            <div className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xs uppercase tracking-widest">
                                Premium Member
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-primary bg-orange-200" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-white/30 leading-none mb-1">Campus</p>
                            <p className="text-sm font-black italic">{scopedVendors[0]?.university_id?.split('-')[0] || 'My Campus'}</p>
                        </div>
                    </div>
                </div>

                {/* Day Selector */}
                <div className="flex justify-center">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-[2rem] flex gap-1">
                        {[
                            { id: 'today', label: 'TODAY', icon: Utensils },
                            { id: 'tomorrow', label: 'TOMORROW', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedDay(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-10 py-4 rounded-[1.5rem] text-xs font-black transition-all tracking-widest",
                                    selectedDay === tab.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/40 scale-[1.02]"
                                        : "text-white/30 hover:text-white/50"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking Status Feedback */}
                <AnimatePresence mode="wait">
                    {(selectedDay === 'today' ? todayReservation : tomorrowReservation) && (
                        <motion.div
                            key="conf"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-green-500/10 border-2 border-green-500/30 backdrop-blur-3xl rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 border-dashed relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle className="w-32 h-32 text-green-400" />
                            </div>
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-4xl shadow-xl shadow-green-500/40 shrink-0">✨</div>
                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h3 className="text-2xl font-black uppercase text-green-400">Meal Secured.</h3>
                                <p className="text-white/60 font-medium">
                                    You're booked for <span className="text-white font-black underline">{scopedMeals.find(m => m.id === (selectedDay === 'today' ? todayReservation : tomorrowReservation)?.meal_id)?.meal_name}</span>.
                                </p>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-2">
                                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">VOUCHER CODE</span>
                                    <span className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {(selectedDay === 'today' ? todayReservation : tomorrowReservation)?.voucher}
                                    </span>
                                </div>
                                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                                    Pickup: {(selectedDay === 'today' ? todayReservation : tomorrowReservation)?.pickup_time}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            On the menu <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {scopedMeals
                            .filter(m => {
                                const todayMYT = getMYTDateString()
                                const tomorrowMYT = getMYTDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
                                return selectedDay === 'today' ? m.date === todayMYT : m.date === tomorrowMYT
                            })
                            .map((meal) => {
                                const vendor = scopedVendors.find(v => v.id === meal.vendor_id)
                                const isSoldOut = meal.remaining <= 0
                                const isReserved = (selectedDay === 'today' && todayReservation) || (selectedDay === 'tomorrow' && tomorrowReservation)

                                // Generate pickup times manually
                                const isBrianiHouse = vendor?.name.toLowerCase().includes('briani') || vendor?.name.toLowerCase().includes('biryani')
                                const startHour = isBrianiHouse ? 13 : 12;
                                const endHour = 15;
                                const pickupTimes: string[] = [];
                                for (let h = startHour; h <= endHour; h++) {
                                    for (let m = 0; m < 60; m += 15) {
                                        if (h === endHour && m > 0) break;
                                        pickupTimes.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                                    }
                                }

                                return (
                                    <motion.div
                                        key={meal.id}
                                        whileHover={{ y: -8 }}
                                        className={cn(
                                            "group bg-white/5 border border-white/10 backdrop-blur-sm rounded-[3rem] p-8 transition-all hover:bg-white/[0.08] relative overflow-hidden",
                                            isReserved && "opacity-30 grayscale pointer-events-none"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1">
                                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 w-fit">
                                                    {vendor?.name}
                                                </div>
                                                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors">{meal.meal_name}</h3>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-primary">1</span>
                                                <span className="text-[10px] font-black uppercase text-white/30">Credit</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="flex items-center gap-2 text-white/40">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold">{meal.cutoff} cutoff</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/40">
                                                <div className="flex -space-x-1">
                                                    {[1, 2].map(i => <div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-black" />)}
                                                </div>
                                                <span className="text-xs font-bold">{meal.remaining} left</span>
                                            </div>
                                        </div>

                                        {!isReserved && !isSoldOut ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {pickupTimes.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setSelectedPickupTimes(prev => ({ ...prev, [meal.id]: time }))}
                                                            className={cn(
                                                                "py-3 rounded-2xl text-[11px] font-black transition-all border-2 tracking-widest",
                                                                selectedPickupTimes[meal.id] === time
                                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-[1.05]"
                                                                    : "bg-white/5 border-white/10 text-white/30 hover:border-white/40"
                                                            )}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => handleReserve(meal.id)}
                                                    disabled={loading || !selectedPickupTimes[meal.id]}
                                                    className={cn(
                                                        "w-full py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest",
                                                        selectedPickupTimes[meal.id]
                                                            ? "bg-white text-black hover:bg-white/90 shadow-2xl scale-[1.02]"
                                                            : "bg-white/10 text-white/20"
                                                    )}
                                                >
                                                    Book Now <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="py-8 bg-black/20 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center grayscale text-white/20">
                                                <p className="font-black italic uppercase tracking-[0.3em] text-xs">
                                                    {isSoldOut ? 'Out of Stock' : 'Selection Locked'}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                    </div>
                </div>

                {/* Recent Activity Mini-Section */}
                <section className="space-y-6 pt-10">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white/40 flex items-center gap-3">
                        Recent Activity <History className="w-4 h-4" />
                    </h2>
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-50 grayscale border-dashed">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-white/20 font-black italic uppercase tracking-widest text-xs">No Recent Reservations</p>
                    </div>
                </section>

                {/* Premium Footer */}
                <footer className="pt-12 border-t border-white/5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <div className="w-1 h-1 rounded-full bg-primary/60" />
                        <div className="w-1 h-1 rounded-full bg-primary/30" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10">
                        TAPAUU FOR BITES · 2026 PREMIUM ACCESS
                    </p>
                </footer>
            </div>
        </div>
    )
}
