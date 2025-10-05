import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoNumberInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";

export default function AdminPaymentCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log payment"
        description="Record a capture event or offline reconciliation entry."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
          <CardDescription>Provide the source, amount, timing, and order linkage.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.payment.create}
            include={["amount", "paymentMethod", "paymentDate", "order"]}
            onSuccess={() => navigate("/admin/payments")}
          >
            <SubmitResultBanner />
            <div className="grid gap-4 md:grid-cols-2">
              <AutoNumberInput field="amount" />
              <AutoEnumInput field="paymentMethod" />
              <AutoDateTimePicker field="paymentDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Save payment</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
  );
}
