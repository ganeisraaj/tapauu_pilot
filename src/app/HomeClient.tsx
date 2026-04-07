'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Badge } from '@/components/ui-base'
import { reserveMealAction, checkUserAction } from './actions'
import { DailyMeal, Vendor, Reservation, User } from '@/lib/db'
import { Utensils, Clock, CheckCircle, History, User as UserIcon, LogOut, ArrowRight, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getMYTDateString } from '@/lib/utils'

export default function Home({
    initialMeals,
    initialVendors,
    allReservations
}: {
    initialMeals: DailyMeal[],
    initialVendors: Vendor[],
    allReservations: Reservation[]
}) {
    const [tapauuId, setTapauuId] = useState<string>('')
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [todayReservation, setTodayReservation] = useState<Reservation | null>(null)
    const [tomorrowReservation, setTomorrowReservation] = useState<Reservation | null>(null)
    const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today')
    const [selectedPickupTimes, setSelectedPickupTimes] = useState<Record<string, string>>({})
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedId = localStorage.getItem('tapauu_id')
        if (savedId) {
            setTapauuId(savedId)
            handleCheckUser(savedId)
        }
    }, [])

    useEffect(() => {
        if (user) {
            const today = getMYTDateString()
            const tomorrow = getMYTDateString(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))

            setTodayReservation(allReservations.find(r => r.user_id === user.id && r.date === today) || null)
            setTomorrowReservation(allReservations.find(r => r.user_id === user.id && r.date === tomorrow) || null)
        }
    }, [user, allReservations])

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
            // Reload is handled by revalidatePath, but we might need to update local state
            window.location.reload()
        } else {
            setMessage({ type: 'error', text: res.error || 'Reservation failed' })
        }
        setLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('tapauu_id')
        setUser(null)
        setTapauuId('')
    }

    const todayStr = mounted ? new Date().toLocaleDateString('en-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : ''

    return (
        <div className="container max-w-2xl mx-auto p-4 py-8 space-y-8">
            {/* Welcome Header */}
            <section className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
                    Selamat Datang! <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span>
                </h1>
                <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> {todayStr}
                </p>
            </section>

            {!user ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-2 border-primary/20 bg-white/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Pilot Access</CardTitle>
                            <CardDescription>Enter your TAPAUU ID to view today's meals.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="e.g. STU101"
                                value={tapauuId}
                                onChange={(e) => setTapauuId(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleCheckUser()}
                                className="text-lg font-mono uppercase"
                            />
                            <Button onClick={() => handleCheckUser()} disabled={loading} className="w-full h-12 text-lg font-bold">
                                {loading ? 'Checking...' : 'Explore Meals'}
                            </Button>
                            {message?.type === 'error' && (
                                <p className="text-sm text-destructive font-medium text-center">{message.text}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* User Info Bar */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-slate-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-none">{user.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{user.tapauu_id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-primary font-bold">
                                    <Wallet className="h-4 w-4" />
                                    {user.credits}
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Credits</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-destructive">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Meal Selection Tabs */}
                    <div className="space-y-6">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
                            <button
                                onClick={() => setSelectedDay('today')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-sm font-black transition-all",
                                    selectedDay === 'today' ? "bg-white text-primary shadow-sm scale-105" : "text-slate-400"
                                )}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setSelectedDay('tomorrow')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-sm font-black transition-all",
                                    selectedDay === 'tomorrow' ? "bg-white text-primary shadow-sm scale-105" : "text-slate-400"
                                )}
                            >
                                Tomorrow 🗓️
                            </button>
                        </div>

                        {selectedDay === 'today' && todayReservation ? (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <Card className="border-4 border-green-500 bg-green-50 overflow-hidden relative">
                                    <div className="bg-green-500 p-2 text-center text-white text-xs font-bold uppercase tracking-widest">
                                        Confirmed for Today
                                    </div>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-black text-slate-900 uppercase">You're All Set!</h2>
                                            <p className="text-slate-600 font-medium">Enjoy your meal from {initialVendors.find(v => v.id === todayReservation.vendor_id)?.name}</p>
                                        </div>

                                        <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-green-200 text-center space-y-2">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Your Voucher</p>
                                            <div className="text-4xl font-black tracking-tight text-green-600 font-mono">
                                                {todayReservation.voucher}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-green-100">
                                            <span className="text-slate-500">Scheduled:</span>
                                            <div className="text-right">
                                                <p className="text-slate-900 font-black italic">{initialMeals.find(m => m.id === todayReservation.meal_id)?.meal_name}</p>
                                                <p className="text-xs text-green-600 font-bold">Pickup: {todayReservation.pickup_time}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : selectedDay === 'tomorrow' && tomorrowReservation ? (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <Card className="border-2 border-blue-400 bg-blue-50/50 overflow-hidden text-center p-10 space-y-4">
                                    <div className="text-4xl">🗓️</div>
                                    <h2 className="text-xl font-black text-blue-900">Tomorrow is Sorted!</h2>
                                    <p className="text-blue-600/80 font-medium max-w-xs mx-auto">
                                        You've booked <span className="font-bold underline text-blue-800">{initialMeals.find(m => m.id === tomorrowReservation.meal_id)?.meal_name}</span> for tomorrow.
                                    </p>
                                    <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200 font-black">
                                        Pickup: {tomorrowReservation.pickup_time}
                                    </Badge>
                                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">Your voucher will appear here on {tomorrowReservation.date}</p>
                                </Card>
                            </motion.div>
                        ) : (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        Pick a Meal <Utensils className="h-5 w-5 text-primary" />
                                    </h2>
                                    <Badge variant="outline" className="text-slate-500 bg-slate-100 border-none font-bold">
                                        Planning: {selectedDay}
                                    </Badge>
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

                                            // Improved Cutoff Logic with MYT Timezone Sync
                                            const todayMYT = getMYTDateString()

                                            // Handle Time Calculation
                                            const getMinutes = (h: number, min: number) => h * 60 + min

                                            const now = mounted ? new Date() : new Date(0)
                                            // Current Malaysia Time (MYT) in minutes
                                            const nowMYT = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
                                            const currentMinutes = getMinutes(nowMYT.getHours(), nowMYT.getMinutes())

                                            // Cutoff time in minutes
                                            const [cutoffH, cutoffM] = meal.cutoff.split(':').map(Number)
                                            const cutoffMinutes = getMinutes(cutoffH, cutoffM)

                                            const isToday = meal.date === todayMYT
                                            const isCutoff = isToday && currentMinutes > cutoffMinutes

                                            // Only show 'Closed' for Today. Tomorrow is always open for pre-booking.
                                            const displayStatus = isSoldOut ? 'Sold Out' : (isToday && isCutoff) ? 'Closed' : selectedDay === 'tomorrow' ? 'Pre-book Now 🗓️' : 'Reserve'
                                            const isDisabled = isSoldOut || (isToday && isCutoff) || loading

                                            return (
                                                <motion.div key={meal.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                                                    <Card className={cn(
                                                        "group relative overflow-hidden transition-all",
                                                        isDisabled ? "grayscale opacity-60" : "hover:border-primary/50 cursor-pointer shadow-md hover:shadow-xl"
                                                    )}>
                                                        <CardHeader className="p-5 pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <Badge className="mb-2 bg-primary/10 text-primary border-none font-black text-[10px] uppercase">
                                                                        {vendor?.name}
                                                                    </Badge>
                                                                    <CardTitle className="text-xl font-bold">{meal.meal_name}</CardTitle>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-2xl font-black text-primary">{meal.credit_cost || 1}</span>
                                                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Credit{(meal.credit_cost || 1) !== 1 ? 's' : ''}</p>
                                                                </div>
                                                            </div>
                                                        </CardHeader>

                                                        {/* Pickup Time Selection */}
                                                        {!isDisabled && (
                                                            <CardContent className="p-5 pt-0 space-y-3">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Pickup Time</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'].map(time => (
                                                                        <button
                                                                            key={time}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedPickupTimes(prev => ({ ...prev, [meal.id]: time }));
                                                                            }}
                                                                            className={cn(
                                                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2",
                                                                                selectedPickupTimes[meal.id] === time
                                                                                    ? "bg-primary text-white border-primary shadow-md scale-105"
                                                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30"
                                                                            )}
                                                                        >
                                                                            {time}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </CardContent>
                                                        )}
                                                        <CardFooter className="p-5 pt-0 flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-slate-600">{meal.remaining}/{meal.limit} slots left</span>
                                                            </div>
                                                            <Button
                                                                disabled={isDisabled || !selectedPickupTimes[meal.id]}
                                                                onClick={() => handleReserve(meal.id)}
                                                                size="sm"
                                                                className={cn(
                                                                    "rounded-full px-6 font-bold group-hover:scale-105 transition-all shadow-lg shadow-primary/20",
                                                                    selectedDay === 'tomorrow' ? "bg-blue-600 hover:bg-blue-700" : ""
                                                                )}
                                                            >
                                                                {!selectedPickupTimes[meal.id] && !isDisabled ? 'Choose Time' : displayStatus}
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                </motion.div>
                                            )
                                        })}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* History Section */}
                    <section className="space-y-4 pt-8 border-t">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            Your History <History className="h-5 w-5 text-slate-400" />
                        </h2>
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            {allReservations.filter(r => r.user_id === user.id).length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic text-sm">No reservations yet.</div>
                            ) : (
                                <div className="divide-y">
                                    {allReservations
                                        .filter(r => r.user_id === user.id)
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((res) => (
                                            <div key={res.id} className="p-4 flex items-center justify-between text-sm">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900">{res.date}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{res.voucher} • {res.pickup_time}</p>
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "font-bold uppercase text-[10px]",
                                                    res.status === 'redeemed' ? "bg-green-50 text-green-600 border-green-200" : "bg-blue-50 text-blue-600 border-blue-200"
                                                )}>
                                                    {res.status}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )
            }
        </div >
    )
}
