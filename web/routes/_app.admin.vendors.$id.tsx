import type { Route } from "./+types/_app.admin.vendors.$id";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Trash2, Plus, Edit, Phone, Mail } from "lucide-react";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const vendorId = params.id;

  const vendor = await context.api.vendor.findOne(vendorId, {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      country: true,
      sellers: {
        edges: {
          node: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    },
  });

  return { vendor };
};

export default function VendorDetail({ loaderData }: Route.ComponentProps) {
  const { vendor } = loaderData;
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: vendor.name ?? "",
    email: vendor.email ?? "",
    phoneNumber: vendor.phoneNumber ?? "",
    address: vendor.address ?? "",
    city: vendor.city ?? "",
    state: vendor.state ?? "",
    zip: vendor.zip ?? "",
    country: vendor.country ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingVendor, setIsDeletingVendor] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.vendor.update(vendor.id, { ...formValues });
      toast.success("Vendor updated successfully!");
    } catch (error) {
      console.error("Failed to update vendor", error);
      setFormError(
        error instanceof Error ? error.message : "Unable to update vendor. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async () => {
    setIsDeletingVendor(true);
    setFormError(null);
    try {
      await api.vendor.delete(vendor.id);
      toast.success("Vendor deleted successfully!");
      navigate("/admin/vendors");
    } catch (error) {
      console.error("Failed to delete vendor", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to delete vendor. Please try again."
      );
      toast.error("Failed to delete vendor. Please try again.");
    } finally {
      setIsDeletingVendor(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    setSellerError(null);
    try {
      await api.seller.delete(sellerId);
      toast.success("Seller deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete seller", error);
      setSellerError(
        error instanceof Error ? error.message : "Failed to delete seller. Please try again."
      );
      toast.error("Failed to delete seller. Please try again.");
    }
  };

  const handleAddSeller = () => {
    navigate(`/admin/sellers/new?vendorId=${vendor.id}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/admin/vendors" className="hover:text-foreground">
          Vendors
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{vendor.name}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Vendor</h1>
          <p className="text-muted-foreground">Update vendor information and manage sellers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to="/admin/vendors">← Back to Vendors</Link>
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeletingVendor}>
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeletingVendor ? "Deleting..." : "Delete Vendor"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{vendor.name}"? This action cannot be undone and will also delete all associated sellers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteVendor}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Vendor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      {sellerError && (
        <Alert variant="destructive">
          <AlertTitle>Seller action failed</AlertTitle>
          <AlertDescription>{sellerError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
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
                <Input
                  id="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                />
              </div>
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
              <Button type="button" variant="outline" onClick={() => navigate("/admin/vendors")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Associated Sellers ({vendor.sellers.edges.length})</CardTitle>
          <div className="flex items-center space-x-2">
            {vendor.sellers.edges.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/vendors/${vendor.id}/sellers`}>View All Sellers</Link>
              </Button>
            )}
            <Button onClick={handleAddSeller} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Seller
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vendor.sellers.edges.length > 0 ? (
            <div className="space-y-4">
              {vendor.sellers.edges.map(({ node: seller }) => (
                <div
                  key={seller.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{seller.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {seller.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {seller.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/sellers/${seller.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove seller</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{seller.name}" from this vendor? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSeller(seller.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete seller
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sellers associated with this vendor yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
