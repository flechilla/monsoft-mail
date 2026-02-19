import { Button } from '@/components/ui/button';
import { Mail, Sparkles, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 p-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Monsoft Mail</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          AI-powered email client. Smart classification, instant summaries, and intelligent compose — all in a clean, modern interface.
        </p>
      </div>

      <div className="flex gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-foreground">AI-Powered</span>
          <span className="text-[12px] text-muted-foreground">Smart summaries & compose</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Zap className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-sm font-medium text-foreground">Lightning Fast</span>
          <span className="text-[12px] text-muted-foreground">Snappy & responsive</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <Shield className="h-5 w-5 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-foreground">Secure</span>
          <span className="text-[12px] text-muted-foreground">Your data stays yours</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
          <a href="/login">Sign In</a>
        </Button>
        <Button variant="outline" size="lg" asChild className="rounded-xl px-8">
          <a href="/register">Sign Up</a>
        </Button>
      </div>
    </main>
  );
}
