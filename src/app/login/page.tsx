'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getProfileByAuthIdAction } from '../actions'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [signupSuccess, setSignupSuccess] = useState(false)
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
                console.log('Auth success, fetching profile for:', data.user.id);
                const res = await getProfileByAuthIdAction(data.user.id, data.user.email, data.user.user_metadata)

                if (res.success && res.user) {
                    console.log('Profile found, redirecting...', res.user.tapauu_id);
                    localStorage.setItem('tapauu_id', res.user.tapauu_id)
                    window.location.href = '/';
                } else {
                    console.error('Profile fetch failed:', res.error);
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-10">
                    <p className="text-muted-foreground font-medium text-center">
                        Guaranteed savings for students.
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass p-8 rounded-3xl shadow-xl shadow-primary/5 border border-white/50 bg-white/40 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {signupSuccess && !error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 p-4 rounded-2xl bg-green-50 text-green-700 text-sm font-bold border border-green-100"
                            >
                                <CheckCircle2 size={18} />
                                Account created! Log in below.
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                'w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-lg shadow-primary/20',
                                'flex items-center justify-center gap-2 transition-all hover:bg-primary/90',
                                isLoading && 'opacity-70 cursor-not-allowed'
                            )}
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Log In <ArrowRight size={20} /></>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="mt-8 text-center text-muted-foreground font-medium">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
