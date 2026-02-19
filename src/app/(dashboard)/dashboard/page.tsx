import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dashboard.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(['Users', 'Revenue', 'Active'] as const).map((title) => (
            <Card key={title}>
              <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-3xl">0</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Placeholder metric</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
