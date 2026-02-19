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
    <div className="bg-radial-glow flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="glass-card !bg-card/80 backdrop-blur-2xl shadow-elevated relative z-10 w-full max-w-md rounded-2xl border-border/30">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="glow-md flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">Monsoft Mail</span>
          </div>
          <CardTitle className="text-xl tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground/60">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] text-foreground/80">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="rounded-lg bg-muted/30 border-border/30 focus-visible:bg-background" {...register('email')} />
              {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] text-foreground/80">Password</Label>
              <Input id="password" type="password" className="rounded-lg bg-muted/30 border-border/30 focus-visible:bg-background" {...register('password')} />
              {errors.password && (
                <p className="text-[12px] text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-lg hover:glow-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-[13px] text-muted-foreground/50">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
