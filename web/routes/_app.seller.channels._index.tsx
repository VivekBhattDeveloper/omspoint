import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerChannelsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Channels"
        description="Connect marketplaces, manage credentials, and review webhook health."
      />
      <Card>
        <CardHeader>
          <CardTitle>Integration checklist</CardTitle>
          <CardDescription>Connect to channel integration services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Surface connected channels with connection status.</li>
            <li>Trigger OAuth reconnect flows or rotate API tokens.</li>
            <li>Show webhook delivery metrics and retry actions.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
