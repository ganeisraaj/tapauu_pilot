"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Phone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

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
                    data: {
                        full_name: name,
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. Create profile in public.users table
                // Generate a unique TAPAUU ID if still needed by the schema
                const generatedId = "STU-" + Math.random().toString(36).substring(2, 7).toUpperCase();

                const { error: profileError } = await supabase
                    .from("users")
                    .insert({
                        id: authData.user.id,
                        name: name,
                        phone: phone,
                        tapauu_id: generatedId,
                        credits: 10, // Starting credits for student
                        active: true,
                    });

                if (profileError) {
                    setError("Profile creation failed: " + profileError.message);
                } else {
                    localStorage.setItem("tapauu_id", generatedId);
                    router.push("/");
                    router.refresh();
                }
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background pt-10 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                {/* Logo & Tagline */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-8 w-full max-w-[280px]"
                    >
                        <img
                            src="/logo.jpg"
                            alt="TAPAUU Logo"
                            className="w-full h-auto object-contain"
                        />
                    </motion.div>
                    <p className="text-muted-foreground font-medium text-center">
                        Join the student food revolution.
                    </p>
                </div>

                {/* Signup Form */}
                <div className="glass p-8 rounded-3xl shadow-xl shadow-primary/5 border border-white/50 bg-white/40 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20"
                            >
                                <AlertCircle size={18} />
                                <span className="flex-1">{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 ml-1">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Ahmad Bin Ismail"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all text-sm font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all text-sm font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    placeholder="012-3456789"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all text-sm font-medium"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground/70 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all text-sm font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                className={cn(
                                    "w-full py-4 rounded-2xl bg-primary text-white font-black text-lg shadow-lg shadow-primary/20",
                                    "flex items-center justify-center gap-2 transition-all hover:bg-primary/90",
                                    isLoading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="mt-8 text-center text-muted-foreground font-medium">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-primary font-black hover:underline underline-offset-4"
                    >
                        Log In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
