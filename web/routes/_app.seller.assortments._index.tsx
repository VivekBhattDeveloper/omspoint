import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerAssortmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assortments"
        description="Group catalog items into channel-specific assortments with guardrails."
      />
      <Card>
        <CardHeader>
          <CardTitle>Planning</CardTitle>
          <CardDescription>Integrate with merchandising service once available.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Create assortment templates per channel or season.</li>
            <li>Apply attribute filters and brand guidelines.</li>
            <li>Share with collaborators for approval flows.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
