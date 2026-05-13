import Link from "next/link";

export default function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="#"
      className="text-[13px] text-white/50 hover:text-white transition-colors duration-200 font-light tracking-wide"
    >
      {children}
    </Link>
  );
}