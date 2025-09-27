import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPrintProfilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Profiles & Jigs"
        description="Manage devices, calibration templates, and golden samples for every production line."
      />
      <Card>
        <CardHeader>
          <CardTitle>Calibration tasks</CardTitle>
          <CardDescription>Outline future integration with printJob automation.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Surface printers, bed maps, and last calibration date.</li>
            <li>Assign jig templates to vendors and track approvals.</li>
            <li>Attach QA documentation and golden sample assets.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
