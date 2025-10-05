import { useNavigate } from "react-router";
import { AutoForm, AutoInput, AutoSubmit, SubmitResultBanner } from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.invites.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const invite = await context.api.invite.findOne(params.id, {
    select: {
      id: true,
      email: true,
      inviteToken: true,
    },
  });

  return { invite };
};

export default function AdminInviteDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { invite } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={invite.email}
        description="Regenerate or edit invitation details before sharing externally."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Invite details</CardTitle>
          <CardDescription>Update the recipient email or token as needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.invite.update}
            findBy={invite.id}
            onSuccess={() => navigate("/admin/invites")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="email" />
              <AutoInput field="inviteToken" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Save changes</AutoSubmit>
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
