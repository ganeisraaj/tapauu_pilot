'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '@/components/ui-base'
import { updateUserAction, updateMealAction, createMealAction, deleteMealAction, redeemAction, createUserAction, createVendorAction, deleteVendorAction, deleteUserAction, updateVendorAction, deleteReservationAction } from '../actions'
import { DailyMeal, Vendor, Reservation, User } from '@/lib/db'
import { Users, LayoutDashboard, Settings, ListChecks, Search, Save, Check, X, TrendingUp, AlertCircle, Trash2, Utensils, LogOut, UserPlus, Store, Edit3, Globe, Sparkles, ArrowRight, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { University } from '@/lib/db'

const FloatingOrb = ({ className, style }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('absolute rounded-full blur-3xl opacity-20 animate-pulse', className)} style={style} />
)

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => {
    const colors: any = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
    }

    return (
        <div className={cn("bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-6 relative overflow-hidden group hover:bg-white/[0.08] transition-all", colors[color])}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", colors[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{title}</p>
                <p className="text-[9px] font-medium text-white/20 mt-2">{sub}</p>
            </div>
        </div>
    )
}

export default function AdminDashboard({
    users,
    vendors,
    meals,
    reservations,
    universities = []
}: {
    users: User[],
    vendors: Vendor[],
    meals: DailyMeal[],
    reservations: Reservation[],
    universities?: University[]
}) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'vendors' | 'meals' | 'reservations'>('stats')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [passcode, setPasscode] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [editingMeal, setEditingMeal] = useState<string | null>(null)
    const [addingToVendor, setAddingToVendor] = useState<string | null>(null)
    const [isAddingUser, setIsAddingUser] = useState(false)
    const [isAddingVendor, setIsAddingVendor] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', tapauu_id: '', phone: '', credits: '0', university_id: '' })
    const [newVendor, setNewVendor] = useState({ name: '', code: '', university_id: '' })
    const [editForm, setEditForm] = useState({ meal_name: '', cutoff: '', limit: '20', credit_cost: '1' })
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [editingCredits, setEditingCredits] = useState<{ [userId: string]: string }>({})
    const [selectedUniversity, setSelectedUniversity] = useState<string>('all')

    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
        setMounted(true)
        // Always require passcode — no persistent session
    }, [])

    const ADMIN_PASSCODE = "tapauu-pilot" // Keep same value but rename UI context

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault()
        if (passcode === ADMIN_PASSCODE) {
            setIsAuthorized(true)
        } else {
            alert("Invalid Admin Passcode")
        }
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[hsl(20,20%,10%)] flex items-center justify-center p-6 relative overflow-hidden">
                <FloatingOrb className="w-96 h-96 bg-primary top-[-80px] left-[-80px]" />
                <FloatingOrb className="w-64 h-64 bg-orange-400 bottom-[-40px] right-[10%]" style={{ animationDelay: '1s' }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex p-5 bg-white/5 rounded-3xl mb-6 border border-white/10 backdrop-blur-xl shadow-2xl">
                            <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">RESTRICTED ACCESS</h1>
                        <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">TAPAUU Management Console</p>
                    </div>

                    <div className="bg-white/[0.06] border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/40">
                        <div className="mb-8 text-center">
                            <h2 className="text-xl font-black text-white mb-2">Passcode Required</h2>
                            <p className="text-white/40 text-sm font-medium">Enter your credentials to unlock the dashboard.</p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-8">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passcode}
                                    onChange={e => setPasscode(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white text-center font-mono text-3xl h-20 rounded-2xl focus:ring-primary focus:border-primary placeholder:text-white/5"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full h-16 font-black text-lg bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                            >
                                Authenticate
                            </button>
                            <p className="text-center text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">
                                SECURE TERMINAL · L2 ENCRYPTION
                            </p>
                        </form>
                    </div>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full mt-10 text-white/20 hover:text-white/50 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                    >
                        ← Exit to Terminal
                    </button>
                </motion.div>
            </div>
        )
    }

    // Filtered data based on selected university
    const filteredUsers = selectedUniversity === 'all' ? users : users.filter(u => u.university_id === selectedUniversity)
    const filteredVendors = selectedUniversity === 'all' ? vendors : vendors.filter(v => v.university_id === selectedUniversity)
    const filteredVendorIds = new Set(filteredVendors.map(v => v.id))
    const filteredMeals = selectedUniversity === 'all' ? meals : meals.filter(m => filteredVendorIds.has(m.vendor_id))
    const filteredReservations = selectedUniversity === 'all' ? reservations : reservations.filter(r => filteredVendorIds.has(r.vendor_id))

    const stats = {
        totalUsers: filteredUsers.length,
        totalReservations: filteredReservations.length,
        totalRedeemed: filteredReservations.filter(r => r.status === 'redeemed').length,
        noShows: filteredReservations.filter(r => r.status === 'reserved').length,
        activeUserPercentage: filteredUsers.length > 0 ? Math.round((filteredUsers.filter(u => u.active).length / filteredUsers.length) * 100) : 0
    }

    const handleUpdateStatus = async (userId: string, active: boolean) => {
        setLoading(true)
        await updateUserAction(userId, { active })
        router.refresh()
        setLoading(false)
    }

    const handleSetCredits = async (userId: string, newCredits: number) => {
        if (isNaN(newCredits) || newCredits < 0) return
        setLoading(true)
        await updateUserAction(userId, { credits: newCredits })
        setEditingCredits(prev => { const n = { ...prev }; delete n[userId]; return n })
        router.refresh()
        setLoading(false)
    }

    const handleUpdateMeal = async (mealId: string) => {
        setLoading(true)
        const res = await updateMealAction(mealId, {
            ...editForm,
            limit: parseInt(String(editForm.limit)) || 20,
            credit_cost: parseFloat(String(editForm.credit_cost)) || 1
        })
        if (res.success) {
            setEditingMeal(null)
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    const handleCreateMeal = async (vendorId: string) => {
        setLoading(true)
        const res = await createMealAction({
            date: selectedDate,
            vendor_id: vendorId,
            meal_name: editForm.meal_name || "New Meal",
            limit: parseInt(String(editForm.limit)) || 20,
            cutoff: editForm.cutoff || "11:05",
            remaining: parseInt(String(editForm.limit)) || 20,
            credit_cost: parseFloat(String(editForm.credit_cost)) || 1
        })
        if (res.success) {
            setAddingToVendor(null)
            router.refresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    const handleDeleteMeal = async (mealId: string) => {
        if (!confirm("Are you sure you want to remove this meal option?")) return
        setLoading(true)
        const res = await deleteMealAction(mealId)
        if (res.success) {
            router.refresh()
        } else {
            alert((res as any).error || "Failed to delete")
        }
        setLoading(false)
    }

    const startEditing = (meal: DailyMeal) => {
        setEditingMeal(meal.id)
        setEditForm({ meal_name: meal.meal_name, cutoff: meal.cutoff, limit: String(meal.limit), credit_cost: String(meal.credit_cost ?? 1) })
    }

    const startAdding = (vendorId: string) => {
        setAddingToVendor(vendorId)
        setEditForm({ meal_name: '', cutoff: '11:05', limit: '20', credit_cost: '1' })
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createUserAction({
            ...newUser,
            credits: parseFloat(newUser.credits) || 0,
            university_id: newUser.university_id || selectedUniversity !== 'all' ? (newUser.university_id || selectedUniversity) : undefined
        })
        if (res.success) {
            setIsAddingUser(false)
            setNewUser({ name: '', tapauu_id: '', phone: '', credits: '10', university_id: '' })
            router.refresh()
        } else {
            alert((res as any).error)
        }
        setLoading(false)
    }

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Ensure university is selected if 'all' is currently filtered
        const finalUniId = newVendor.university_id || (selectedUniversity !== 'all' ? selectedUniversity : (universities[0]?.id || ''))

        if (!finalUniId) {
            alert("No university available to assign vendor to.")
            setLoading(false)
            return
        }

        const res = await createVendorAction({
            ...newVendor,
            university_id: finalUniId
        })
        if (res.success) {
            setIsAddingVendor(false)
            setNewVendor({ name: '', code: '', university_id: '' })
            router.refresh()
        } else {
            alert((res as any).error)
        }
        setLoading(false)
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure? This user will be permanently removed.')) return
        setLoading(true)
        const res = await deleteUserAction(userId)
        if (res.success) router.refresh()
        setLoading(false)
    }

    const handleDeleteVendor = async (vendorId: string) => {
        if (!confirm('Are you sure? This vendor and their code will be removed.')) return
        setLoading(true)
        const res = await deleteVendorAction(vendorId)
        if (res.success) router.refresh()
        else alert((res as any).error)
        setLoading(false)
    }

    const handleRedeem = async (voucher: string) => {
        setLoading(true)
        const res = await redeemAction(voucher)
        if (!res.success) alert(res.error)
        setLoading(false)
    }

    const handleDeleteReservation = async (reservationId: string) => {
        if (!confirm('Are you sure you want to delete this booking? Credits will be refunded and the meal slot will be restored.')) return
        setLoading(true)
        const res = await deleteReservationAction(reservationId)
        if (!res.success) alert(res.error)
        router.refresh()
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[hsl(20,20%,10%)] relative overflow-x-hidden text-white pb-20">
            {/* Animated Background Elements */}
            <FloatingOrb className="w-[600px] h-[600px] bg-primary/10 top-[-300px] right-[-100px]" />
            <FloatingOrb className="w-[400px] h-[400px] bg-orange-400/5 bottom-[-100px] left-[-100px]" style={{ animationDelay: '2s' }} />

            <div className="container max-w-6xl mx-auto p-4 py-12 space-y-12 relative z-10">
                {/* Admin Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Admin Terminal • v2026.4</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
                            Operations <span className="text-primary italic">Hub</span>.
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* University filter */}
                        {universities.length > 0 && (
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl">
                                <Globe className="h-4 w-4 text-primary" />
                                <select
                                    value={selectedUniversity}
                                    onChange={e => setSelectedUniversity(e.target.value)}
                                    className="text-xs font-black text-white focus:outline-none bg-transparent cursor-pointer uppercase tracking-widest appearance-none"
                                >
                                    <option value="all" className="bg-[#1a1a1a]">All Campuses</option>
                                    {universities.map(u => (
                                        <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                localStorage.removeItem('tapauu_admin_auth')
                                setIsAuthorized(false)
                            }}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-all shadow-xl"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-[2rem] flex gap-1 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'stats', label: 'ANALYTICS', icon: LayoutDashboard },
                            { id: 'users', label: 'STUDENTS', icon: Users },
                            { id: 'vendors', label: 'VENDORS', icon: Store },
                            { id: 'meals', label: 'KITCHEN', icon: Settings },
                            { id: 'reservations', label: 'LOGBOOK', icon: ListChecks }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black transition-all tracking-[0.15em] whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/40"
                                        : "text-white/20 hover:text-white/40 hover:bg-white/5"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'stats' && (
                        <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatCard title="Total Students" value={stats.totalUsers} sub={selectedUniversity === 'all' ? 'All campuses' : 'This campus'} icon={Users} color="blue" />
                                <StatCard title="Bookings Today" value={stats.totalReservations} sub="Total across vendors" icon={TrendingUp} color="orange" />
                                <StatCard title="Meals Redeemed" value={stats.totalRedeemed} sub="Delivered to users" icon={Check} color="green" />
                                <StatCard title="No-Shows" value={stats.noShows} sub="Unclaimed bookings" icon={AlertCircle} color="red" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                            <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                                                <UserPlus className="h-5 w-5" />
                                            </div>
                                            Quick Actions
                                        </h3>
                                        <p className="text-white/30 text-sm font-medium mt-2">Manage your core network entities.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => { setActiveTab('users'); setIsAddingUser(true); }}
                                            className="h-24 flex flex-col items-center justify-center gap-2 font-black transition-all bg-white text-black rounded-3xl hover:bg-white/90 shadow-2xl hover:scale-[1.02]"
                                        >
                                            <UserPlus className="h-5 w-5" />
                                            ADD STUDENT
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('vendors'); setIsAddingVendor(true); }}
                                            className="h-24 flex flex-col items-center justify-center gap-2 font-black transition-all bg-white/5 border border-white/10 text-white rounded-3xl hover:bg-white/10 shadow-2xl hover:scale-[1.02]"
                                        >
                                            <Store className="h-5 w-5" />
                                            ADD VENDOR
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                            <div className="p-3 bg-white/5 rounded-2xl text-white/60 border border-white/10">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            Platform Nodes
                                        </h3>
                                        <p className="text-white/30 text-sm font-medium mt-2">Currently active university campuses.</p>
                                    </div>
                                    <div className="space-y-4">
                                        {universities.map(u => (
                                            <div key={u.id} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                                                <span className="font-black text-white text-xs tracking-widest uppercase">{u.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                    <span className="text-[10px] font-black text-white/20 uppercase">ACTIVE</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'vendors' && (
                        <motion.div key="vendors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-10 rounded-[2.5rem]">
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">Vendor Network</h3>
                                    <p className="text-white/20 text-xs font-medium mt-1 uppercase tracking-widest">Managing {filteredVendors.length} active nodes across campuses.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingVendor(true)}
                                    className="px-8 h-14 bg-white text-black font-black rounded-2xl hover:bg-white/90 shadow-xl flex items-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    <Store className="h-5 w-5" />
                                    BOOTSTRAP VENDOR
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredVendors.map(v => {
                                    const uni = universities.find(u => u.id === v.university_id)
                                    return (
                                        <div key={v.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col justify-between group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <Store className="w-24 h-24" />
                                            </div>
                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div>
                                                    <p className="font-black text-white leading-none text-xl uppercase tracking-tighter mb-2">{v.name}</p>
                                                    {uni && (
                                                        <div className="inline-flex px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-black text-primary uppercase tracking-[0.1em]">
                                                            {uni.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => handleDeleteVendor(v.id)} className="p-3 text-white/10 hover:text-red-500 transition-colors bg-white/5 rounded-xl hover:bg-red-500/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-6 relative z-10">
                                                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Voucher Code Prefix</p>
                                                    <p className="text-4xl font-black text-primary tracking-tighter">{v.code}</p>
                                                </div>

                                                <button
                                                    className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all text-white/40 shadow-xl"
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/vendor/${v.code}`
                                                        navigator.clipboard.writeText(url)
                                                        alert(`${v.name} access link copied to clipboard!`)
                                                    }}
                                                >
                                                    Copy Access Link
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            {isAddingUser && (
                                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <UserPlus className="w-32 h-32" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Register New Student</h3>
                                        <p className="text-white/30 text-sm font-medium mt-2">Add a new learner to the TAPAUU network.</p>
                                    </div>

                                    <form onSubmit={handleCreateUser} className="grid md:grid-cols-6 gap-6 relative z-10">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest px-1">TAPAUU ID</label>
                                            <Input placeholder="STU999" className="bg-white/5 border-white/10 text-white rounded-2xl h-12" value={newUser.tapauu_id} onChange={e => setNewUser({ ...newUser, tapauu_id: e.target.value.toUpperCase() })} required />
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest px-1">Full Name</label>
                                            <Input placeholder="John Doe" className="bg-white/5 border-white/10 text-white rounded-2xl h-12" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest px-1">Credits</label>
                                            <Input type="number" step="any" className="bg-white/5 border-white/10 text-white rounded-2xl h-12" value={newUser.credits} onChange={e => setNewUser({ ...newUser, credits: e.target.value })} />
                                        </div>
                                        {universities.length > 0 && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest px-1">University</label>
                                                <select
                                                    className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none appearance-none"
                                                    value={newUser.university_id || selectedUniversity}
                                                    onChange={e => setNewUser({ ...newUser, university_id: e.target.value })}
                                                >
                                                    {universities.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-end gap-2">
                                            <button type="submit" className="flex-1 h-12 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all" disabled={loading}>SAVE</button>
                                            <button type="button" className="h-12 px-4 text-white/30 hover:text-white font-black text-[10px] uppercase tracking-widest" onClick={() => setIsAddingUser(false)}>CANCEL</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                                <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Student Directory</h3>
                                        <p className="text-white/20 text-xs font-medium mt-1">Total active users on the platform.</p>
                                    </div>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="FILTER BY ID OR NAME..."
                                            className="pl-12 w-full md:w-[300px] bg-white/5 border-white/10 text-white rounded-2xl h-14 placeholder:text-white/10 text-[10px] font-black tracking-widest"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">IDENTIFICATION</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">CURRENT BALANCE</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ACCOUNT STATUS</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">OPERATIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {users.filter(u => u.tapauu_id.includes(searchTerm.toUpperCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="font-black text-white text-lg tracking-tight leading-none mb-2">{user.name}</div>
                                                        <div className="inline-flex px-2 py-0.5 rounded text-[8px] font-black bg-white/5 text-white/30 border border-white/10 tracking-[0.2em] uppercase">{user.tapauu_id}</div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                className="w-20 h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-black text-white text-center focus:outline-none focus:border-primary transition-all group-hover:bg-white/10"
                                                                value={editingCredits[user.id] !== undefined ? editingCredits[user.id] : user.credits}
                                                                onChange={e => setEditingCredits(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                                onBlur={() => handleSetCredits(user.id, parseFloat(editingCredits[user.id] !== undefined ? editingCredits[user.id] : String(user.credits)))}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleSetCredits(user.id, parseFloat(editingCredits[user.id] !== undefined ? editingCredits[user.id] : String(user.credits))) }}
                                                                disabled={loading}
                                                            />
                                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">CR</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                            user.active
                                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                                : "bg-white/5 text-white/20 border-white/10"
                                                        )}>
                                                            {user.active ? 'Operational' : 'Restricted'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStatus(user.id, !user.active)}
                                                                className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                                            >
                                                                {user.active ? 'Disable' : 'Restore'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'meals' && (
                        <motion.div key="meals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] border border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem]">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Kitchen Scheduler</h3>
                                    <p className="text-white/20 text-xs font-medium mt-1">Configure daily meal names and capacity limits.</p>
                                </div>
                                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate)
                                            d.setDate(d.getDate() - 1)
                                            setSelectedDate(d.toISOString().split('T')[0])
                                        }}
                                        className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
                                    >
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                    </button>
                                    <span className="font-black text-[10px] text-white tracking-[0.3em] uppercase px-4">{selectedDate}</span>
                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate)
                                            d.setDate(d.getDate() + 1)
                                            setSelectedDate(d.toISOString().split('T')[0])
                                        }}
                                        className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {filteredVendors.map(vendor => {
                                    const meal = filteredMeals.find(m => m.date === selectedDate && m.vendor_id === vendor.id)

                                    return (
                                        <div key={vendor.id} className={cn(
                                            "relative bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 transition-all overflow-hidden flex flex-col",
                                            !meal && "border-dashed border-white/5 bg-transparent"
                                        )}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">{vendor.name}</div>
                                                {meal && (
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{meal.cutoff} CUTOFF</div>
                                                        <div className="text-[10px] font-black text-orange-400/60 uppercase tracking-widest">{meal.credit_cost ?? 1} CREDIT{(meal.credit_cost ?? 1) !== 1 ? 'S' : ''}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="text-2xl font-black text-white tracking-tight mb-8 min-h-[3rem]">
                                                {meal ? meal.meal_name : "NO SERVICE"}
                                            </h4>

                                            <div className="flex-grow">
                                                {editingMeal === meal?.id ? (
                                                    <div className="space-y-6 pt-2">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Meal Title</label>
                                                            <Input className="bg-white/5 border-white/10 text-white rounded-xl h-11" value={editForm.meal_name} onChange={e => setEditForm({ ...editForm, meal_name: e.target.value })} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Slots</label>
                                                                <Input type="number" className="bg-white/5 border-white/10 text-white rounded-xl h-11" value={editForm.limit} onChange={e => setEditForm({ ...editForm, limit: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Cutoff</label>
                                                                <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white appearance-none" value={editForm.cutoff} onChange={e => setEditForm({ ...editForm, cutoff: e.target.value })}>
                                                                    {["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:05", "11:30", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdateMeal(meal!.id)} className="flex-1 h-12 bg-white text-black font-black rounded-xl hover:bg-white/90 transition-all text-xs">SAVE</button>
                                                            <button onClick={() => setEditingMeal(null)} className="px-4 text-white/20 font-black text-[9px] uppercase tracking-widest">CANCEL</button>
                                                        </div>
                                                    </div>
                                                ) : addingToVendor === vendor.id ? (
                                                    <div className="space-y-6 pt-2">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Dish Name</label>
                                                            <Input className="bg-white/5 border-white/10 text-white rounded-xl h-11" placeholder="e.g. Tomato Pasta" value={editForm.meal_name} onChange={e => setEditForm({ ...editForm, meal_name: e.target.value })} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Total Slots</label>
                                                                <Input type="number" className="bg-white/5 border-white/10 text-white rounded-xl h-11" value={editForm.limit} onChange={e => setEditForm({ ...editForm, limit: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Cutoff</label>
                                                                <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white appearance-none" value={editForm.cutoff} onChange={e => setEditForm({ ...editForm, cutoff: e.target.value })}>
                                                                    {["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:05", "11:30", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleCreateMeal(vendor.id)} className="flex-1 h-12 bg-white text-black font-black rounded-xl hover:bg-white/90 transition-all text-xs">CREATE</button>
                                                            <button onClick={() => setAddingToVendor(null)} className="px-4 text-white/20 font-black text-[9px] uppercase tracking-widest">CANCEL</button>
                                                        </div>
                                                    </div>
                                                ) : meal ? (
                                                    <div className="space-y-8">
                                                        <div className="p-6 bg-black/20 rounded-3xl border border-white/5 text-center">
                                                            <div className="text-3xl font-black text-white mb-1">{meal.remaining}</div>
                                                            <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">AVAILABILITY / {meal.limit} MAX</div>
                                                            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${(meal.remaining / meal.limit) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={() => startEditing(meal)} className="flex-1 h-12 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all text-[10px] tracking-widest">MODIFY</button>
                                                            <button onClick={() => handleDeleteMeal(meal.id)} className="h-12 px-5 bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-10 text-center flex flex-col items-center gap-6">
                                                        <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-white/10">
                                                            <Utensils className="h-8 w-8" />
                                                        </div>
                                                        <button
                                                            onClick={() => startAdding(vendor.id)}
                                                            className="w-full py-4 rounded-xl border border-dashed border-primary/40 text-primary font-black text-[10px] tracking-widest hover:bg-primary/5 transition-all"
                                                        >
                                                            ACTIVATE FOR {vendor.name.toUpperCase()}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'reservations' && (
                        <motion.div key="reservations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                                <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Reservation Logbook</h3>
                                        <p className="text-white/20 text-xs font-medium mt-1">Real-time tracker for platform bookings.</p>
                                    </div>
                                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">
                                        {reservations.length} TOTAL ENTRIES
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">IDENTIFIER</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">RECIPIENT & SOURCE</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">LOG STATUS</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">CONTROLS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {filteredReservations.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(res => {
                                                const user = filteredUsers.find(u => u.id === res.user_id)
                                                const vendor = filteredVendors.find(v => v.id === res.vendor_id)
                                                return (
                                                    <tr key={res.id} className={cn("hover:bg-white/[0.02] transition-colors group", res.status === 'redeemed' && "bg-green-500/[0.02]")}>
                                                        <td className="px-10 py-8">
                                                            <div className="font-black text-primary text-xl tracking-tighter leading-none mb-1">{res.voucher}</div>
                                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(res.created_at).toLocaleTimeString()} · TS-L2</div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="font-black text-white text-md leading-none mb-2">{user?.name}</div>
                                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                                {user?.tapauu_id} <ArrowRight className="h-2 w-2" /> {vendor?.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                res.status === 'redeemed'
                                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                                    : "bg-primary/10 text-primary border-primary/20"
                                                            )}>
                                                                {res.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex justify-end gap-3">
                                                                {res.status === 'reserved' ? (
                                                                    <button onClick={() => handleRedeem(res.voucher)} className="px-5 py-2 bg-white text-black rounded-xl font-black text-[9px] tracking-widest hover:scale-105 transition-all">REDEEM</button>
                                                                ) : (
                                                                    <div className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                                                                        <Check className="h-4 w-4" />
                                                                    </div>
                                                                )}
                                                                <button onClick={() => handleDeleteReservation(res.id)} className="p-3 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vendor Modal (Overlay) */}
                <AnimatePresence>
                    {isAddingVendor && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
                                <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/20 blur-3xl rounded-full" />

                                    <div className="relative z-10 space-y-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                                <Store className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-white">Bootstrap Vendor</h3>
                                            <p className="text-white/30 text-sm font-medium mt-2">Introduce a new kitchen to the network.</p>
                                        </div>

                                        <form onSubmit={handleCreateVendor} className="space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Business Name</label>
                                                <Input placeholder="e.g. Spice Garden" className="bg-white/5 border-white/10 text-white rounded-2xl h-14" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Unique Identifier (1 Letter)</label>
                                                <Input placeholder="D" maxLength={1} className="bg-white/5 border-white/10 text-white rounded-2xl h-14 text-center text-2xl font-black font-mono" value={newVendor.code} onChange={e => setNewVendor({ ...newVendor, code: e.target.value.toUpperCase() })} required />
                                                <p className="text-[9px] text-white/20 text-center font-bold tracking-widest uppercase mt-2">Example: D-VOUCHER-01</p>
                                            </div>
                                            {universities.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black text-white/20 tracking-widest px-1">Host University</label>
                                                    <select
                                                        className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none appearance-none"
                                                        value={newVendor.university_id || (selectedUniversity !== 'all' ? selectedUniversity : (universities[0]?.id || ''))}
                                                        onChange={e => setNewVendor({ ...newVendor, university_id: e.target.value })}
                                                    >
                                                        {universities.map(u => <option key={u.id} value={u.id} className="bg-[#1a1a1a]">{u.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="flex gap-2 pt-4">
                                                <button type="submit" className="flex-1 h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest" disabled={loading}>BOOTSTRAP</button>
                                                <button type="button" onClick={() => setIsAddingVendor(false)} className="px-6 text-white/30 font-black text-[10px] uppercase tracking-widest">CANCEL</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
