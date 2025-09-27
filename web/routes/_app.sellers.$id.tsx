import type { Route } from "./+types/_app.sellers.$id";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api";
import { AutoForm } from "@/components/auto";
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
import { ChevronRight, ArrowLeft, Trash2, Building, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const sellerId = params.id;
  
  if (!sellerId) {
    throw new Response("Seller ID is required", { status: 400 });
  }

  try {
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

    return { seller };
  } catch (error) {
    throw new Response("Seller not found", { status: 404 });
  }
};

export default function ({ loaderData }: Route.ComponentProps) {
  const { seller } = loaderData;
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.seller.delete(seller.id);
      toast.success("Seller deleted successfully");
      navigate("/vendors");
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error("Failed to delete seller");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    toast.success("Seller updated successfully");
  };

  const handleFormError = (error: any) => {
    console.error("Error updating seller:", error);
    toast.error("Failed to update seller");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/vendors" className="hover:text-foreground">
          Vendors
        </Link>
        <ChevronRight className="h-4 w-4" />
        {seller.vendor && (
          <>
            <Link to={`/vendors/${seller.vendor.id}`} className="hover:text-foreground">
              {seller.vendor.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{seller.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{seller.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Manage seller information and view associated orders
          </p>
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
                This action cannot be undone. This will permanently delete the
                seller "{seller.name}" and all associated data.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seller Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AutoForm
                action={api.seller.update}
                findBy={seller.id}
                onSuccess={handleFormSuccess}
                onFailure={handleFormError}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
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
                  <Link
                    to={`/vendors/${seller.vendor.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
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
                      <div>{seller.vendor.address}</div>
                      <div>
                        {seller.vendor.city}, {seller.vendor.state} {seller.vendor.zip}
                      </div>
                      <div>{seller.vendor.country}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{seller.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{seller.phoneNumber}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div>{seller.address}</div>
                    <div>
                      {seller.city}, {seller.state} {seller.zip}
                    </div>
                    <div>{seller.country}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(seller.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Updated:</span>{" "}
                  {new Date(seller.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Associated Orders */}
      {seller.orders.edges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Associated Orders ({seller.orders.edges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seller.orders.edges.map(({ node: order }) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{order.orderId}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        ${order.total.toLocaleString()}
                      </div>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                            ? "secondary"
                            : order.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}