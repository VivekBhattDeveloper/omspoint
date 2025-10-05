import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../api";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.products._index";

type ProductStats = {
  total: number;
  attached: number;
  unattached: number;
  averagePrice: number;
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const records = await context.api.product.findMany({
    select: {
      id: true,
      price: true,
      order: { id: true },
    },
    first: 250,
  });

  const total = records.length;
  const attached = records.filter((record) => Boolean(record.order?.id)).length;
  const unattached = total - attached;
  const sumPrice = records.reduce((sum, record) => sum + (record.price ?? 0), 0);
  const averagePrice = total ? sumPrice / total : 0;

  return {
    stats: { total, attached, unattached, averagePrice } satisfies ProductStats,
  };
};

export default function AdminProductsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description={`Managing ${number.format(stats.total)} catalog items across the network.`}
        actions={
          <Button onClick={() => navigate("/admin/products/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New product
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total SKUs</CardDescription>
            <CardTitle className="text-3xl">{number.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Attached to orders</span>
              <span>{number.format(stats.attached)}</span>
            </div>
            <div className="flex justify-between">
              <span>Unassigned</span>
              <span>{number.format(stats.unattached)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Order coverage</CardDescription>
            <CardTitle className="text-3xl">{stats.total ? Math.round((stats.attached / stats.total) * 100) : 0}%</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {number.format(stats.attached)} attached · {number.format(stats.unattached)} available
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average price</CardDescription>
            <CardTitle className="text-3xl">{currency.format(stats.averagePrice)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Calculated across all catalog entries in scope
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog records</CardTitle>
          <CardDescription>Centralized source of truth for SKUs flowing through the OMS.</CardDescription>
        </CardHeader>
        <CardContent>
          <AutoTable
            model={api.product}
            onClick={(product) => navigate(`/admin/products/${product.id}`)}
            columns={[
              { header: "Name", field: "productName" },
              {
                header: "Price",
                render: ({ record }) => (
                  <span className="tabular-nums">{currency.format(record.price ?? 0)}</span>
                ),
              },
              {
                header: "Order",
                render: ({ record }) => record.order?.orderId ?? "—",
              },
              {
                header: "Description",
                render: ({ record }) => (
                  <span className="line-clamp-1">{record.productDescription ?? "—"}</span>
                ),
              },
              {
                header: "Status",
                render: ({ record }) => (
                  <Badge variant="outline" className="capitalize">
                    {record.order ? "Attached" : "Unassigned"}
                  </Badge>
                ),
              },
            ]}
            select={{
              id: true,
              productName: true,
              price: true,
              productDescription: true,
              order: {
                id: true,
                orderId: true,
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
