import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Headquarters"
        description="Track sales performance, fulfillment health, and settlement cadence across channels."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gross sales</CardTitle>
            <CardDescription>Rolling 7-day GMV across connected channels.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fill rate</CardTitle>
            <CardDescription>Orders shipped vs. received.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settlement status</CardTitle>
            <CardDescription>Next payout window and outstanding balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">—</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
