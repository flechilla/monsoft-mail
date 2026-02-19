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
        <Card className="glass-card !bg-[#0d0d11]/90 backdrop-blur-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_-8px_rgba(0,0,0,0.5)] rounded-lg border-white/[0.06] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Mail className="h-4 w-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Monsoft Mail</span>
            </div>
            <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-foreground/70 font-medium">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('email')} />
                {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] text-foreground/70 font-medium">Password</Label>
                <Input id="password" type="password" className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('password')} />
                {errors.password && (
                  <p className="text-[12px] text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-md h-11 font-semibold text-[14px] mt-2 btn-compose" disabled={isSubmitting}>
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
