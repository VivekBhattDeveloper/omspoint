import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Route } from "./+types/_app.admin.users._index";

type LoaderUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailVerified: boolean;
  roles: string[];
};

type LoaderResult = {
  users: LoaderUser[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleUsers: LoaderUser[] = [
  {
    id: "sample-1",
    firstName: "Avery",
    lastName: "Nguyen",
    email: "avery.nguyen@example.com",
    emailVerified: true,
    roles: ["Super Admin"],
  },
  {
    id: "sample-2",
    firstName: "Jordan",
    lastName: "Patel",
    email: "jordan.patel@example.com",
    emailVerified: false,
    roles: ["Vendor"],
  },
  {
    id: "sample-3",
    firstName: "Morgan",
    lastName: "Lee",
    email: "morgan.lee@example.com",
    emailVerified: true,
    roles: ["Seller"],
  },
];

const roleNamesFrom = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return [];

  const names = roles
    .map((role: any) => {
      if (!role) return null;
      if (typeof role === "string") return role;
      if (typeof role === "object") return role.name ?? role.key ?? null;
      return null;
    })
    .filter((role): role is string => Boolean(role));

  return Array.from(new Set(names));
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailVerified: true,
        roles: true as any,
      },
      first: 250,
      sort: { createdAt: "Descending" },
    });

    const users: LoaderUser[] = records.map((record, index) => ({
      id: record.id ?? `user-${index}`,
      firstName: record.firstName ?? null,
      lastName: record.lastName ?? null,
      email: record.email ?? "",
      emailVerified: Boolean(record.emailVerified),
      roles: roleNamesFrom(record.roles),
    }));

    return {
      users,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load users directory", error);

    return {
      users: sampleUsers,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    } satisfies LoaderResult;
  }
};

const formatFullName = ({ firstName, lastName }: Pick<LoaderUser, "firstName" | "lastName">) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
};

export default function AdminUsersPage({ loaderData }: Route.ComponentProps) {
  const { users, isSample, errorMessage } = loaderData;
  const hasUsers = users.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Teams"
        description="Audit memberships, verify invitations, and manage access across the workspace."
      />

      {isSample && (
        <Alert>
          <AlertTitle>Sample Data</AlertTitle>
          <AlertDescription>
            Unable to load user data from the database. Showing sample data instead.
            {errorMessage && ` Error: ${errorMessage}`}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Full list of users provisioned in this environment.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasUsers ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{formatFullName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.emailVerified ? "default" : "secondary"}>
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No users found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}