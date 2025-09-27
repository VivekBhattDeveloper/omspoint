import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review sales performance, listings health, and settlement cadence."
      />
      <Card>
        <CardHeader>
          <CardTitle>Reporting roadmap</CardTitle>
          <CardDescription>Connect dashboards once analytics is wired in.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>GMV trends by channel and assortment.</li>
            <li>Listing compliance scores and fix-forward tasks.</li>
            <li>Settlement reconciliation views per payout cycle.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
