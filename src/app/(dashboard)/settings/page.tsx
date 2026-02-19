'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Settings, User, Palette, Brain, Check, Loader2 } from 'lucide-react';

interface UserSettings {
  displayName: string | null;
  emailSignature: string | null;
  theme: 'light' | 'dark' | 'system';
  aiClassification: boolean;
  aiReplySuggestions: boolean;
  aiComposeTone: 'professional' | 'casual' | 'friendly';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
        // Apply theme on load
        applyTheme(data.theme);
      });
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
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

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your preferences</p>
          </div>
          {saving && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </div>
          )}
          {saved && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
              <Check className="h-3 w-3" /> Saved
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">Profile</CardTitle>
              </div>
              <CardDescription>Your display name and email signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName || ''}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  onBlur={() => save({ displayName: settings.displayName })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">Email Signature</Label>
                <textarea
                  id="signature"
                  value={settings.emailSignature || ''}
                  onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                  onBlur={() => save({ emailSignature: settings.emailSignature })}
                  placeholder="Your email signature..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground mt-1">Choose your preferred theme</p>
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
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">AI Preferences</CardTitle>
              </div>
              <CardDescription>Control AI-powered features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Classification</Label>
                  <p className="text-xs text-muted-foreground mt-1">Auto-categorize incoming emails</p>
                </div>
                <Switch
                  checked={settings.aiClassification}
                  onCheckedChange={(v) => update('aiClassification', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reply Suggestions</Label>
                  <p className="text-xs text-muted-foreground mt-1">Get AI-generated reply suggestions</p>
                </div>
                <Switch
                  checked={settings.aiReplySuggestions}
                  onCheckedChange={(v) => update('aiReplySuggestions', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default Compose Tone</Label>
                  <p className="text-xs text-muted-foreground mt-1">AI writing style for composed emails</p>
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
