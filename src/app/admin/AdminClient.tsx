'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '@/components/ui-base'
import { updateUserAction, updateMealAction, createMealAction, deleteMealAction, redeemAction, createUserAction, createVendorAction, deleteVendorAction, deleteUserAction, updateVendorAction } from '../actions'
import { DailyMeal, Vendor, Reservation, User } from '@/lib/db'
import { Users, LayoutDashboard, Settings, ListChecks, Search, Save, Check, X, TrendingUp, AlertCircle, Trash2, Utensils, LogOut, UserPlus, Store, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function AdminDashboard({
    users,
    vendors,
    meals,
    reservations
}: {
    users: User[],
    vendors: Vendor[],
    meals: DailyMeal[],
    reservations: Reservation[]
}) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'meals' | 'reservations'>('stats')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [passcode, setPasscode] = useState('')
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [editingMeal, setEditingMeal] = useState<string | null>(null)
    const [addingToVendor, setAddingToVendor] = useState<string | null>(null)
    const [isAddingVolunteer, setIsAddingVolunteer] = useState(false)
    const [isAddingVendor, setIsAddingVendor] = useState(false)
    const [newVolunteer, setNewVolunteer] = useState({ name: '', tapauu_id: '', phone: '', credits: '10' })
    const [newVendor, setNewVendor] = useState({ name: '', code: '' })
    const [editForm, setEditForm] = useState({ meal_name: '', cutoff: '', limit: '20', credit_cost: '1' })
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [editingCredits, setEditingCredits] = useState<{ [userId: string]: string }>({})

    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
        setMounted(true)
        // Always require passcode — no persistent session
    }, [])

    const ADMIN_PASSCODE = "tapauu-pilot" // Simple passcode for pilot

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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,59,48,0.1),transparent_50%)]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4 border border-primary/20 backdrop-blur-xl">
                            <Utensils className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">TAPAUU ADMIN</h1>
                        <p className="text-slate-400 font-medium">Restricted Access • Pilot Phase</p>
                    </div>

                    <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-white">Passcode Required</CardTitle>
                            <CardDescription className="text-slate-400">Enter the secret key to unlock the command center.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAuth} className="space-y-6">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passcode}
                                        onChange={e => setPasscode(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white text-center font-mono text-2xl h-16 focus:ring-primary focus:border-primary placeholder:text-white/10"
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    Unlock Dashboard
                                </Button>
                                <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                    Encrypted Connection • Authorized Personnel Only
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full mt-6 text-slate-500 hover:text-white text-sm font-bold transition-colors"
                    >
                        ← Return to Volunteer Site
                    </button>
                </motion.div>
            </div>
        )
    }

    const stats = {
        totalUsers: users.length,
        totalReservations: reservations.length,
        totalRedeemed: reservations.filter(r => r.status === 'redeemed').length,
        noShows: reservations.filter(r => r.status === 'reserved').length,
        activeVolunteerPercentage: Math.round((users.filter(u => u.active).length / users.length) * 100)
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

    const handleCreateVolunteer = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createUserAction({
            ...newVolunteer,
            credits: parseFloat(newVolunteer.credits) || 0
        })
        if (res.success) {
            setIsAddingVolunteer(false)
            setNewVolunteer({ name: '', tapauu_id: '', phone: '', credits: '10' })
            router.refresh()
        } else {
            alert((res as any).error)
        }
        setLoading(false)
    }

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createVendorAction(newVendor)
        if (res.success) {
            setIsAddingVendor(false)
            setNewVendor({ name: '', code: '' })
            router.refresh()
        } else {
            alert((res as any).error)
        }
        setLoading(false)
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure? This volunteer will be permanently removed.')) return
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

    return (
        <div className="container mx-auto p-4 py-8 space-y-8">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 font-medium">Control center for TAPAUU Pilot Program.</p>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:text-red-500" onClick={() => {
                        localStorage.removeItem('tapauu_admin_auth')
                        setIsAuthorized(false)
                    }}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[
                        { id: 'stats', label: 'Stats', icon: LayoutDashboard },
                        { id: 'users', label: 'Volunteers', icon: Users },
                        { id: 'meals', label: 'Daily Meals', icon: Settings },
                        { id: 'reservations', label: 'Log', icon: ListChecks }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
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
                    <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="grid md:grid-cols-4 gap-6">
                            <StatCard title="Total Volunteers" value={stats.totalUsers} sub="15-20 Target" icon={Users} color="blue" />
                            <StatCard title="Bookings Today" value={stats.totalReservations} sub="Total pilot period" icon={TrendingUp} color="orange" />
                            <StatCard title="Meals Redeemed" value={stats.totalRedeemed} sub="Delivered to users" icon={Check} color="green" />
                            <StatCard title="No-Shows" value={stats.noShows} sub="Reserved but not used" icon={AlertCircle} color="red" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="p-2 bg-primary rounded-lg text-white">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription>Main management controls for the pilot.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => { setActiveTab('users'); setIsAddingVolunteer(true); }} className="h-16 flex flex-col gap-1 font-black shadow-lg shadow-primary/20">
                                        <UserPlus className="h-5 w-5" />
                                        Add Volunteer
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsAddingVendor(true)} className="h-16 flex flex-col gap-1 font-black border-2 border-slate-900">
                                        <Store className="h-5 w-5" />
                                        Add Vendor
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ListChecks className="h-5 w-5 text-primary" /> Vendor Pilot Links
                                    </CardTitle>
                                    <CardDescription>Share these secret links with each individual food vendor.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    {vendors.map(v => (
                                        <div key={v.id} className="p-3 bg-white rounded-xl border flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-black text-slate-900 leading-none text-xs">{v.name}</p>
                                                    <p className="text-[10px] font-black text-primary mt-1">Code: {v.code}</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleDeleteVendor(v.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button size="sm" variant="outline" className="w-full h-7 text-[10px] font-bold" onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/vendor/${v.code}`)
                                                alert(`${v.name} link copied!`)
                                            }}>Copy Link</Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {isAddingVolunteer && (
                            <Card className="border-2 border-primary ring-4 ring-primary/10">
                                <CardHeader>
                                    <CardTitle>Register New Volunteer</CardTitle>
                                    <CardDescription>Add a new student to the pilot program.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateVolunteer} className="grid md:grid-cols-5 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">TAPAUU ID</label>
                                            <Input placeholder="STU999" value={newVolunteer.tapauu_id} onChange={e => setNewVolunteer({ ...newVolunteer, tapauu_id: e.target.value.toUpperCase() })} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">Full Name</label>
                                            <Input placeholder="John Doe" value={newVolunteer.name} onChange={e => setNewVolunteer({ ...newVolunteer, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">Phone</label>
                                            <Input placeholder="012-3456789" value={newVolunteer.phone} onChange={e => setNewVolunteer({ ...newVolunteer, phone: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">Credits</label>
                                            <Input type="number" step="any" value={newVolunteer.credits} onChange={e => setNewVolunteer({ ...newVolunteer, credits: e.target.value })} />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <Button type="submit" className="flex-1 font-black" disabled={loading}>Save Volunteer</Button>
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingVolunteer(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg">Volunteer Management</CardTitle>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search ID/Name..."
                                        className="pl-9 w-[200px]"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 border-t">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                                <th className="p-4">Volunteer</th>
                                                <th className="p-4">Credits</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {users.filter(u => u.tapauu_id.includes(searchTerm.toUpperCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                                <tr key={user.id} className="hover:bg-slate-50/50">
                                                    <td className="p-4">
                                                        <div className="font-bold">{user.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{user.tapauu_id}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                className="w-16 h-7 border border-slate-200 rounded px-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                                value={editingCredits[user.id] !== undefined ? editingCredits[user.id] : user.credits}
                                                                onChange={e => setEditingCredits(prev => ({ ...prev, [user.id]: e.target.value }))}
                                                                onBlur={() => handleSetCredits(user.id, parseFloat(editingCredits[user.id] !== undefined ? editingCredits[user.id] : String(user.credits)))}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleSetCredits(user.id, parseFloat(editingCredits[user.id] !== undefined ? editingCredits[user.id] : String(user.credits))) }}
                                                                disabled={loading}
                                                            />
                                                            <span className="text-xs text-slate-400 font-bold">cr</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                                            {user.active ? 'Active' : 'Disabled'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(user.id, !user.active)}>
                                                            {user.active ? 'Disable' : 'Enable'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'meals' && (
                    <motion.div key="meals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Daily Meals & Limits <Badge className="bg-primary text-white">Pilot Window: Mar 23 - Apr 01</Badge>
                            </h2>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => {
                                    const d = new Date(selectedDate)
                                    d.setDate(d.getDate() - 1)
                                    setSelectedDate(d.toISOString().split('T')[0])
                                }}>← Previous</Button>
                                <span className="font-mono font-bold bg-slate-100 px-4 py-2 rounded-lg">{selectedDate}</span>
                                <Button variant="outline" size="sm" onClick={() => {
                                    const d = new Date(selectedDate)
                                    d.setDate(d.getDate() + 1)
                                    setSelectedDate(d.toISOString().split('T')[0])
                                }}>Next →</Button>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {vendors.map(vendor => {
                                const meal = meals.find(m => m.date === selectedDate && m.vendor_id === vendor.id)

                                return (
                                    <Card key={vendor.id} className={cn(
                                        "relative border-2 transition-all",
                                        meal ? "border-slate-200" : "border-dashed border-slate-200 bg-slate-50/50"
                                    )}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <Badge className="bg-primary/10 text-primary border-none">{vendor.name}</Badge>
                                                <div className="flex flex-col items-end gap-1">
                                                    {meal && <span className="text-[10px] font-black uppercase text-slate-400">{meal.cutoff} Cutoff</span>}
                                                    {meal && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">💳 {meal.credit_cost ?? 1} credit{(meal.credit_cost ?? 1) !== 1 ? 's' : ''}</span>}
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl mt-2">
                                                {meal ? meal.meal_name : "Empty Slot"}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {editingMeal === meal?.id ? (
                                                <div className="space-y-4 pt-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Meal Name</label>
                                                        <Input
                                                            value={editForm.meal_name}
                                                            onChange={e => setEditForm({ ...editForm, meal_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Slots</label>
                                                            <Input
                                                                type="number"
                                                                value={editForm.limit}
                                                                onChange={e => setEditForm({ ...editForm, limit: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Credits</label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                value={editForm.credit_cost}
                                                                onChange={e => setEditForm({ ...editForm, credit_cost: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Cutoff</label>
                                                            <select
                                                                className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                                value={editForm.cutoff}
                                                                onChange={e => setEditForm({ ...editForm, cutoff: e.target.value })}
                                                            >
                                                                {["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:05", "11:30", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => (
                                                                    <option key={t} value={t}>{t}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleUpdateMeal(meal!.id)} disabled={loading} className="flex-1">Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingMeal(null)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : addingToVendor === vendor.id ? (
                                                <div className="space-y-4 pt-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">New Meal Name</label>
                                                        <Input
                                                            placeholder="e.g. Tomato Pasta"
                                                            value={editForm.meal_name}
                                                            onChange={e => setEditForm({ ...editForm, meal_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Slots</label>
                                                            <Input
                                                                type="number"
                                                                value={editForm.limit}
                                                                onChange={e => setEditForm({ ...editForm, limit: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Credits</label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                value={editForm.credit_cost}
                                                                onChange={e => setEditForm({ ...editForm, credit_cost: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase font-black text-slate-400">Cutoff</label>
                                                            <select
                                                                className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                                value={editForm.cutoff}
                                                                onChange={e => setEditForm({ ...editForm, cutoff: e.target.value })}
                                                            >
                                                                {["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "11:05", "11:30", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => (
                                                                    <option key={t} value={t}>{t}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleCreateMeal(vendor.id)} disabled={loading} className="flex-1">Add Meal</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setAddingToVendor(null)}>Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : meal ? (
                                                <>
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Progress</span>
                                                            <span className="font-black text-primary">{meal.remaining} / {meal.limit} Left</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${(meal.remaining / meal.limit) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 font-bold h-10 border-slate-300"
                                                            onClick={() => startEditing(meal)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-300 hover:text-red-500"
                                                            onClick={() => handleDeleteMeal(meal.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-6 text-center space-y-4">
                                                    <div className="p-3 bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-300 border border-dashed">
                                                        <Utensils className="h-6 w-6" />
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full h-10 border-dashed border-primary/40 text-primary hover:bg-primary/5" onClick={() => startAdding(vendor.id)}>
                                                        Add Meal for {vendor.name}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'reservations' && (
                    <motion.div key="reservations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Real-time Bookings</CardTitle>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total: {reservations.length}</div>
                            </CardHeader>
                            <CardContent className="p-0 border-t">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                                <th className="p-4">Voucher</th>
                                                <th className="p-4">Volunteer</th>
                                                <th className="p-4">Vendor</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Redeem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {reservations.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(res => {
                                                const user = users.find(u => u.id === res.user_id)
                                                const vendor = vendors.find(v => v.id === res.vendor_id)
                                                return (
                                                    <tr key={res.id} className={cn("hover:bg-slate-50/50", res.status === 'redeemed' ? "bg-green-50/20" : "")}>
                                                        <td className="p-4 font-mono font-bold text-primary">{res.voucher}</td>
                                                        <td className="p-4">
                                                            <div className="font-semibold">{user?.name}</div>
                                                            <div className="text-[10px] text-slate-400">{user?.tapauu_id}</div>
                                                        </td>
                                                        <td className="p-4 font-medium">{vendor?.name}</td>
                                                        <td className="p-4">
                                                            <Badge className={cn(
                                                                "font-bold uppercase text-[9px]",
                                                                res.status === 'redeemed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {res.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {res.status === 'reserved' ? (
                                                                <Button size="sm" onClick={() => handleRedeem(res.voucher)} className="h-8">Mark Done</Button>
                                                            ) : (
                                                                <Check className="h-4 w-4 text-green-500 ml-auto" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vendor Modal (Overlay) */}
            <AnimatePresence>
                {isAddingVendor && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <Card className="w-full max-w-md shadow-2xl border-2 border-slate-900">
                                <CardHeader>
                                    <CardTitle>Add New Food Vendor</CardTitle>
                                    <CardDescription>Onboard a new vendor to the TAUPAUU network.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateVendor} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">Vendor Business Name</label>
                                            <Input placeholder="e.g. Spice Garden" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400">Vendor Code (1 Letter)</label>
                                            <Input placeholder="D" maxLength={1} value={newVendor.code} onChange={e => setNewVendor({ ...newVendor, code: e.target.value.toUpperCase() })} required />
                                            <p className="text-[10px] text-slate-400">This code is used for voucher generation (e.g., D-2403-01)</p>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button type="submit" className="flex-1 font-black" disabled={loading}>Register Vendor</Button>
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingVendor(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-100",
        orange: "text-orange-600 bg-orange-100",
        green: "text-green-600 bg-green-100",
        red: "text-red-600 bg-red-100"
    }
    return (
        <Card className="p-6">
            <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-lg", colors[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4 space-y-1">
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                <p className="text-[10px] text-slate-400 mt-2">{sub}</p>
            </div>
        </Card>
    )
}

