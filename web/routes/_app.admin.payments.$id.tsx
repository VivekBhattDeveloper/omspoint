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
import type { Route } from "./+types/_app.admin.payments.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const payment = await context.api.payment.findOne(params.id, {
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      paymentDate: true,
      order: {
        id: true,
        orderId: true,
        total: true,
        status: true,
        orderDate: true,
      },
    },
  });

  return { payment };
};

export default function AdminPaymentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { payment } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={payment.order?.orderId ? `Payment for order ${payment.order.orderId}` : "Payment"}
        description={`Amount ${currency.format(payment.amount ?? 0)} • Captured ${payment.paymentDate ? dateTime.format(new Date(payment.paymentDate)) : "—"}`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment record</CardTitle>
          <CardDescription>Maintain accurate ledger data and downstream allocations.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.payment.update}
            findBy={payment.id}
            onSuccess={() => navigate("/admin/payments")}
          >
            <SubmitResultBanner />
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoNumberInput field="amount" />
                <AutoEnumInput field="paymentMethod" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoDateTimePicker field="paymentDate" />
                <AutoBelongsToInput field="order" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <AutoSubmit>Save changes</AutoSubmit>
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
