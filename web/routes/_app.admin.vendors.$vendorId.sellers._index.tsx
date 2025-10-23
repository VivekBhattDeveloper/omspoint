import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/_app.admin.vendors.$vendorId.sellers._index";
import { api } from "@/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useAction } from "@gadgetinc/react";
import { toast } from "sonner";

interface LoaderSeller {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  orderCount: number;
}

interface LoaderResult {
  vendor: {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip: string | null;
    phoneNumber: string | null;
  };
  sellers: LoaderSeller[];
}

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const vendorId = params.vendorId;
  if (!vendorId) {
    throw new Response("Vendor ID is required", { status: 400 });
  }

  const vendor = await context.api.vendor.findOne(vendorId, {
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      city: true,
      state: true,
      country: true,
      zip: true,
      phoneNumber: true,
    },
  });

  if (!vendor) {
    throw new Response("Vendor not found", { status: 404 });
  }

  const sellers = await context.api.seller.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      city: true,
      state: true,
      address: true,
      orders: { edges: { node: { id: true } } },
    },
    filter: {
      vendorId: { equals: vendorId },
    },
    first: 250,
  });

  const sellerRows: LoaderSeller[] = sellers.map((seller, index) => ({
    id: seller.id ?? `seller-${index}`,
    name: seller.name ?? "Untitled seller",
    email: seller.email ?? null,
    phoneNumber: seller.phoneNumber ?? null,
    city: seller.city ?? null,
    state: seller.state ?? null,
    address: seller.address ?? null,
    orderCount: seller.orders?.edges?.length ?? 0,
  }));

  return {
    vendor,
    sellers: sellerRows,
  } satisfies LoaderResult;
};

export default function VendorSellersPage({ loaderData }: Route.ComponentProps) {
  const { vendor, sellers } = loaderData;
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteSeller] = useAction(api.seller.delete);

  const handleDeleteSeller = async (sellerId: string) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await deleteSeller({ id: sellerId });
        toast.success("Seller deleted successfully");
        window.location.reload();
      } catch (error) {
        toast.error("Failed to delete seller");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/admin/vendors" className="hover:text-foreground">
          Vendors
        </Link>
        <span>/</span>
        <Link to={`/admin/vendors/${vendor.id}`} className="hover:text-foreground">
          {vendor.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">Sellers</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vendor</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{vendor.name} - Sellers</CardTitle>
              <p className="text-muted-foreground mt-1">Manage sellers for this vendor</p>
            </div>
            <Badge variant="secondary">Vendor</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span> {vendor.email ?? "—"}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {vendor.phoneNumber ?? "—"}
            </div>
            <div>
              <span className="font-medium">Address:</span> {vendor.address ?? "—"}
            </div>
            <div>
              <span className="font-medium">Location:</span> {[vendor.city, vendor.state, vendor.zip, vendor.country].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Sellers</h2>
          <p className="text-muted-foreground">All sellers associated with {vendor.name}</p>
        </div>
        <Button onClick={() => navigate(`/admin/vendors/${vendor.id}/sellers/new`)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Seller</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {sellers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow
                    key={seller.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/admin/vendors/${vendor.id}/sellers/${seller.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/admin/vendors/${vendor.id}/sellers/${seller.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>{seller.email ?? "—"}</TableCell>
                    <TableCell>{seller.phoneNumber ?? "—"}</TableCell>
                    <TableCell>{[seller.city, seller.state].filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{seller.orderCount} orders</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2" onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/vendors/${vendor.id}/sellers/${seller.id}/edit`)}
                          disabled={deleting}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSeller(seller.id)}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-700"
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
            <div className="py-8 text-center text-muted-foreground">No sellers found for this vendor.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
