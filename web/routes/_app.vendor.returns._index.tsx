import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorReturnsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & NDR"
        description="Surface non-delivery reports, RMAs, and corrective follow-up."
      />
      <Card>
        <CardHeader>
          <CardTitle>Workflow outline</CardTitle>
          <CardDescription>Connect to returns processing service.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Track open RMAs with reason codes and deadlines.</li>
            <li>Assign restocking or reprint actions to fulfillment teams.</li>
            <li>Expose courier feedback and dispute timelines.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
