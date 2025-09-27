import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.print-jobs.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const printJob = await context.api.printJob.findOne(params.id, {
    select: {
      id: true,
      printJobId: true,
      status: true,
      printDate: true,
      order: {
        id: true,
        orderId: true,
        seller: { id: true, name: true },
      },
    },
  });

  return { printJob };
};

export default function VendorPrintJobDetail({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { printJob } = loaderData;
  const dateTime = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Print job ${printJob.printJobId}`}
        description="Update production status, requeue jobs, or confirm completion."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle>
              <StatusBadge status={printJob.status} kind="printJob" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Order: {printJob.order?.orderId ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Print date</CardDescription>
            <CardTitle className="text-lg">
              {printJob.printDate ? dateTime.format(new Date(printJob.printDate)) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seller: {printJob.order?.seller?.name ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next steps</CardDescription>
            <CardTitle className="text-lg">Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Confirm shipment once printing completes.</p>
            <p>• Attach QA notes if reruns are required.</p>
            <p>• Notify seller ops of delays.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production details</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoForm
            action={api.printJob.update}
            findBy={printJob.id}
            onSuccess={() => navigate("/vendor/print-jobs")}
          >
            <SubmitResultBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoInput field="printJobId" />
              <AutoEnumInput field="status" />
              <AutoDateTimePicker field="printDate" />
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
  );
}
