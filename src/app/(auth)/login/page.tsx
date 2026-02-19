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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Mail className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Monsoft Mail</span>
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="rounded-lg" {...register('email')} />
              {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <Input id="password" type="password" className="rounded-lg" {...register('password')} />
              {errors.password && (
                <p className="text-[12px] text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-[13px] text-muted-foreground">
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
