import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminObservabilityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Observability"
        description="Track logs, metrics, traces, and alerts powering the OMS control plane."
      />
      <Card>
        <CardHeader>
          <CardTitle>Visibility roadmap</CardTitle>
          <CardDescription>Integrate with your observability stack (Grafana, Datadog, etc.).</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Embed runbooks and incident history for quick response.</li>
            <li>Surface SLIs/SLOs for print, shipping, and finance domains.</li>
            <li>Provide alert routing and escalation matrices.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
