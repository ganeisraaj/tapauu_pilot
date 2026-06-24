'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getProfileByAuthIdAction } from '../actions'

const FloatingOrb = ({ className, style }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('absolute rounded-full blur-3xl opacity-30 animate-pulse', className)} style={style} />
)

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [signupSuccess, setSignupSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (window.location.search.includes('signup=success')) {
            setSignupSuccess(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

            if (authError) {
                setError(authError.message)
                return
            }

            if (data.user) {
                const res = await getProfileByAuthIdAction(data.user.id, data.user.email, data.user.user_metadata)

                if (res.success && res.user) {
                    localStorage.setItem('tapauu_id', res.user.tapauu_id)
                    window.location.href = '/'
                } else {
                    setError(res.error || 'Account found but profile is missing. Please contact admin.')
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-stretch overflow-hidden bg-[hsl(20,20%,10%)] relative">
            {/* Animated background orbs */}
            <FloatingOrb className="w-96 h-96 bg-primary top-[-80px] left-[-80px]" />
            <FloatingOrb className="w-64 h-64 bg-orange-400 bottom-[-40px] left-[20%]" style={{ animationDelay: '1s' }} />
            <FloatingOrb className="w-80 h-80 bg-amber-600 top-[30%] left-[-60px]" style={{ animationDelay: '2s' }} />

            {/* Left panel — brand / hero */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10">
                {/* Animated floating illustration */}
                <div className="relative flex items-center justify-center w-full h-52">
                    {/* Central phone card */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 w-28 h-48 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center gap-2 shadow-2xl"
                    >
                        <span className="text-4xl">📱</span>
                        <div className="w-16 h-1.5 rounded-full bg-primary/60" />
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                        <div className="w-12 h-1 rounded-full bg-white/20" />
                    </motion.div>

                    {/* Orbiting food emoji — top left */}
                    <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className="absolute top-2 left-8 text-4xl drop-shadow-lg"
                    >🍱</motion.div>

                    {/* Clock — top right */}
                    <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, -6, 0] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                        className="absolute top-4 right-10 text-3xl drop-shadow-lg"
                    >⏰</motion.div>

                    {/* Voucher ticket — bottom left */}
                    <motion.div
                        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute bottom-4 left-10 text-3xl drop-shadow-lg"
                    >🎟️</motion.div>

                    {/* Rice bowl — bottom right */}
                    <motion.div
                        animate={{ y: [0, 7, 0], rotate: [0, 6, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                        className="absolute bottom-2 right-8 text-4xl drop-shadow-lg"
                    >🍜</motion.div>
                </div>

                {/* Hero text */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/80 text-sm font-semibold">Active across 3+ universities</span>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                        Guaranteed<br />
                        <span className="text-primary">savings</span><br />
                        for students.
                    </h1>
                    <p className="text-white/60 text-lg font-medium leading-relaxed max-w-sm">
                        Reserve your meal. Skip the queue. Save every day with your campus subscription.
                    </p>


                </div>

                {/* Bottom decoration */}
                <div className="text-white/20 text-sm font-medium">
                    © 2026 TAPAUU · All rights reserved
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 justify-center mb-6 text-4xl">
                        🍱
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.06] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/40">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-1">Welcome back 👋</h2>
                            <p className="text-white/50 text-sm font-medium">Sign in to your student account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Success banner */}
                            <AnimatePresence>
                                {signupSuccess && !error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/15 text-green-400 text-sm font-semibold border border-green-500/20"
                                    >
                                        <CheckCircle2 size={16} className="shrink-0" />
                                        Account created! Sign in below.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error banner */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/15 text-red-400 text-sm font-semibold border border-red-500/20"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className={cn(
                                    'relative flex items-center rounded-2xl border transition-all duration-200',
                                    focusedField === 'email'
                                        ? 'border-primary/60 bg-white/10 shadow-lg shadow-primary/10'
                                        : 'border-white/10 bg-white/5'
                                )}>
                                    <Mail className={cn(
                                        'absolute left-4 w-4 h-4 transition-colors',
                                        focusedField === 'email' ? 'text-primary' : 'text-white/30'
                                    )} />
                                    <input
                                        type="email"
                                        id="login-email"
                                        placeholder="student@university.edu"
                                        className="w-full pl-11 pr-4 py-4 bg-transparent text-white placeholder-white/20 font-medium text-sm focus:outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <div className={cn(
                                    'relative flex items-center rounded-2xl border transition-all duration-200',
                                    focusedField === 'password'
                                        ? 'border-primary/60 bg-white/10 shadow-lg shadow-primary/10'
                                        : 'border-white/10 bg-white/5'
                                )}>
                                    <Lock className={cn(
                                        'absolute left-4 w-4 h-4 transition-colors',
                                        focusedField === 'password' ? 'text-primary' : 'text-white/30'
                                    )} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-password"
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-4 bg-transparent text-white placeholder-white/20 font-medium text-sm focus:outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        id="toggle-password-visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-white/30 hover:text-white/70 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    id="login-submit-btn"
                                    disabled={isLoading}
                                    className={cn(
                                        'w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all',
                                        'bg-primary text-white shadow-xl shadow-primary/30',
                                        'hover:shadow-2xl hover:shadow-primary/40',
                                        isLoading && 'opacity-70 cursor-not-allowed'
                                    )}
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Sign In <ArrowRight size={18} /></>
                                    )}
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-white/40 text-sm font-medium">
                                New to TAPAUU?{' '}
                                <Link href="/signup" className="text-primary font-bold hover:text-primary/80 transition-colors">
                                    Create an account →
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
