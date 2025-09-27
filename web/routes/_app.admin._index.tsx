import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Plane"
        description="Monitor global health, surface risks, and orchestrate configuration across the OMS."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
            <CardDescription>Inbound volume aggregated across sellers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Print Queue Health</CardTitle>
            <CardDescription>Average age of active jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Incidents, SLA breaches, or compliance flags.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">0 open</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
