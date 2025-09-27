import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRoutingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Routing & SLA Policies"
        description="Configure routing weights, SLA targets, and failover strategies for order distribution."
      />
      <Card>
        <CardHeader>
          <CardTitle>Policy design</CardTitle>
          <CardDescription>Connect to the orchestration service once weights are exposed.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Model capacity, region coverage, and specialization per vendor.</li>
            <li>Simulate routing scenarios before activation.</li>
            <li>Capture per-policy audit history and approvers.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
