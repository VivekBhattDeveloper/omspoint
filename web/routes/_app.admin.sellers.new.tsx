import { AutoForm, AutoInput, AutoSubmit, SubmitResultBanner } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, redirect } from "react-router";
import { ChevronLeft } from "lucide-react";
import { api } from "../api";
import type { Route } from "./+types/_app.admin.sellers.new";

export const loader = async ({ context }: Route.LoaderArgs) => {
  // Load vendors for the vendor selection dropdown
  const vendors = await context.api.vendor.findMany({
    select: {
      id: true,
      name: true,
    },
    sort: { name: "Ascending" },
  });

  return { vendors };
};

export default function ({ loaderData }: Route.ComponentProps) {
  const { vendors } = loaderData;

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/sellers" className="flex items-center space-x-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Sellers</span>
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">/</div>
        <div className="text-sm text-muted-foreground">Add New Seller</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Seller</h1>
          <p className="text-muted-foreground">
            Create a new seller record with all required information.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Seller Information</CardTitle>
          <CardDescription>
            Fill in the details below to create a new seller.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.seller.create}
            onSuccess={() => {
              window.location.href = "/admin/sellers";
            }}
          >
            <div className="space-y-6">
              <SubmitResultBanner />
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AutoInput field="name" />
                  <AutoInput field="email" />
                </div>
                <AutoInput field="phoneNumber" />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>
                <AutoInput field="address" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AutoInput field="city" />
                  <AutoInput field="state" />
                  <AutoInput field="zip" />
                </div>
                <AutoInput field="country" />
              </div>

              {/* Vendor Association */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vendor Association</h3>
                <AutoInput field="vendor" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <AutoSubmit className="order-1 sm:order-2">
                  Create Seller
                </AutoSubmit>
                <Button 
                  variant="outline" 
                  asChild
                  className="order-2 sm:order-1"
                >
                  <Link to="/admin/sellers">Cancel</Link>
                </Button>
              </div>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
