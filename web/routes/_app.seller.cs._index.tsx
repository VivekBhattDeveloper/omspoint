import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerCustomerServicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Service"
        description="Surface customer inquiries, order issues, and suggested resolutions."
      />
      <Card>
        <CardHeader>
          <CardTitle>Support backlog</CardTitle>
          <CardDescription>Integrate with your ticketing system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Pull open tickets with SLA countdowns.</li>
            <li>Escalate to vendor operations for production actions.</li>
            <li>Maintain conversation history and macros.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
