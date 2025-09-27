import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerReturnsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & RMA"
        description="Manage customer returns, approve refunds, and trigger restock actions."
      />
      <Card>
        <CardHeader>
          <CardTitle>Returns backlog</CardTitle>
          <CardDescription>Wire up return management workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Provide reason codes, notes, and dispositions.</li>
            <li>Coordinate with vendor to approve reprints or credits.</li>
            <li>Track customer communications and settlements.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
