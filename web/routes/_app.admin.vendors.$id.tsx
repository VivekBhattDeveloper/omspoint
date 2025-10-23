import type { Route } from "./+types/_app.admin.vendors.$id";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAction } from "@gadgetinc/react";
import { AutoForm, AutoInput, AutoSubmit, SubmitResultBanner } from "@/components/auto";
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
import { toast } from "sonner";
import { Trash2, Plus, Edit, Phone, Mail } from "lucide-react";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const vendorId = params.id;
  
  // Fetch the vendor and its associated sellers
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
            phoneNumber: true
          }
        }
      }
    }
  });

  return { vendor };
};

export default function VendorDetail({ loaderData }: Route.ComponentProps) {
  const { vendor } = loaderData;
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [{ fetching: deleting, error: deleteError }, deleteVendor] = useAction(api.vendor.delete);
  const [{ fetching: deletingSeller, error: deleteSellerError }, deleteSeller] = useAction(api.seller.delete);

  const handleCancel = () => {
    navigate("/admin/vendors");
  };

  const handleSuccess = () => {
    toast.success("Vendor updated successfully!");
    navigate("/admin/vendors");
  };

  const handleDeleteVendor = async () => {
    try {
      await deleteVendor({ id: vendor.id });
      toast.success("Vendor deleted successfully!");
      navigate("/admin/vendors");
    } catch (error) {
      toast.error("Failed to delete vendor. Please try again.");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteSeller = async (sellerId: string) => {
    try {
      await deleteSeller({ id: sellerId });
      toast.success("Seller deleted successfully!");
      // Refresh the page to update the sellers list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete seller. Please try again.");
    }
  };

  const handleAddSeller = () => {
    navigate(`/admin/sellers/new?vendorId=${vendor.id}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/admin/vendors" className="hover:text-foreground">
          Vendors
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{vendor.name}</span>
      </nav>

      {/* Header */}
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
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? "Deleting..." : "Delete Vendor"}
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

      {/* Error Display */}
      {deleteError && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          Error deleting vendor: {deleteError.toString()}
        </div>
      )}
      {deleteSellerError && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          Error deleting seller: {deleteSellerError.toString()}
        </div>
      )}

      {/* Vendor Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm 
            action={api.vendor.update}
            findBy={vendor.id}
            onSuccess={handleSuccess}
          >
            <SubmitResultBanner />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AutoInput field="name" />
              <AutoInput field="email" />
              <AutoInput field="phoneNumber" />
              <AutoInput field="address" />
              <AutoInput field="city" />
              <AutoInput field="state" />
              <AutoInput field="zip" />
              <AutoInput field="country" />
            </div>
            
            <div className="flex space-x-4">
              <AutoSubmit />
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>

      {/* Associated Sellers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Associated Sellers ({vendor.sellers.edges.length})</CardTitle>
          <div className="flex items-center space-x-2">
            {vendor.sellers.edges.length > 0 && (
              <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/vendors/${vendor.id}/sellers`}>
                  View All Sellers
                </Link>
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
                <div key={seller.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                        <Button variant="outline" size="sm" disabled={deletingSeller}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Seller</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{seller.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSeller(seller.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Seller
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No sellers associated with this vendor yet.</p>
              <Button onClick={handleAddSeller} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Seller
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
