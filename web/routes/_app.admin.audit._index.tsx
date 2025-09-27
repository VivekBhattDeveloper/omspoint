import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Reports"
        description="Centralize audit logs, compliance checkpoints, and operational reporting."
      />
      <Card>
        <CardHeader>
          <CardTitle>Snapshot</CardTitle>
          <CardDescription>Design compliance-ready exports and dashboards.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Provide searchable audit logs with user and model filters.</li>
            <li>Generate scheduled reports for partners and regulators.</li>
            <li>Capture approval workflows for sensitive changes.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
