import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerCatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog"
        description="Curate assortments, map attributes, and sync listings with marketplaces."
      />
      <Card>
        <CardHeader>
          <CardTitle>Future functionality</CardTitle>
          <CardDescription>Tie into product and listing services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Filter products by assortment, season, or availability.</li>
            <li>Enforce brand rules before publishing to channels.</li>
            <li>Show validation errors from listing ingestion.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
