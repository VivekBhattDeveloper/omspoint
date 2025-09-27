import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFinanceConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Configuration"
        description="Govern fees, taxes, payout cycles, and ledger mappings for every commerce partner."
      />
      <Card>
        <CardHeader>
          <CardTitle>Finance backlog</CardTitle>
          <CardDescription>Implement with ledger & payout services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Define fee schedules and tax logic per jurisdiction.</li>
            <li>Preview settlement impact before publishing changes.</li>
            <li>Expose audit trail for adjustments and approvals.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
