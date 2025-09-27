import { AutoTable } from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Teams"
        description="Audit memberships, verify invitations, and manage access across the workspace."
      />
      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Full list of users provisioned in this environment.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.user}
            selectable={false}
            columns={["firstName", "lastName", "email", "roles", { header: "Verified", field: "emailVerified" }]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
