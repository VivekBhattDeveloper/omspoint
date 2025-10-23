import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAction } from "@gadgetinc/react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.sellers._index";

interface LoaderSeller {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  city: string | null;
  state: string | null;
  vendorName: string | null;
}

interface LoaderResult {
  sellers: LoaderSeller[];
  isSample: boolean;
  errorMessage?: string;
}

const sampleSellers: LoaderSeller[] = [
  {
    id: "seller-sample-1",
    name: "Elena Cruz",
    email: "elena.cruz@example.com",
    phoneNumber: "+1 415 555 0101",
    city: "San Francisco",
    state: "CA",
    vendorName: "Northwind Print Co",
  },
  {
    id: "seller-sample-2",
    name: "Marcus Allen",
    email: "marcus.allen@example.com",
    phoneNumber: "+1 206 555 0199",
    city: "Seattle",
    state: "WA",
    vendorName: "Atlas Fulfillment",
  },
  {
    id: "seller-sample-3",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phoneNumber: "+44 20 7946 0110",
    city: "London",
    state: null,
    vendorName: "SolarPrint Partners",
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const sellers = await context.api.seller.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        state: true,
        vendor: {
          id: true,
          name: true,
        },
      },
      sort: { createdAt: "Descending" },
      first: 250,
    });

    const records: LoaderSeller[] = sellers.map((seller, index) => ({
      id: seller.id ?? `seller-${index}`,
      name: seller.name ?? "Untitled seller",
      email: seller.email ?? null,
      phoneNumber: seller.phoneNumber ?? null,
      city: seller.city ?? null,
      state: seller.state ?? null,
      vendorName: seller.vendor?.name ?? null,
    }));

    return {
      sellers: records,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load sellers", error);

    return {
      sellers: sampleSellers,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellersIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteSeller] = useAction(api.seller.delete);
  const [search, setSearch] = useState("");
  const { sellers, isSample, errorMessage } = loaderData;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers;
    return sellers.filter((seller) => {
      return (
        seller.name.toLowerCase().includes(term) ||
        seller.email?.toLowerCase().includes(term) ||
        seller.city?.toLowerCase().includes(term) ||
        seller.state?.toLowerCase().includes(term) ||
        seller.vendorName?.toLowerCase().includes(term)
      );
    });
  }, [sellers, search]);

  const handleDelete = async (sellerId: string, sellerName: string) => {
    if (window.confirm(`Are you sure you want to delete \\"${sellerName}\\"?`)) {
      try {
        await deleteSeller({ id: sellerId });
        toast.success(`Seller \\"${sellerName}\\" deleted.`);
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete seller", error);
        toast.error("Unable to delete seller. Please try again.");
      }
    }
  };

  const handleEdit = (sellerId: string) => {
    navigate(`/admin/sellers/${sellerId}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
        <p className="text-muted-foreground">Manage all sellers across vendors</p>
      </div>

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load seller records from the API. Displaying sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild>
          <Link to="/admin/sellers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Seller
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
          <CardDescription>View and manage seller information</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((seller) => (
                  <TableRow
                    key={seller.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/admin/sellers/${seller.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/sellers/${seller.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>{seller.email ?? "—"}</TableCell>
                    <TableCell>{seller.phoneNumber ?? "—"}</TableCell>
                    <TableCell>{[seller.city, seller.state].filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell>
                      {seller.vendorName ? (
                        <Badge variant="outline">{seller.vendorName}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2" onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(seller.id)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(seller.id, seller.name)}
                          disabled={deleting}
                          className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No sellers match your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
