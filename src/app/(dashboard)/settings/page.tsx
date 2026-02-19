'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import {
  Settings,
  User,
  Palette,
  Brain,
  Check,
  Loader2,
  Key,
  Globe,
  AtSign,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface UserSettings {
  displayName: string | null;
  emailSignature: string | null;
  theme: 'light' | 'dark' | 'system';
  aiClassification: boolean;
  aiReplySuggestions: boolean;
  aiComposeTone: 'professional' | 'casual' | 'friendly';
}

interface Domain {
  id: string;
  domainName: string;
  status: string;
  canSend: boolean;
  canReceive: boolean;
}

interface EmailAddress {
  id: string;
  emailAddress: string;
  displayName: string | null;
  isDefault: boolean;
  domainId: string;
}

interface ResendConfig {
  hasKey: boolean;
  isVerified: boolean;
  domains: Domain[];
  emailAddresses: EmailAddress[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Resend config state
  const [resendConfig, setResendConfig] = useState<ResendConfig | null>(null);
  const [resendLoading, setResendLoading] = useState(true);
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [newEmailLocal, setNewEmailLocal] = useState('');
  const [newEmailDomain, setNewEmailDomain] = useState('');
  const [newEmailName, setNewEmailName] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
        applyTheme(data.theme);
      });
    fetchResendConfig();
  }, []);

  async function fetchResendConfig() {
    setResendLoading(true);
    try {
      const res = await fetch('/api/resend-config');
      const data = await res.json();
      setResendConfig(data);
      if (data.domains?.length > 0 && !newEmailDomain) {
        const verified = data.domains.find((d: Domain) => d.status === 'verified');
        if (verified) setNewEmailDomain(verified.id);
      }
    } finally {
      setResendLoading(false);
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const save = useCallback(async (updates: Partial<UserSettings>) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setSettings(data);
      if (updates.theme) applyTheme(updates.theme);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    save({ [key]: value });
  };

  async function saveApiKey() {
    setKeyLoading(true);
    setKeyError('');
    try {
      const res = await fetch('/api/resend-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setKeyError(data.error || 'Failed to verify API key');
        return;
      }
      setNewApiKey('');
      setShowKeyInput(false);
      fetchResendConfig();
    } catch {
      setKeyError('Network error');
    } finally {
      setKeyLoading(false);
    }
  }

  async function discoverDomains() {
    setDiscoverLoading(true);
    try {
      await fetch('/api/resend-config/discover-domains', { method: 'POST' });
      fetchResendConfig();
    } finally {
      setDiscoverLoading(false);
    }
  }

  async function addEmailAddress() {
    if (!newEmailLocal || !newEmailDomain) return;
    setAddingEmail(true);
    setEmailError('');
    try {
      const res = await fetch('/api/email-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainId: newEmailDomain,
          localPart: newEmailLocal,
          displayName: newEmailName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || 'Failed to create email');
        return;
      }
      setNewEmailLocal('');
      setNewEmailName('');
      fetchResendConfig();
    } catch {
      setEmailError('Network error');
    } finally {
      setAddingEmail(false);
    }
  }

  async function deleteEmailAddress(id: string) {
    await fetch(`/api/email-addresses/${id}`, { method: 'DELETE' });
    fetchResendConfig();
  }

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  const verifiedDomains = resendConfig?.domains?.filter((d) => d.status === 'verified') ?? [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8 animate-fade-in">
        <div className="mb-8 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/[0.08] border border-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-[-0.02em]">Settings</h1>
            <p className="text-[13px] text-muted-foreground/45 mt-0.5">Manage your preferences</p>
          </div>
          {saving && (
            <div className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground/40">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </div>
          )}
          {saved && (
            <div className="ml-auto flex items-center gap-1.5 text-[12px] text-emerald-400">
              <Check className="h-3 w-3" /> Saved
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <Key className="h-4 w-4 text-muted-foreground/50" />
                <CardTitle className="text-[16px] tracking-tight font-semibold">Email Configuration</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground/40 text-[13px]">
                Manage your Resend API key, domains, and email addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {resendLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30" />
                </div>
              ) : (
                <>
                  {/* API Key Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[13px] text-foreground/70 font-medium">Resend API Key</Label>
                      <p className="text-[12px] text-muted-foreground/35 mt-1">
                        {resendConfig?.hasKey ? (
                          <span className="flex items-center gap-1.5">
                            {resendConfig.isVerified ? (
                              <>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Connected & verified
                              </>
                            ) : (
                              <>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400" />
                                Connected, no verified domains
                              </>
                            )}
                          </span>
                        ) : (
                          'No API key configured'
                        )}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKeyInput(!showKeyInput)}
                    >
                      {resendConfig?.hasKey ? 'Update Key' : 'Add Key'}
                    </Button>
                  </div>

                  {showKeyInput && (
                    <div className="space-y-3 rounded-md bg-white/[0.02] border border-white/[0.06] p-4">
                      <div className="space-y-2">
                        <Label htmlFor="newApiKey" className="text-[13px] text-foreground/70 font-medium">
                          New API Key
                        </Label>
                        <Input
                          id="newApiKey"
                          type="password"
                          placeholder="re_..."
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          className="font-mono text-[13px]"
                        />
                      </div>
                      {keyError && (
                        <div className="flex items-center gap-2 text-[12px] text-destructive">
                          <AlertCircle className="h-3 w-3" /> {keyError}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveApiKey} disabled={!newApiKey || keyLoading}>
                          {keyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Verify & Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowKeyInput(false);
                            setNewApiKey('');
                            setKeyError('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Domains */}
                  {resendConfig?.hasKey && (
                    <>
                      <div className="divider-subtle" />
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground/40" />
                            <Label className="text-[13px] text-foreground/70 font-medium">Domains</Label>
                          </div>
                          <Button variant="ghost" size="sm" onClick={discoverDomains} disabled={discoverLoading}>
                            <RefreshCw className={`h-3 w-3 ${discoverLoading ? 'animate-spin' : ''}`} />
                            Re-discover
                          </Button>
                        </div>
                        {resendConfig.domains.length === 0 ? (
                          <p className="text-[12px] text-muted-foreground/30">No domains found</p>
                        ) : (
                          <div className="space-y-1.5">
                            {resendConfig.domains.map((domain) => (
                              <div
                                key={domain.id}
                                className="flex items-center gap-3 rounded-md bg-white/[0.02] border border-white/[0.06] px-3 py-2"
                              >
                                <span className="text-[13px] text-foreground/70 flex-1">{domain.domainName}</span>
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Email Addresses */}
                      <div className="divider-subtle" />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AtSign className="h-3.5 w-3.5 text-muted-foreground/40" />
                          <Label className="text-[13px] text-foreground/70 font-medium">Email Addresses</Label>
                        </div>

                        {resendConfig.emailAddresses.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            {resendConfig.emailAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                className="flex items-center gap-3 rounded-md bg-white/[0.02] border border-white/[0.06] px-3 py-2"
                              >
                                <span className="text-[13px] text-foreground/70 flex-1">
                                  {addr.displayName && (
                                    <span className="text-foreground/50 mr-1.5">{addr.displayName}</span>
                                  )}
                                  {addr.emailAddress}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    default
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteEmailAddress(addr.id)}
                                  className="text-muted-foreground/30 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add email form */}
                        {verifiedDomains.length > 0 && (
                          <div className="space-y-3 rounded-md bg-white/[0.02] border border-white/[0.06] p-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Display name"
                                value={newEmailName}
                                onChange={(e) => setNewEmailName(e.target.value)}
                                className="flex-1 h-9 text-[13px]"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="username"
                                value={newEmailLocal}
                                onChange={(e) =>
                                  setNewEmailLocal(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                                }
                                className="flex-1 h-9 text-[13px]"
                              />
                              <select
                                value={newEmailDomain}
                                onChange={(e) => setNewEmailDomain(e.target.value)}
                                className="h-9 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 text-[13px] text-foreground/70"
                              >
                                {verifiedDomains.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    @{d.domainName}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                onClick={addEmailAddress}
                                disabled={!newEmailLocal || addingEmail}
                                className="h-9"
                              >
                                {addingEmail ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                                Add
                              </Button>
                            </div>
                            {emailError && (
                              <div className="flex items-center gap-2 text-[12px] text-destructive">
                                <AlertCircle className="h-3 w-3" /> {emailError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground/50" />
                <CardTitle className="text-[16px] tracking-tight font-semibold">Profile</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground/40 text-[13px]">Your display name and email signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-[13px] text-foreground/70 font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName || ''}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  onBlur={() => save({ displayName: settings.displayName })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature" className="text-[13px] text-foreground/70 font-medium">Email Signature</Label>
                <textarea
                  id="signature"
                  value={settings.emailSignature || ''}
                  onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                  onBlur={() => save({ emailSignature: settings.emailSignature })}
                  placeholder="Your email signature..."
                  rows={4}
                  className="flex w-full rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary/20 focus-visible:bg-white/[0.04] transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <Palette className="h-4 w-4 text-muted-foreground/50" />
                <CardTitle className="text-[16px] tracking-tight font-semibold">Appearance</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground/40 text-[13px]">Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] text-foreground/70 font-medium">Theme</Label>
                  <p className="text-[12px] text-muted-foreground/35 mt-1">Choose your preferred theme</p>
                </div>
                <Select
                  value={settings.theme}
                  onChange={(e) => update('theme', e.target.value as UserSettings['theme'])}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-muted-foreground/50" />
                <CardTitle className="text-[16px] tracking-tight font-semibold">AI Preferences</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground/40 text-[13px]">Control AI-powered features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] text-foreground/70 font-medium">Email Classification</Label>
                  <p className="text-[12px] text-muted-foreground/35 mt-1">Auto-categorize incoming emails</p>
                </div>
                <Switch
                  checked={settings.aiClassification}
                  onCheckedChange={(v) => update('aiClassification', v)}
                />
              </div>
              <div className="divider-subtle" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] text-foreground/70 font-medium">Reply Suggestions</Label>
                  <p className="text-[12px] text-muted-foreground/35 mt-1">Get AI-generated reply suggestions</p>
                </div>
                <Switch
                  checked={settings.aiReplySuggestions}
                  onCheckedChange={(v) => update('aiReplySuggestions', v)}
                />
              </div>
              <div className="divider-subtle" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] text-foreground/70 font-medium">Default Compose Tone</Label>
                  <p className="text-[12px] text-muted-foreground/35 mt-1">AI writing style for composed emails</p>
                </div>
                <Select
                  value={settings.aiComposeTone}
                  onChange={(e) => update('aiComposeTone', e.target.value as UserSettings['aiComposeTone'])}
                  options={[
                    { value: 'professional', label: 'Professional' },
                    { value: 'casual', label: 'Casual' },
                    { value: 'friendly', label: 'Friendly' },
                  ]}
                  className="w-40"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
