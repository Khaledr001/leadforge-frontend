'use client';

import { useState } from 'react';
import { CheckCircle2, Plug, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

function EnvField({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} placeholder={placeholder ?? `Set ${name} in the backend .env`} disabled />
      <p className="text-xs text-muted-foreground">Configured via <code className="font-mono">{name}</code> in the backend environment.</p>
    </div>
  );
}

export default function SettingsPage() {
  const [health, setHealth] = useState<'unknown' | 'ok' | 'down'>('unknown');

  const testConnection = async () => {
    try {
      await api.health();
      setHealth('ok');
      toast.success('API connection OK');
    } catch {
      setHealth('down');
      toast.error(`Cannot reach the API at ${API_URL}`);
    }
  };

  const testEmail = () => {
    toast.info('SMTP is not configured — outreach runs in dry-run mode. Set SMTP_* in the backend .env to send real email.');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">General</CardTitle>
              <CardDescription>Backend connection and environment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border rounded-md px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <Plug className="size-4" /> API: <code className="font-mono text-xs">{API_URL}</code>
                </span>
                <span className="flex items-center gap-2">
                  {health === 'ok' && <Badge className="bg-emerald-100 text-emerald-700 border-transparent"><CheckCircle2 className="size-3" /> Connected</Badge>}
                  {health === 'down' && <Badge variant="destructive"><XCircle className="size-3" /> Unreachable</Badge>}
                  <Button size="sm" variant="outline" onClick={testConnection}>Test API connection</Button>
                </span>
              </div>
              <EnvField label="Dashboard URL" name="DASHBOARD_URL" placeholder="http://localhost:3000" />
              <EnvField label="Site base domain" name="SITE_BASE_DOMAIN" placeholder="yourbrand.site" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">API Keys</CardTitle>
              <CardDescription>External service credentials (backend .env). Empty keys degrade gracefully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnvField label="Google Places" name="GOOGLE_PLACES_API_KEY" />
              <EnvField label="Anthropic (AI copy)" name="ANTHROPIC_API_KEY" />
              <EnvField label="Cloudflare (deploys)" name="CLOUDFLARE_API_TOKEN" />
              <EnvField label="Stripe" name="STRIPE_SECRET_KEY" />
              <EnvField label="Vapi (receptionist)" name="VAPI_API_KEY" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email</CardTitle>
              <CardDescription>SMTP settings for outreach sending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnvField label="SMTP host" name="SMTP_HOST" />
              <EnvField label="From name" name="SMTP_FROM_NAME" placeholder="LeadForge" />
              <EnvField label="From email" name="SMTP_FROM_EMAIL" placeholder="outreach@yourdomain.com" />
              <EnvField label="Physical address (CAN-SPAM)" name="SENDER_ADDRESS" />
              <Button size="sm" variant="outline" onClick={testEmail}>Send test email</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Website templates</CardTitle>
              <CardDescription>Astro templates used by the site generator.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5">
                {['trades — navy + amber', 'beauty — rose + soft gold (DM Sans)', 'food — terracotta + warm gold', 'auto — charcoal + red', 'home — forest green + earth'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">template-{t.split(' ')[0]}</Badge>
                    <span className="text-muted-foreground">{t.split('— ')[1]}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
