"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, User, ChevronRight } from "lucide-react";

export default function CustomerSettingsPage() {
    const { data: session, status, update } = useSession();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Profile form state
    const [profileName, setProfileName] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Accordion state
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.name) {
            setProfileName(session.user.name);
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        redirect("/login");
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
        setPasswordError("");
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordSuccess(true);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => {
                    setPasswordSuccess(false);
                    setActiveSection(null);
                }, 2000);
            } else {
                setPasswordError(data.error || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError("An error occurred");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError("");

        if (!profileName.trim()) {
            setProfileError("Name cannot be empty");
            return;
        }

        setProfileLoading(true);

        try {
            const res = await fetch("/api/user/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profileName.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setProfileSuccess(true);
                await update({ name: profileName.trim() });
                setTimeout(() => {
                    setProfileSuccess(false);
                    setActiveSection(null);
                }, 2000);
            } else {
                setProfileError(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setProfileError("An error occurred");
        } finally {
            setProfileLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
                    <Link href="/profile" className="absolute left-0 text-gray-900 p-2 -ml-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Settings</h1>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block mb-8">
                    <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                    <p className="mt-2 text-base text-gray-500">Manage your account security and preferences</p>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {/* Change Name Button / Section */}
                    <div className="bg-white rounded-2xl md:rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => toggleSection("name")}
                            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-[15px] md:text-lg font-bold text-gray-900">Change Name</h2>
                                    <p className="text-[13px] text-gray-500">{session?.user?.name || "Set your display name"}</p>
                                </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${activeSection === "name" ? "rotate-90" : ""}`} />
                        </button>

                        {activeSection === "name" && (
                            <div className="px-4 md:px-6 pb-5 md:pb-6 border-t border-gray-100">
                                <div className="pt-4 md:pt-5">
                                    {profileSuccess && (
                                        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium text-sm flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Profile updated successfully!
                                        </div>
                                    )}
                                    {profileError && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium text-sm flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {profileError}
                                        </div>
                                    )}
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="profileName" className="block text-[14px] font-semibold text-gray-900 mb-1.5">
                                                Full Name
                                            </label>
                                            <input
                                                id="profileName"
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => { setProfileName(e.target.value); setProfileError(""); }}
                                                required
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-[15px]"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={profileLoading}
                                                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl text-[14px] hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                                            >
                                                {profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setActiveSection(null); setProfileName(session?.user?.name || ""); }}
                                                className="px-6 py-3 text-gray-600 font-medium rounded-xl text-[14px] border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Change Password Button / Section */}
                    <div className="bg-white rounded-2xl md:rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => toggleSection("password")}
                            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-rose-500" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-[15px] md:text-lg font-bold text-gray-900">Change Password</h2>
                                    <p className="text-[13px] text-gray-500">Update your account password</p>
                                </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${activeSection === "password" ? "rotate-90" : ""}`} />
                        </button>

                        {activeSection === "password" && (
                            <div className="px-4 md:px-6 pb-5 md:pb-6 border-t border-gray-100">
                                <div className="pt-4 md:pt-5">
                                    {passwordSuccess && (
                                        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium text-sm flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Password changed successfully!
                                        </div>
                                    )}
                                    {passwordError && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium text-sm flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {passwordError}
                                        </div>
                                    )}
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-[14px] font-semibold text-gray-900 mb-1.5">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white text-[15px]"
                                                    placeholder="Enter current password"
                                                />
                                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword" className="block text-[14px] font-semibold text-gray-900 mb-1.5">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    minLength={6}
                                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white text-[15px]"
                                                    placeholder="Enter new password"
                                                />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <p className="mt-1 text-[12px] text-gray-400">Must be at least 6 characters</p>
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-gray-900 mb-1.5">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                minLength={6}
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white text-[15px]"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={passwordLoading}
                                                className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl text-[14px] hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                                            >
                                                {passwordLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Password"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setActiveSection(null); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                                                className="px-6 py-3 text-gray-600 font-medium rounded-xl text-[14px] border border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
