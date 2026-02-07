"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Merchant } from "@/lib/types";
import { getMerchantById, BackendAPIError } from "@/lib/api/backend-api";

interface User {
    id: string;
    email: string;
    name: string;
    restaurant: string;
    merchantId: string;
}

interface AuthContextType {
    user: User | null;
    merchant: Merchant | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    setMerchantSession: (merchant: Merchant) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_KEY = "spare_auth_session";
const MERCHANT_KEY = "spare_merchant_session";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const merchantSession = localStorage.getItem(MERCHANT_KEY);
                if (merchantSession) {
                    const parsed = JSON.parse(merchantSession);
                    if (parsed.expiresAt > Date.now()) {
                        // Fetch fresh merchant data from backend API
                        try {
                            const merchantData = await getMerchantById(parsed.merchantId);
                            setMerchant(merchantData);
                            setUser({
                                id: merchantData.merchant_id,
                                email: merchantData.email,
                                name: merchantData.merchant_name,
                                restaurant: merchantData.merchant_name,
                                merchantId: merchantData.merchant_id,
                            });
                        } catch (error) {
                            console.error("Failed to fetch merchant:", error);
                            localStorage.removeItem(MERCHANT_KEY);
                            localStorage.removeItem(AUTH_KEY);
                        }
                    } else {
                        localStorage.removeItem(MERCHANT_KEY);
                        localStorage.removeItem(AUTH_KEY);
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
                localStorage.removeItem(MERCHANT_KEY);
                localStorage.removeItem(AUTH_KEY);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Handle route protection
    useEffect(() => {
        if (isLoading) return;

        const isOnboardingPage = pathname === "/onboarding";
        const isLoginPage = pathname === "/login";

        if (!user && !isOnboardingPage && !isLoginPage && pathname !== "/") {
            // Redirect to onboarding if not authenticated
            router.push("/onboarding");
        } else if (!user && pathname === "/") {
            // Redirect root to onboarding if not authenticated
            router.push("/onboarding");
        } else if (user && (isOnboardingPage || isLoginPage)) {
            // Redirect to dashboard if already authenticated
            router.push("/");
        }
    }, [user, isLoading, pathname, router]);

    const setMerchantSession = (merchantData: Merchant) => {
        const session = {
            merchantId: merchantData.merchant_id,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        localStorage.setItem(MERCHANT_KEY, JSON.stringify(session));
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        setMerchant(merchantData);
        setUser({
            id: merchantData.merchant_id,
            email: merchantData.email,
            name: merchantData.merchant_name,
            restaurant: merchantData.merchant_name,
            merchantId: merchantData.merchant_id,
        });
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        // This is now handled in the onboarding page
        // Keeping for backward compatibility
        return { success: false, error: "Please use the onboarding page" };
    };

    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(MERCHANT_KEY);
        setUser(null);
        setMerchant(null);
        router.push("/onboarding");
    };

    return (
        <AuthContext.Provider value={{
            user,
            merchant,
            isLoading,
            isAuthenticated: !!user,
            login,
            setMerchantSession,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
