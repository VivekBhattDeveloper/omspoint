import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerListingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description="Publish, withdraw, and monitor listing health across marketplaces."
      />
      <Card>
        <CardHeader>
          <CardTitle>Roadmap</CardTitle>
          <CardDescription>Connect with listing synchronization services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Display channel-specific publishing status and errors.</li>
            <li>Enable bulk actions and compliance checks.</li>
            <li>Track price changes and automated repricing rules.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
