'use client';
import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/services/api';
import { UserType } from '@/services/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>("individual");
  const [password, setPassword] = useState('');
  const { setToken } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      ApiService.auth.login({email, password, userType}).then(({ token }) => {
        setToken(token);
      }).catch((err) => {
        console.error("Login error:", err);
        alert("Login failed. Please check your credentials.");
      });
      router.push('/dashboard');
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-black font-bold text-2xl">VP</div>
          <h2 className="text-2xl font-bold text-white italic">VendorProof</h2>
          <p className="text-zinc-500 mt-2">Trust before transfer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">
            Sign in
          </button>
        </form>

        <div className="flex items-center justify-between text-sm mt-6">
          <Link href="/signup" className="text-zinc-500 hover:text-white">Create account</Link>
          <button className="text-zinc-500 hover:text-white underline">Forgot password?</button>
        </div>
      </div>
    </div>
  );
}