import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="signup" />
      <p className="text-center text-sm text-slate-400">
        Already have an account? <Link href="/login" className="font-semibold text-white hover:text-[rgb(145,75,241)] transition-colors">Log in</Link>
      </p>
    </div>
  );
}
