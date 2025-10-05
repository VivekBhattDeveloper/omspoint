import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "../api";
import { Plus, Search } from "lucide-react";
import type { Route } from "./+types/_app.admin.invites._index";

type InviteStats = {
  total: number;
  withTokens: number;
  withoutTokens: number;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const invites = await context.api.invite.findMany({
    select: {
      id: true,
      inviteToken: true,
    },
    first: 250,
  });

  const total = invites.length;
  const withTokens = invites.filter((invite) => Boolean(invite.inviteToken)).length;
  const withoutTokens = total - withTokens;

  return {
    stats: { total, withTokens, withoutTokens } satisfies InviteStats,
  };
};

export default function AdminInvitesIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invites"
        description={`Managing ${number.format(stats.total)} invitations across the workspace.`}
        actions={
          <Button onClick={() => navigate("/admin/invites/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New invite
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total invites</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Active across all workspaces
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready to send</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.withTokens)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Invites with generated tokens available
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Needs action</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.withoutTokens)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Invites missing tokens, generate before distribution
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invites by email"
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
          <CardDescription>Review outstanding access requests and regenerate tokens if required.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.invite}
            search={search}
            onClick={(invite) => navigate(`/admin/invites/${invite.id}`)}
            columns={[
              { header: "Email", field: "email" },
              {
                header: "Token",
                render: ({ record }) => (
                  <code className="text-xs">{record.inviteToken ?? "—"}</code>
                ),
              },
            ]}
            select={{
              id: true,
              email: true,
              inviteToken: true,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
