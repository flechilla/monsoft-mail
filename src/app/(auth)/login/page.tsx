'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';

import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: '/mail',
    });
  }

  return (
    <div className="bg-radial-glow noise-overlay flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="animate-fade-in relative z-10 w-full max-w-[420px]">
        <Card className="glass-card !bg-[#0d0d11]/90 backdrop-blur-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_-8px_rgba(0,0,0,0.5),0_0_80px_-20px_rgba(59,130,246,0.08)] rounded-2xl border-white/[0.06] overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="glow-md flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_4px_16px_-2px_rgba(59,130,246,0.4)]">
                <Mail className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">Monsoft Mail</span>
            </div>
            <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-foreground/70 font-medium">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="rounded-xl bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('email')} />
                {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-foreground/70 font-medium">Password</Label>
                <Input id="password" type="password" className="rounded-xl bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('password')} />
                {errors.password && (
                  <p className="text-[12px] text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 font-semibold text-[14px] mt-2 btn-compose" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <p className="mt-5 text-center text-[13px] text-muted-foreground/40">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-primary/80 font-medium hover:text-primary transition-colors">
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
