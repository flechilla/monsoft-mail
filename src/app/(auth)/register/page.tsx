'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';

import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { signUp } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: '/mail',
    });
  }

  return (
    <div className="bg-radial-glow noise-overlay flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="animate-fade-in relative z-10 w-full max-w-[420px]">
        <Card className="glass-card !bg-card/90 backdrop-blur-3xl shadow-elevated rounded-lg border-white/[0.06] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Mail className="h-4 w-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">Monsoft Mail</span>
            </div>
            <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">Sign up for a new account</CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px] text-foreground/70 font-medium">Name</Label>
                <Input id="name" placeholder="Your name" className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('name')} />
                {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[13px] text-foreground/70 font-medium">Confirm Password</Label>
                <Input id="confirmPassword" type="password" className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-[12px] text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-md h-11 font-semibold text-[14px] mt-2 btn-compose" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
            <p className="mt-5 text-center text-[13px] text-muted-foreground/40">
              Already have an account?{' '}
              <a href="/login" className="text-primary/80 font-medium hover:text-primary transition-colors">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
