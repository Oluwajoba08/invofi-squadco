'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Lock,
  ArrowLeft,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function InstitutionSettingsPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    businessName: '',
    email: '',
    phoneNumber: '',
    address: '',
    rcNumber: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await ApiService.institutions.getDetails(userId);
        console.log(response)
        if (response) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setSaving(true);
      await ApiService.institutions.update(userId, {
        businessName: profile.businessName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
      });
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4 text-white/20">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white p-4 md:p-8 space-y-10 w-full overflow-x-hidden max-w-5xl mx-auto">
      {/* --- Header --- */}
      <div className="space-y-1">
        <button
          onClick={() => router.push('/institution-dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-2 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>System Settings</h1>
        <p className="text-white/40 text-sm">Manage your institutional profile and verification preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* --- Navigation Sidebar (Internal) --- */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            // { id: 'security', label: 'Security', icon: Lock },
            // { id: 'workflow', label: 'Workflow', icon: Zap },
            // { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                tab.id === 'profile'
                  ? "bg-white/5 text-white border border-white/10"
                  : "text-white/30 hover:text-white/60 hover:bg-white/2"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- Form Area --- */}
        <div className="md:col-span-3 space-y-8">
          <form onSubmit={handleUpdate} className="space-y-8">
            {/* General Profile Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                  <Building2 className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold">Institutional Profile</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Business Name</label>
                  <Input
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-2xl h-12 px-4 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">RC Number (Locked)</label>
                  <Input
                    disabled
                    value={profile.rcNumber}
                    className="bg-white/2 border-white/5 rounded-2xl h-12 px-4 text-white/40 cursor-not-allowed font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Official Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input
                      disabled
                      value={profile.email}
                      className="bg-white/2 border-white/5 rounded-2xl pl-11 h-12 text-white/40 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-2xl pl-11 h-12 text-white"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">HQ Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-white/20" />
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 p-4 h-32 text-white resize-none focus:ring-1 focus:ring-violet-500/50 outline-hidden text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Verification Strategy Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold">Verification Policy</h3>
              </div>

              <div className="p-6 rounded-3xl bg-linear-to-br from-violet-600/5 to-indigo-600/5 border border-white/5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Automated Risk Enforcement</p>
                    <p className="text-xs text-white/40 leading-relaxed max-w-md">
                      When enabled, vendors with a trust score below 40 will be automatically blocked from initiating payments.
                    </p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-violet-600 flex items-center px-1">
                    <div className="h-4 w-4 rounded-full bg-white translate-x-5" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-500 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-violet-600/20 transition-all active:scale-95 ml-auto flex"
                >
                  {saving ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </motion.section>
          </form>

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-bold text-red-400">Security & Termination</h3>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-white/30 max-w-sm">
                Permanently deactivate your institutional access and all associated vendor records. This action is irreversible.
              </p>
              <Button variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl px-6 h-10 text-xs font-bold uppercase tracking-widest border border-red-500/10">
                Deactivate Account
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
