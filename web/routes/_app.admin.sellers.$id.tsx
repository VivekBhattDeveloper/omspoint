import type { Route } from "./+types/_app.admin.sellers.$id";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, ArrowLeft, Trash2, Building, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const sellerId = params.id;

  if (!sellerId) {
    throw new Response("Seller ID is required", { status: 400 });
  }

  const seller = await context.api.seller.findOne(sellerId, {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      city: true,
      state: true,
      country: true,
      zip: true,
      createdAt: true,
      updatedAt: true,
      vendor: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zip: true,
      },
      orders: {
        edges: {
          node: {
            id: true,
            orderId: true,
            orderDate: true,
            status: true,
            total: true,
          },
        },
      },
    },
  });

  const vendors = await context.api.vendor.findMany({
    select: { id: true, name: true },
    sort: { name: "Ascending" },
  });

  return { seller, vendors };
};

export default function ({ loaderData }: Route.ComponentProps) {
  const { seller, vendors } = loaderData;
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: seller.name ?? "",
    email: seller.email ?? "",
    phoneNumber: seller.phoneNumber ?? "",
    address: seller.address ?? "",
    city: seller.city ?? "",
    state: seller.state ?? "",
    country: seller.country ?? "",
    zip: seller.zip ?? "",
    vendorId: seller.vendor?.id ?? vendors[0]?.id ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.seller.delete(seller.id);
      toast.success("Seller deleted successfully");
      navigate("/admin/sellers");
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Failed to delete seller");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.seller.update(seller.id, {
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        country: formValues.country,
        zip: formValues.zip,
        vendor: formValues.vendorId ? { _link: formValues.vendorId } : null,
      });
      toast.success("Seller updated successfully");
    } catch (error) {
      console.error("Error updating seller:", error);
      setFormError(error instanceof Error ? error.message : "Failed to update seller");
      toast.error("Failed to update seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/admin/sellers" className="hover:text-foreground">
          Sellers
        </Link>
        <ChevronRight className="h-4 w-4" />
        {seller.vendor && (
          <>
            <Link to={`/admin/vendors/${seller.vendor.id}`} className="hover:text-foreground">
              {seller.vendor.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{seller.name}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{seller.name}</h1>
          </div>
          <p className="text-muted-foreground">Manage seller information and view associated orders</p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Seller
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the seller "{seller.name}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Update failed</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={formValues.name} onChange={handleChange("name")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange("email")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone number</Label>
                    <Input id="phoneNumber" value={formValues.phoneNumber} onChange={handleChange("phoneNumber")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorId">Vendor</Label>
                    <Select
                      value={formValues.vendorId}
                      onValueChange={(value) => setFormValues((current) => ({ ...current, vendorId: value }))}
                    >
                      <SelectTrigger id="vendorId">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.length === 0 ? (
                          <SelectItem value="" disabled>
                            No vendors available
                          </SelectItem>
                        ) : (
                          vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formValues.address} onChange={handleChange("address")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formValues.city} onChange={handleChange("city")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" value={formValues.state} onChange={handleChange("state")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal code</Label>
                    <Input id="zip" value={formValues.zip} onChange={handleChange("zip")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formValues.country} onChange={handleChange("country")} />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/sellers")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {seller.vendor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Associated Vendor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Link to={`/admin/vendors/${seller.vendor.id}`} className="text-lg font-semibold hover:underline">
                    {seller.vendor.name}
                  </Link>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{seller.vendor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{seller.vendor.phoneNumber}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{seller.vendor.address}</p>
                      <p>
                        {[seller.vendor.city, seller.vendor.state, seller.vendor.zip]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p>{seller.vendor.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(seller.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last updated</span>
                <span>{new Date(seller.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total orders</span>
                <Badge variant="outline">{seller.orders.edges.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {seller.orders.edges.length > 0 ? (
            <div className="space-y-4">
              {seller.orders.edges.map(({ node: order }) => (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Order {order.orderId}</span>
                      <Badge variant="outline" className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    {order.orderDate && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0 text-sm text-muted-foreground">
                    Total: ${order.total?.toFixed(2) ?? "0.00"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders associated with this seller yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
