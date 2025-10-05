import { useFindOne } from "@gadgetinc/react";
import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/_app.vendors.$vendorId.sellers._index";
import { api } from "@/api";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useAction } from "@gadgetinc/react";
import { toast } from "sonner";

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const vendorId = params.vendorId;
  if (!vendorId) {
    throw new Response("Vendor ID is required", { status: 400 });
  }

  try {
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
      }
    });
    return { vendor };
  } catch (error) {
    throw new Response("Vendor not found", { status: 404 });
  }
};

export default function VendorSellersPage({ loaderData }: Route.ComponentProps) {
  const { vendor } = loaderData;
  const navigate = useNavigate();
  const [{ fetching: deleting }, deleteSeller] = useAction(api.seller.delete);

  const handleDeleteSeller = async (sellerId: string) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await deleteSeller({ id: sellerId });
        toast.success("Seller deleted successfully");
      } catch (error) {
        toast.error("Failed to delete seller");
      }
    }
  };

  const handleRowClick = (seller: any) => {
    navigate(`/vendors/${vendor.id}/sellers/${seller.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/vendors" className="hover:text-foreground">
          Vendors
        </Link>
        <span>/</span>
        <Link to={`/vendors/${vendor.id}`} className="hover:text-foreground">
          {vendor.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">Sellers</span>
      </div>

      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/vendors/${vendor.id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vendor</span>
        </Button>
      </div>

      {/* Vendor Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{vendor.name} - Sellers</CardTitle>
              <p className="text-muted-foreground mt-1">
                Manage sellers for this vendor
              </p>
            </div>
            <Badge variant="secondary">Vendor</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span> {vendor.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {vendor.phoneNumber}
            </div>
            <div>
              <span className="font-medium">Address:</span> {vendor.address}
            </div>
            <div>
              <span className="font-medium">Location:</span> {vendor.city}, {vendor.state} {vendor.zip}, {vendor.country}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Add New Seller Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Sellers</h2>
          <p className="text-muted-foreground">All sellers associated with {vendor.name}</p>
        </div>
        <Button 
          onClick={() => navigate(`/vendors/${vendor.id}/sellers/new`)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Seller</span>
        </Button>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardContent className="p-6">
          <AutoTable
            model={api.seller}
            filter={{ vendorId: { equals: vendor.id } }}
            columns={[
              "name",
              "email",
              "phoneNumber",
              {
                header: "Location",
                render: ({ record }) => (
                  <div className="text-sm">
                    {record.city}, {record.state}
                  </div>
                ),
              },
              "address",
              {
                header: "Orders",
                render: ({ record }) => (
                  <Badge variant="outline">
                    {record.orders?.edges?.length || 0} orders
                  </Badge>
                ),
              },
              {
                header: "Actions",
                render: ({ record }) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vendors/${vendor.id}/sellers/${record.id}/edit`);
                      }}
                      disabled={deleting}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSeller(record.id);
                      }}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            onClick={handleRowClick}
            select={{
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              city: true,
              state: true,
              address: true,
              orders: {
                edges: {
                  node: {
                    id: true,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}