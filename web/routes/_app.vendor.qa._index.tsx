import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorQaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Assurance"
        description="Track golden samples, defect rates, and QA holds across production lines."
      />
      <Card>
        <CardHeader>
          <CardTitle>QA backlog</CardTitle>
          <CardDescription>Integrate with quality control checkpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Show active QA exceptions and required corrective actions.</li>
            <li>Log golden sample approvals with timestamps.</li>
            <li>Attach incident photos or measurements for review.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
