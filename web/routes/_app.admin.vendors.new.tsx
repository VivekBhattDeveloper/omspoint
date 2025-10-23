import { useNavigate } from "react-router";
import { AutoForm, AutoInput, AutoSubmit, SubmitResultBanner } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function NewVendor() {
  const navigate = useNavigate();

  const handleSuccess = (record: any) => {
    // Redirect to the vendor detail page after successful creation
    navigate(`/admin/vendors/${record.id}`);
  };

  const handleCancel = () => {
    // Navigate back to the vendors listing page
    navigate("/admin/vendors");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.vendor.create}
            onSuccess={handleSuccess}
          >
            <SubmitResultBanner />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutoInput field="name" />
                <AutoInput field="email" />
              </div>
              
              <AutoInput field="phoneNumber" />
              
              <AutoInput field="address" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AutoInput field="city" />
                <AutoInput field="state" />
                <AutoInput field="zip" />
              </div>
              
              <AutoInput field="country" />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <AutoSubmit>
                Create Vendor
              </AutoSubmit>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
