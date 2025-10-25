import { useNavigate } from "react-router";
import { Provider as GadgetProvider } from "@gadgetinc/react";
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
import type { Route } from "./+types/_app.vendor.finance.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const payment = await context.api.payment.findOne(params.id, {
    select: {
      id: true,
      amount: true,
      paymentDate: true,
      paymentMethod: true,
      order: { id: true, orderId: true },
    },
  });

  return { payment };
};

export default function VendorPaymentDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { payment } = loaderData;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
  const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      <PageHeader
        title={`Payment ${payment.order?.orderId ?? payment.id}`}
        description="Confirm settled amounts and adjust payout metadata."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amount</CardDescription>
            <CardTitle className="text-2xl">{currency.format(payment.amount ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Method: {payment.paymentMethod?.replace(/([A-Z])/g, " $1").trim() ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment date</CardDescription>
            <CardTitle className="text-lg">
              {payment.paymentDate ? dateTime.format(new Date(payment.paymentDate)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Order: {payment.order?.orderId ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reconciliation</CardDescription>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Confirm settlement in finance reconciliation.</p>
            <p>• Notify seller when payout is sent.</p>
            <p>• Cross-check with bank batch reference.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.payment.update}
            findBy={payment.id}
            onSuccess={() => navigate("/vendor/finance")}
          >
            <SubmitResultBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoNumberInput field="amount" />
              <AutoEnumInput field="paymentMethod" />
              <AutoDateTimePicker field="paymentDate" />
              <AutoBelongsToInput field="order" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <AutoSubmit>Save changes</AutoSubmit>
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
    </div>
    </GadgetProvider>
  );
}
