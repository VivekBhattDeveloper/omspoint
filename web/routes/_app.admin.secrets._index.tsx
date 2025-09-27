import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSecretsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Secrets Vault"
        description="Lock down credentials, API keys, and sensitive configuration parameters."
      />
      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>Execute once the `/admin/secrets` data source goes live.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Swap the static dataset for `api.integration` + related Gadget models when the backend contract is ready.</li>
            <li>Add component tests once the data source is dynamic.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
