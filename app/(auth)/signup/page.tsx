'use client';
import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Individual' });
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuthStore();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient<{ token: string }>('/auth/signup', { data: formData });
      setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      alert("Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-zinc-400 mt-2">Join the trust network.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex bg-zinc-800 p-1 rounded-xl">
            {['Individual', 'Vendor', 'Institution'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData({ ...formData, role: r })}
                className={`flex-1 py-2 text-sm rounded-lg transition ${formData.role === r ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <input 
            type="text" placeholder="Full Name" required
            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email Address" required
            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button 
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition"
          >
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          Already have an account? <Link href="/login" className="text-emerald-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}