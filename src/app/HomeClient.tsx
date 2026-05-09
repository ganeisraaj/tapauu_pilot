'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge } from '@/components/ui-base'
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

    const todayReservation = allReservations.find(r => r.user_id === user.id && r.date === getMYTDateString())
    const mealsLeft = user.credits || 0

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
                <div className="h-10 w-auto">
                    <img src="/logo.jpg" alt="TAPAUU" className="h-full w-auto object-contain" />
                </div>
                <Button size="icon" variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut size={20} />
                </Button>
            </header>

            <main className="flex-1 px-6 space-y-8">
                {/* Greeting */}
                <section className="space-y-1">
                    <p className="text-muted-foreground font-medium">Hello there,</p>
                    <h2 className="text-3xl font-black text-foreground">Hey, {user.name.split(' ')[0]} 👋</h2>
                </section>

                {/* Wallet Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-400 -rotate-2 group-hover:rotate-0 transition-transform duration-500 rounded-3xl" />
                    <div className="relative bg-primary p-8 rounded-3xl text-white shadow-2xl shadow-primary/30 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Wallet Balance</p>
                                <h3 className="text-4xl font-black">RM{(mealsLeft * 7).toFixed(2)}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                            <div className="flex-1">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Meals Remaining</p>
                                <p className="text-xl font-black">{mealsLeft} meals left</p>
                            </div>
                            <Button className="bg-white text-primary hover:bg-white/90 font-black rounded-xl px-6 h-12 shadow-sm">
                                Top Up
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Today's Special / Active Reservation */}
                {todayReservation && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-foreground">Active Reservation</h3>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 font-black">CONFIRMED</Badge>
                        </div>
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-3xl bg-white border shadow-sm border-primary/20 bg-gradient-to-r from-orange-50 to-white"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">REDEMPTION CODE</p>
                                    <h4 className="text-3xl font-black tracking-[0.2em] font-mono text-foreground uppercase">
                                        {todayReservation.voucher}
                                    </h4>
                                </div>
                                <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border flex items-center justify-center text-primary">
                                    <QrCode size={32} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-foreground">
                                        {initialVendors.find(v => v.id === todayReservation.vendor_id)?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={12} /> {todayReservation.pickup_time}
                                    </p>
                                </div>
                                <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold">
                                    Redeem Meal
                                </Button>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* Vendor List */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-foreground">Available Meals</h3>
                        <div className="flex bg-muted p-1 rounded-xl">
                            <button
                                onClick={() => setSelectedDay('today')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                                    selectedDay === 'today' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setSelectedDay('tomorrow')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                                    selectedDay === 'tomorrow' ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                Tomorrow
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {initialMeals
                            .filter(m => {
                                const todayMYT = getMYTDateString()
                                const tomorrowMYT = getMYTDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
                                return selectedDay === 'today' ? m.date === todayMYT : m.date === tomorrowMYT
                            })
                            .map((meal) => {
                                const vendor = initialVendors.find(v => v.id === meal.vendor_id)
                                const isSoldOut = meal.remaining <= 0

                                // Determination of pickup times
                                const isBrianiHouse = ['briani', 'biryani', 'biriani'].some(term => vendor?.name.toLowerCase().includes(term));
                                const startHour = isBrianiHouse ? 13 : 12;
                                const endHour = 15;
                                const pickupTimes = [];
                                for (let h = startHour; h <= endHour; h++) {
                                    for (let m = 0; m < 60; m += 15) {
                                        if (h === endHour && m > 0) break;
                                        pickupTimes.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                                    }
                                }

                                return (
                                    <motion.div
                                        key={meal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group">
                                            <div className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">
                                                                {vendor?.name}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                                                            {meal.meal_name}
                                                        </h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-primary">RM{(meal.credit_cost * 6.5).toFixed(2)}</p>
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                                            {meal.credit_cost} Credit
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {pickupTimes.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setSelectedPickupTimes(prev => ({ ...prev, [meal.id]: time }))}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border-2",
                                                                selectedPickupTimes[meal.id] === time
                                                                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                                                    : "bg-muted border-transparent text-muted-foreground hover:border-primary/20"
                                                            )}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(meal.remaining / meal.limit) * 100}%` }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{meal.remaining} left</span>
                                                    </div>
                                                    <Button
                                                        disabled={isSoldOut || loading || !selectedPickupTimes[meal.id]}
                                                        onClick={() => handleReserve(meal.id)}
                                                        className="rounded-xl font-black h-10 px-6 shadow-sm shadow-primary/10"
                                                    >
                                                        {isSoldOut ? 'Sold Out' : 'Redeem'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                    </div>
                </section>

                <div className="h-12" /> {/* Spacer */}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-6 left-6 right-6 z-40 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-2 flex items-center justify-around">
                {[
                    { id: 'home', icon: HomeIcon, label: 'Home' },
                    { id: 'vendors', icon: Utensils, label: 'Vendors' },
                    { id: 'history', icon: History, label: 'History' },
                    { id: 'profile', icon: UserIcon, label: 'Profile' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all relative group",
                            activeTab === item.id ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon size={24} className={cn("transition-transform group-hover:scale-110", activeTab === item.id && "fill-primary/10")} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/5 rounded-2xl -z-10" />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    )
}
