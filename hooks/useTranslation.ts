"use client"

import { useCallback } from "react"

// Simple translation dictionary to handle internationalization using Map to avoid bracket notation security warnings
const TRANSLATIONS = new Map<string, string>([
  ["vScore™", "vScore™"],
  ["vproof", "vproof"],
  ["Adaeze Nwosu-Okonkwo", "Adaeze Nwosu-Okonkwo"],
  ["Individual · Verified", "Individual · Verified"],
  ["Identity Verified", "Identity Verified"],
  ["Welcome back", "Welcome back"],
  ["Don't have an account?", "Don't have an account?"],
  ["Get verified free →", "Get verified free →"],
  ["Sign in as", "Sign in as"],
  ["Email Address", "Email Address"],
  ["Password", "Password"],
  ["Forgot password?", "Forgot password?"],
  ["or continue with", "or continue with"],
  ["By signing in you agree to our", "By signing in you agree to our"],
  ["Terms", "Terms"],
  ["and", "and"],
  ["Privacy Policy", "Privacy Policy"],
  ["Signing in…", "Signing in…"],
  ["Sign in as Individual →", "Sign in as Individual →"],
  ["Sign in as Institution →", "Sign in as Institution →"],
  ["© 2025 vproof Technologies Ltd.", "© 2025 vproof Technologies Ltd."],
  // --- Forgot & Reset Password Strings ---
  ["Forgot Password", "Forgot Password"],
  ["Enter your email address and we'll send you a link to reset your password.", "Enter your email address and we'll send you a link to reset your password."],
  ["Request reset link", "Request reset link"],
  ["Sending link…", "Sending link…"],
  ["Check your email", "Check your email"],
  ["We have sent a password reset link to your email if it exists in our system.", "We have sent a password reset link to your email if it exists in our system."],
  ["Back to login", "Back to login"],
  ["Reset Password", "Reset Password"],
  ["Enter your new password below.", "Enter your new password below."],
  ["New Password", "New Password"],
  ["Confirm New Password", "Confirm New Password"],
  ["Resetting password…", "Resetting password…"],
  ["Password Reset Successful", "Password Reset Successful"],
  ["Your password has been successfully reset. You can now log in with your new password.", "Your password has been successfully reset. You can now log in with your new password."],
  ["Go to login", "Go to login"],
  ["Invalid Reset Link", "Invalid Reset Link"],
  ["The password reset link is invalid or has expired.", "The password reset link is invalid or has expired."],
  ["Passwords do not match.", "Passwords do not match."],
  ["Password must be at least 8 characters.", "Password must be at least 8 characters."],
  ["Select your account type", "Select your account type"],
  ["Admin", "Admin"],
  ["Vendor", "Vendor"],
  ["Individual", "Individual"],
  ["Institution", "Institution"]
])

export function useTranslation() {
  const t = useCallback((key: string): string => {
    return TRANSLATIONS.get(key) || key
  }, [])

  return { t }
}
