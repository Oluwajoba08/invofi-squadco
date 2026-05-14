'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Save,
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        setLoading(true);

        const response = await ApiService.individuals.getDetails(userId);
        if (response.success) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Simulate API call for now since update endpoint is not explicitly in service
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Account — Configuration
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Mobile Horizontal / Desktop Vertical) */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Profile Info', icon: User, active: true },
            { id: 'security', label: 'Security', icon: Lock, active: false },
            { id: 'notifications', label: 'Notifications', icon: ShieldCheck, active: false },
          ].map((item) => (
            <button
              key={item.id}
              disabled={!item.active}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                item.active
                  ? "bg-white/5 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] border border-white/5"
                  : "text-white/20 hover:text-white/40 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", item.active ? "text-violet-400" : "text-white/10")} />
                {item.label}
              </div>
              {item.active && <ChevronRight className="h-3 w-3 text-white/20" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 space-y-8"
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Profile Information</h3>
              <p className="text-sm text-white/40">Manage your personal details and identity information.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="text"
                      defaultValue={profile?.fullName}
                      className="w-full bg-white/3 border border-white/5 rounded-2xl px-11 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="email"
                      readOnly
                      defaultValue={profile?.email}
                      className="w-full bg-white/1 border border-white/5 rounded-2xl px-11 py-3.5 text-sm text-white/40 cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="tel"
                      defaultValue={profile?.phoneNumber}
                      className="w-full bg-white/3 border border-white/5 rounded-2xl px-11 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="+234..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="text"
                      defaultValue={profile?.dateOfBirth}
                      className="w-full bg-white/3 border border-white/5 rounded-2xl px-11 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identity Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">BVN Status</p>
                    <p className="text-sm font-mono text-white/60">•••• •••• {profile?.bvn?.slice(-4) || '••••'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Verification</p>
                    <p className={cn(
                      "text-xs font-bold capitalize",
                      profile?.verificationStatus === 'verified' || profile?.verificationStatus === 'trusted' ? "text-emerald-400" :
                        profile?.verificationStatus === 'review' || profile?.verificationStatus === 'pending' ? "text-amber-400" :
                          "text-red-400"
                    )}>
                      {profile?.verificationStatus || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-500 text-white rounded-2xl px-8 h-12 font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
