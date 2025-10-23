import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import { Plus, Search } from "lucide-react";
import type { Route } from "./+types/_app.admin.invites._index";

type InviteStats = {
  total: number;
  withTokens: number;
  withoutTokens: number;
};

type LoaderInvite = {
  id: string;
  email: string;
  inviteToken: string | null;
};

type LoaderResult = {
  stats: InviteStats;
  invites: LoaderInvite[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleInvites: LoaderInvite[] = [
  { id: "sample-1", email: "avery.nguyen@example.com", inviteToken: "HQ-ONBOARD-8D3FA2" },
  { id: "sample-2", email: "morgan.lee@example.com", inviteToken: null },
  { id: "sample-3", email: "jordan.patel@example.com", inviteToken: "VENDOR-ACCESS-91B7C" },
];

const computeStats = (invites: LoaderInvite[]): InviteStats => {
  const total = invites.length;
  const withTokens = invites.filter((invite) => Boolean(invite.inviteToken)).length;
  const withoutTokens = total - withTokens;
  return { total, withTokens, withoutTokens };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const invites = await context.api.invite.findMany({
      select: {
        id: true,
        email: true,
        inviteToken: true,
      },
      first: 250,
    });

    const records: LoaderInvite[] = invites.map((invite, index) => ({
      id: invite.id ?? `invite-${index}`,
      email: invite.email ?? "unknown@example.com",
      inviteToken: invite.inviteToken ?? null,
    }));

    return {
      stats: computeStats(records),
      invites: records,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load invites", error);

    return {
      stats: computeStats(sampleInvites),
      invites: sampleInvites,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminInvitesIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, invites, isSample, errorMessage } = loaderData;

  const filtered = invites.filter((invite) =>
    invite.email.toLowerCase().includes(search.trim().toLowerCase()),
  );

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

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load invites from the API. Showing sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

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
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Token</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invite) => (
                  <TableRow
                    key={invite.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/admin/invites/${invite.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/invites/${invite.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>
                      <code className="text-xs">{invite.inviteToken ?? "—"}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No invites match your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
