import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorCatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog"
        description="Ingest SKUs, validate print assets, and maintain vendor-specific mappings."
      />
      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>Hook into the product model and asset storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Support bulk uploads with validation feedback.</li>
            <li>Preview artwork, templates, and jig alignment.</li>
            <li>Track version history and publication status.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
