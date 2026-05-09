'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, Badge } from '@/components/ui-base'
import { reserveMealAction, checkUserAction, getProfileByAuthIdAction } from './actions'
import { DailyMeal, Vendor, Reservation, User } from '@/lib/db'
import { Utensils, Clock, Home as HomeIcon, History, User as UserIcon, LogOut, Wallet, QrCode, MapPin, ChevronRight, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getMYTDateString } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home({
    initialMeals,
    initialVendors,
    allReservations
}: {
    initialMeals: DailyMeal[],
    initialVendors: Vendor[],
    allReservations: Reservation[]
}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today')
    const [selectedPickupTimes, setSelectedPickupTimes] = useState<Record<string, string>>({})
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('home')
    const [showTopUp, setShowTopUp] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const savedId = localStorage.getItem('tapauu_id');

            if (session?.user) {
                const profile = await fetchProfileByAuthId(session.user.id, session.user.email, session.user.user_metadata);
                if (profile) {
                    setUser(profile);
                    localStorage.setItem('tapauu_id', profile.tapauu_id);
                } else if (savedId) {
                    await handleCheckUser(savedId);
                } else {
                    router.push('/login');
                }
            } else if (savedId) {
                await handleCheckUser(savedId);
            } else {
                router.push('/login');
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const profile = await fetchProfileByAuthId(session.user.id, session.user.email, session.user.user_metadata);
                if (profile) {
                    setUser(profile);
                    localStorage.setItem('tapauu_id', profile.tapauu_id);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('tapauu_id');
                router.push('/login');
            }
        });

        initAuth();
        return () => subscription.unsubscribe();
    }, [])

    const fetchProfileByAuthId = async (authId: string, email?: string, metadata?: any) => {
        const res = await getProfileByAuthIdAction(authId, email, metadata);
        if (res.success && res.user) return res.user;
        return null;
    }

    const handleCheckUser = async (id: string) => {
        setLoading(true)
        try {
            const res = await checkUserAction(id)
            if (res.success && res.user) {
                setUser(res.user)
            } else {
                router.push('/login')
            }
        } catch (err) {
            router.push('/login')
        } finally {
            setLoading(false)
        }
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
        setLoading(true)
        await supabase.auth.signOut()
        localStorage.removeItem('tapauu_id')
        router.push('/login')
        router.refresh()
        setLoading(false)
    }

    if (!user || !mounted) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
    )

    const todayMYT = getMYTDateString()
    const tomorrowMYT = getMYTDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
    const todayReservation = allReservations.find(r => r.user_id === user.id && r.date === todayMYT)
    const tomorrowReservation = allReservations.find(r => r.user_id === user.id && r.date === tomorrowMYT)

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <img src="/logo.jpg" alt="TAPAUU" className="h-12 w-auto object-contain" />
                </div>
                <nav className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={cn("text-xs font-black tracking-widest uppercase", activeTab === 'home' || activeTab === 'vendors' ? "text-primary" : "text-slate-400")}
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
                {/* Navigation Tabs (Mobile Style) */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border mb-4">
                    {[
                        { id: 'home', icon: HomeIcon, label: 'Meals' },
                        { id: 'vendors', icon: Utensils, label: 'Vendors' },
                        { id: 'history', icon: History, label: 'History' },
                        { id: 'profile', icon: UserIcon, label: 'Profile' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                                activeTab === tab.id ? "bg-primary/5 text-primary" : "text-slate-400"
                            )}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? "fill-primary/10" : ""} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'home' && (
                    <>
                        {/* User Info Card */}
                        <Card className="rounded-3xl border-none shadow-sm bg-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase leading-none">{user.name}</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1">{user.tapauu_id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-[#E15A2B]">
                                        <Wallet size={20} className="fill-[#E15A2B]/10" />
                                        <span className="text-2xl font-black">{user.credits}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CREDITS</span>
                                </div>
                                <button onClick={() => setShowTopUp(true)} className="p-3 bg-slate-100 rounded-2xl text-primary hover:bg-primary/10 transition-colors">
                                    <Wallet size={20} />
                                </button>
                            </div>
                        </Card>

                        {/* Date Selection Tabs */}
                        <div className="flex justify-center">
                            <div className="bg-slate-100/50 p-1 rounded-[2rem] border flex items-center shadow-sm">
                                <button
                                    onClick={() => setSelectedDay('today')}
                                    className={cn(
                                        "px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all",
                                        selectedDay === 'today' ? "bg-white text-slate-900 shadow-md" : "text-slate-400"
                                    )}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => setSelectedDay('tomorrow')}
                                    className={cn(
                                        "px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-2",
                                        selectedDay === 'tomorrow' ? "bg-white text-[#E15A2B] shadow-md" : "text-slate-400"
                                    )}
                                >
                                    Tomorrow 🗓️
                                </button>
                            </div>
                        </div>

                        {/* Active Reservation Card */}
                        {((selectedDay === 'today' && todayReservation) || (selectedDay === 'tomorrow' && tomorrowReservation)) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "relative overflow-hidden rounded-[2.5rem] border-4 shadow-xl",
                                    selectedDay === 'today' ? "border-[#10B981]" : "border-[#3B82F6]"
                                )}
                            >
                                <div className={cn(
                                    "text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.2em]",
                                    selectedDay === 'today' ? "bg-[#10B981]" : "bg-[#3B82F6]"
                                )}>
                                    {selectedDay === 'today' ? "CONFIRMED FOR TODAY" : "TOMORROW IS SORTED!"}
                                </div>
                                <div className="bg-white p-10 flex flex-col items-center text-center space-y-6">
                                    <h3 className="text-3xl font-black text-slate-900 leading-tight">
                                        {selectedDay === 'today' ? "YOU'RE ALL SET!" : "Tomorrow is Sorted!"}
                                    </h3>

                                    {selectedDay === 'tomorrow' && (
                                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">
                                            🗓️
                                        </div>
                                    )}

                                    <p className="text-slate-500 font-medium">
                                        {selectedDay === 'today'
                                            ? `Enjoy your meal from ${initialVendors.find(v => v.id === todayReservation?.vendor_id)?.name} (Rock Cafe)`
                                            : <>You've booked <span className="text-[#3B82F6] underline font-bold">{initialMeals.find(m => m.id === tomorrowReservation?.meal_id)?.meal_name}</span> for tomorrow.</>
                                        }
                                    </p>

                                    <div className="w-full py-10 rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-2">
                                        {selectedDay === 'today' ? (
                                            <>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YOUR VOUCHER</p>
                                                <p className="text-5xl font-black text-[#10B981] tracking-wider">{todayReservation?.voucher}</p>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-col items-center">
                                                    <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] border-none font-black px-4 py-1.5 rounded-xl text-xs">
                                                        Pickup: {tomorrowReservation?.pickup_time}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest">
                                                    YOUR VOUCHER WILL APPEAR HERE ON {tomorrowMYT}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedDay === 'today' && (
                                        <div className="w-full flex justify-between items-end pt-4 border-t border-slate-50 text-left">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled:</p>
                                                <p className="text-lg font-black text-slate-900">
                                                    {initialMeals.find(m => m.id === todayReservation?.meal_id)?.meal_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] border-none font-black px-4 py-1.5 rounded-xl">
                                                    Pickup: {todayReservation?.pickup_time}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Pick a Meal Section */}
                        {((selectedDay === 'today' && !todayReservation) || (selectedDay === 'tomorrow' && !tomorrowReservation)) && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                        Pick a Meal 🍴
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planning: {selectedDay}</span>
                                </div>

                                <div className="grid gap-6">
                                    {initialMeals
                                        .filter(m => {
                                            return selectedDay === 'today' ? m.date === todayMYT : m.date === tomorrowMYT
                                        })
                                        .map((meal) => {
                                            const vendor = initialVendors.find(v => v.id === meal.vendor_id)
                                            const isSoldOut = meal.remaining <= 0

                                            // Pickup times determination
                                            const isBrianiHouse = ['briani', 'biryani', 'biriani'].some(term => vendor?.name.toLowerCase().includes(term));
                                            const pickupTimes = isBrianiHouse ? ["13:00", "13:30", "14:00", "14:30", "15:00"] : ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

                                            return (
                                                <Card key={meal.id} className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden p-8 space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <Badge className="bg-primary/10 text-primary border-none mb-2 font-black uppercase text-[10px]">
                                                                {vendor?.name}
                                                            </Badge>
                                                            <h4 className="text-2xl font-black text-slate-900 leading-tight">
                                                                {meal.meal_name}
                                                            </h4>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-primary">RM{(meal.credit_cost * 6.5).toFixed(2)}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meal.credit_cost} Credits</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {pickupTimes.map(time => (
                                                            <button
                                                                key={time}
                                                                onClick={() => setSelectedPickupTimes(prev => ({ ...prev, [meal.id]: time }))}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-2xl text-xs font-black transition-all border-2",
                                                                    selectedPickupTimes[meal.id] === time
                                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                                        : "bg-slate-50 border-transparent text-slate-400 hover:border-primary/20"
                                                                )}
                                                            >
                                                                {time}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${(meal.remaining / meal.limit) * 100}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meal.remaining} left</span>
                                                        </div>
                                                        <Button
                                                            disabled={isSoldOut || loading || !selectedPickupTimes[meal.id]}
                                                            onClick={() => handleReserve(meal.id)}
                                                            className="rounded-2xl font-black h-12 px-8"
                                                        >
                                                            {isSoldOut ? 'SOLD OUT' : 'BOOK MEAL'}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {activeTab === 'vendors' && (
                    <section className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            Select Vendor <Utensils className="text-slate-400" />
                        </h3>
                        <div className="grid gap-4">
                            {initialVendors.map(vendor => (
                                <Card
                                    key={vendor.id}
                                    className="p-6 rounded-3xl border-none shadow-sm flex items-center justify-between bg-white cursor-pointer hover:shadow-md transition-all group"
                                    onClick={() => router.push(`/vendor/${vendor.code}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Utensils size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 leading-tight">{vendor.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">CODE: {vendor.code}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'history' && (
                    <section className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            Your History <History className="text-slate-400" />
                        </h3>
                        <div className="space-y-4">
                            {allReservations
                                .filter(r => r.user_id === user.id)
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map(res => (
                                    <Card key={res.id} className="rounded-3xl border-none shadow-sm p-6 flex justify-between items-center bg-white group hover:shadow-md transition-shadow">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-slate-900">{res.date}</h4>
                                            <p className="text-xs font-bold text-slate-400 font-mono">
                                                {res.voucher} • {res.pickup_time}
                                            </p>
                                        </div>
                                        <Badge className={cn(
                                            "rounded-xl font-black text-[10px] px-4 py-1.5 border-none",
                                            res.status === 'redeemed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {res.status.toUpperCase()}
                                        </Badge>
                                    </Card>
                                ))}
                            {allReservations.filter(r => r.user_id === user.id).length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium italic">No travel history yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'profile' && (
                    <section className="space-y-6 text-center">
                        <div className="pt-8 flex flex-col items-center">
                            <div className="h-32 w-32 rounded-full border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                                <UserIcon size={64} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase">{user.name}</h2>
                            <p className="text-sm font-bold text-slate-400 tracking-widest mt-2">{user.tapauu_id}</p>
                        </div>

                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 mt-8 space-y-6">
                            <div className="flex items-center justify-between text-left">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Credits</p>
                                    <p className="text-2xl font-black text-primary">{user.credits} CREDITS</p>
                                </div>
                                <Button onClick={() => setShowTopUp(true)} className="rounded-2xl h-12 px-6">Top Up</Button>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="w-full h-14 rounded-2xl border-2 font-black text-destructive hover:bg-destructive/5 hover:border-destructive"
                                >
                                    <LogOut size={20} className="mr-2" />
                                    SIGN OUT
                                </Button>
                            </div>
                        </Card>
                    </section>
                )}

                <footer className="text-center space-y-4 pt-12 opacity-50">
                    <p className="text-xs font-bold text-slate-400">© 2026 TAPAUU Pilot Project. Built for speed.</p>
                </footer>
            </main>

            {/* Topup Modal */}
            <AnimatePresence>
                {showTopUp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl relative">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="h-16 w-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366]">
                                    <Wallet size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900">Manual Top Up</h4>
                                    <p className="text-slate-500 font-medium mt-2">Contact our team on WhatsApp to top up your credits manually.</p>
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black" onClick={() => window.open('https://wa.me/601111406041', '_blank')}>
                                    WhatsApp Us
                                </Button>
                                <button onClick={() => setShowTopUp(false)} className="text-slate-400 font-bold text-sm">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
