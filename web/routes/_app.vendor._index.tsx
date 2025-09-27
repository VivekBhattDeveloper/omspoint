import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Command Center"
        description="Track capacity, SLA adherence, and finance health across your production network."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active orders</CardTitle>
            <CardDescription>Orders currently assigned to this vendor pod.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Print queue</CardTitle>
            <CardDescription>Jobs in preflight, jig, or production states.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Return rate</CardTitle>
            <CardDescription>RMA share over trailing 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
