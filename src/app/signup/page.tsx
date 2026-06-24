"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Phone, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { syncProfileAfterSignup, getUniversitiesAction } from "../actions";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [universityId, setUniversityId] = useState("");
    const [universities, setUniversities] = useState<{ id: string; name: string; slug: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        getUniversitiesAction().then((res) => {
            if (res.success && res.universities) {
                setUniversities(res.universities);
                if (res.universities.length > 0) setUniversityId(res.universities[0].id);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });

            if (authError) {
                setError(authError.message);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. Create profile via Server Action to bypass RLS
                const generatedId = "STU" + Math.random().toString(36).substring(2, 7).toUpperCase();
                const syncRes = await syncProfileAfterSignup(authData.user.id, {
                    name,
                    phone,
                    tapauu_id: generatedId,
                    university_id: universityId || undefined,
                });

                if (syncRes.error) {
                    setError("Profile creation failed: " + syncRes.error);
                } else {
                    window.location.href = "/login?signup=success";
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field: string) =>
        cn(
            "relative flex items-center rounded-2xl border transition-all duration-200",
            focusedField === field
                ? "border-primary/60 bg-white/10 shadow-lg shadow-primary/10"
                : "border-white/10 bg-white/5"
        );

    const iconClass = (field: string) =>
        cn(
            "absolute left-4 w-4 h-4 transition-colors",
            focusedField === field ? "text-primary" : "text-white/30"
        );

    return (
        <div className="min-h-screen flex items-stretch overflow-hidden bg-[hsl(20,20%,10%)] relative">
            {/* Animated background orbs */}
            <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse bg-primary top-[-80px] right-[-80px]" />
            <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse bg-orange-400 bottom-[-40px] right-[20%]" style={{ animationDelay: '1.5s' }} />

            {/* Left panel — brand */}
            <div className="hidden lg:flex flex-col justify-between w-2/5 p-16 relative z-10">
                {/* Animated floating illustration */}
                <div className="relative flex items-center justify-center w-full h-52">
                    {/* Central phone card */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 w-24 h-40 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center gap-2 shadow-2xl"
                    >
                        <span className="text-3xl">📱</span>
                        <div className="w-12 h-1 rounded-full bg-primary/60" />
                        <div className="w-8 h-1 rounded-full bg-white/10" />
                    </motion.div>

                    {/* Orbiting food emoji — top left */}
                    <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className="absolute top-4 left-4 text-3xl drop-shadow-lg"
                    >🍱</motion.div>

                    {/* Clock — top right */}
                    <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, -6, 0] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                        className="absolute top-6 right-4 text-2xl drop-shadow-lg"
                    >⏰</motion.div>

                    {/* Voucher ticket — bottom left */}
                    <motion.div
                        animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute bottom-6 left-6 text-2xl drop-shadow-lg"
                    >🎟️</motion.div>

                    {/* Rice bowl — bottom right */}
                    <motion.div
                        animate={{ y: [0, 7, 0], rotate: [0, 6, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                        className="absolute bottom-4 right-6 text-3xl drop-shadow-lg"
                    >🍜</motion.div>
                </div>
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/80 text-sm font-semibold">Active across 3+ universities</span>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                        Join the<br />
                        <span className="text-primary">student</span><br />
                        revolution.
                    </h1>
                    <p className="text-white/60 text-lg font-medium leading-relaxed max-w-sm">
                        Reserve your meal, skip the queue, and save money — starting from day one.
                    </p>
                </div>
                <div className="text-white/20 text-sm font-medium">© 2026 TAPAUU · All rights reserved</div>
            </div>

            {/* Right panel — signup form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 justify-center mb-6 text-4xl">
                        🍱
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.06] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/40">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-1">Create account 🎓</h2>
                            <p className="text-white/50 text-sm font-medium">Join TAPAUU — it takes 30 seconds.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/15 text-red-400 text-sm font-semibold border border-red-500/20"
                                >
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span className="flex-1">{error}</span>
                                </motion.div>
                            )}

                            {/* University selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">University / Campus</label>
                                <div className={inputClass('university')}>
                                    <Building2 className={iconClass('university')} />
                                    <select
                                        id="signup-university"
                                        className="w-full pl-11 pr-4 py-4 bg-transparent text-white font-medium text-sm focus:outline-none appearance-none cursor-pointer"
                                        value={universityId}
                                        onChange={(e) => setUniversityId(e.target.value)}
                                        onFocus={() => setFocusedField('university')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    >
                                        {universities.length === 0 && (
                                            <option value="" className="bg-gray-900">Loading universities...</option>
                                        )}
                                        {universities.map((u) => (
                                            <option key={u.id} value={u.id} className="bg-gray-900">{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Full name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Full Name</label>
                                <div className={inputClass('name')}>
                                    <UserIcon className={iconClass('name')} />
                                    <input
                                        type="text"
                                        id="signup-name"
                                        placeholder="Ahmad Bin Ismail"
                                        className="w-full pl-11 pr-4 py-4 bg-transparent text-white placeholder-white/20 font-medium text-sm focus:outline-none"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                                <div className={inputClass('email')}>
                                    <Mail className={iconClass('email')} />
                                    <input
                                        type="email"
                                        id="signup-email"
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

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className={inputClass('phone')}>
                                    <Phone className={iconClass('phone')} />
                                    <input
                                        type="tel"
                                        id="signup-phone"
                                        placeholder="012-3456789"
                                        className="w-full pl-11 pr-4 py-4 bg-transparent text-white placeholder-white/20 font-medium text-sm focus:outline-none"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Password</label>
                                <div className={inputClass('password')}>
                                    <Lock className={iconClass('password')} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="signup-password"
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
                                        id="signup-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-white/30 hover:text-white/70 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    id="signup-submit-btn"
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all",
                                        "bg-primary text-white shadow-xl shadow-primary/30",
                                        "hover:shadow-2xl hover:shadow-primary/40",
                                        isLoading && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Create Account <ArrowRight size={18} /></>
                                    )}
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-white/40 text-sm font-medium">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
                                    Sign in →
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
