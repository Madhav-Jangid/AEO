import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-400">
        No account? <Link href="/signup" className="font-semibold text-white hover:text-[rgb(145,75,241)] transition-colors">Create one</Link>
      </p>
    </div>
  );
}
