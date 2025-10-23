import { useNavigate } from "react-router";
import { AutoForm, AutoInput, AutoSubmit, SubmitResultBanner } from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function AdminInviteCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create invite"
        description="Issue a new invitation link for platform access."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Invite details</CardTitle>
          <CardDescription>Provide recipient information and optional token overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.invite.create}
            onSuccess={() => navigate("/admin/invites")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="email" />
              <AutoInput field="inviteToken" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Send invite</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
