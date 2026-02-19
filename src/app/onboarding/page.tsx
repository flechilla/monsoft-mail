'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Key, Globe, AtSign, Check, Loader2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Domain {
  id: string;
  domainName: string;
  resendDomainId: string;
  status: string;
  canSend: boolean;
  canReceive: boolean;
}

const STEPS = ['Connect Resend', 'Select Domains', 'Create Email'] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [localPart, setLocalPart] = useState('');
  const [displayName, setDisplayName] = useState('');

  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  async function connectResend() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/resend-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to verify API key');
        return;
      }
      setDomains(data.domains);
      if (data.domains.length > 0) {
        setSelectedDomainId(data.domains.find((d: Domain) => d.status === 'verified')?.id ?? data.domains[0].id);
      }
      setStep(1);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function createEmail() {
    if (!selectedDomainId || !localPart) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/email-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId: selectedDomainId, localPart, displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create email address');
        return;
      }

      // Also create the email account entry
      const domain = domains.find((d) => d.id === selectedDomainId);
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.emailAddress.emailAddress,
          name: displayName || localPart,
          resendApiKey: 'byok',
          domainId: domain?.resendDomainId,
        }),
      });

      router.push('/mail');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const verifiedDomains = domains.filter((d) => d.status === 'verified');

  return (
    <div className="bg-radial-glow noise-overlay flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="animate-fade-in relative z-10 w-full max-w-[520px]">
        {/* Progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-300 ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-white/[0.04] text-muted-foreground/30 border border-white/[0.06]'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[12px] font-medium ${i === step ? 'text-foreground/70' : 'text-muted-foreground/30'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="mx-1 h-px w-6 bg-white/[0.06]" />}
            </div>
          ))}
        </div>

        <Card className="glass-card !bg-[#0d0d11]/90 backdrop-blur-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_-8px_rgba(0,0,0,0.5)] rounded-lg border-white/[0.06] overflow-hidden">
          {/* Step 1: Connect Resend */}
          {step === 0 && (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="flex items-center justify-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                    <Key className="h-4 w-4 text-white" strokeWidth={2.2} />
                  </div>
                </div>
                <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Connect Resend</CardTitle>
                <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">
                  Paste your Resend API key to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 pb-7">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-[13px] text-foreground/70 font-medium">
                      API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="re_..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11 font-mono text-[13px]"
                    />
                    <p className="text-[11px] text-muted-foreground/30">
                      Get your API key from{' '}
                      <a
                        href="https://resend.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/70 hover:text-primary transition-colors"
                      >
                        resend.com/api-keys
                      </a>
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <p className="text-[12px] text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={connectResend}
                    disabled={!apiKey || loading}
                    className="w-full rounded-md h-11 font-semibold text-[14px] mt-2 btn-compose"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Connect <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Select Domains */}
          {step === 1 && (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="flex items-center justify-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                    <Globe className="h-4 w-4 text-white" strokeWidth={2.2} />
                  </div>
                </div>
                <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Your Domains</CardTitle>
                <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">
                  Select a domain to create your email address
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 pb-7">
                <div className="space-y-4">
                  {verifiedDomains.length === 0 ? (
                    <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-center">
                      <p className="text-[13px] text-yellow-400/80">
                        No verified domains found. Please verify a domain in your Resend dashboard first.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {domains.map((domain) => (
                        <button
                          key={domain.id}
                          onClick={() => domain.status === 'verified' && setSelectedDomainId(domain.id)}
                          disabled={domain.status !== 'verified'}
                          className={`w-full flex items-center gap-3 rounded-md px-4 py-3 text-left transition-all duration-200 border ${
                            selectedDomainId === domain.id
                              ? 'bg-primary/10 border-primary/30 text-foreground'
                              : domain.status === 'verified'
                                ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-foreground/80 cursor-pointer'
                                : 'bg-white/[0.01] border-white/[0.04] text-muted-foreground/30 cursor-not-allowed'
                          }`}
                        >
                          <Globe className="h-4 w-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate">{domain.domainName}</p>
                          </div>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              domain.status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : domain.status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {domain.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <p className="text-[12px] text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-11 rounded-md">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={() => {
                        setError('');
                        setStep(2);
                      }}
                      disabled={!selectedDomainId || !selectedDomain || selectedDomain.status !== 'verified'}
                      className="flex-1 h-11 rounded-md font-semibold text-[14px] btn-compose"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Create Email */}
          {step === 2 && (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <div className="flex items-center justify-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                    <AtSign className="h-4 w-4 text-white" strokeWidth={2.2} />
                  </div>
                </div>
                <CardTitle className="text-xl tracking-[-0.02em] font-semibold">Create Email Address</CardTitle>
                <CardDescription className="text-muted-foreground/50 text-[13px] mt-1">
                  Set up your email address on {selectedDomain?.domainName}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-7 pb-7">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-[13px] text-foreground/70 font-medium">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="Adriano Ribeiro"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="rounded-md bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localPart" className="text-[13px] text-foreground/70 font-medium">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-0">
                      <Input
                        id="localPart"
                        placeholder="adriano"
                        value={localPart}
                        onChange={(e) => setLocalPart(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        className="rounded-r-none bg-white/[0.03] border-white/[0.06] focus-visible:bg-white/[0.05] focus-visible:border-primary/20 h-11"
                      />
                      <div className="flex h-11 items-center rounded-r-md border border-l-0 border-white/[0.06] bg-white/[0.04] px-3 text-[13px] text-muted-foreground/50">
                        @{selectedDomain?.domainName}
                      </div>
                    </div>
                  </div>

                  {localPart && selectedDomain && (
                    <div className="rounded-md bg-white/[0.02] border border-white/[0.06] px-4 py-3">
                      <p className="text-[12px] text-muted-foreground/40">Your email will be:</p>
                      <p className="text-[14px] font-medium text-foreground/80 mt-0.5">
                        {localPart}@{selectedDomain.domainName}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <p className="text-[12px] text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-md">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={createEmail}
                      disabled={!localPart || loading}
                      className="flex-1 h-11 rounded-md font-semibold text-[14px] btn-compose"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" /> Create & Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
