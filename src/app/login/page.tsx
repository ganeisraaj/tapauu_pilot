"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { checkUserAction } from "../actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [tapauuId, setTapauuId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await checkUserAction(tapauuId);
            if (res.success && res.user) {
                localStorage.setItem("tapauu_id", tapauuId);
                router.push("/");
            } else {
                setError(res.error || "Invalid TAPAUU ID. Please check and try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
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
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
                        TAPAUU
                    </h1>
                    <p className="text-muted-foreground font-medium text-center">
                        Guaranteed savings for students.
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass p-8 rounded-3xl shadow-xl shadow-primary/5 border border-white/50 bg-white/40 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                            <label className="text-sm font-bold text-foreground/70 ml-1">TAPAUU ID</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="e.g. STU101"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-primary/30 focus:outline-none transition-all font-medium uppercase"
                                    value={tapauuId}
                                    onChange={(e) => setTapauuId(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
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

                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-bold text-primary hover:opacity-80 transition-opacity"
                            >
                                Forgot password?
                            </Link>
                        </div>

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
                                    Log In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="mt-8 text-center text-muted-foreground font-medium">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-primary font-black hover:underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
