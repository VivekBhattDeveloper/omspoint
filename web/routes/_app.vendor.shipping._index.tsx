import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AutoTable } from "@/components/auto";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../api";

export default function VendorShippingPage() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const filter = useMemo(() => {
    if (!methodFilter) return undefined;
    return { shipmentMethod: { equals: methodFilter } } as const;
  }, [methodFilter]);
  
  const methodBadge = (method?: string | null) => {
    if (!method) return "—";
    return (
      <Badge variant="outline" className="capitalize">
        {method.replace(/-/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Track shipments, carrier methods, and tracking numbers per order."
      />
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Click into a shipment to update tracking or status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shipments…"
              className="max-w-sm"
            />
            <Select value={methodFilter ?? "all"} onValueChange={(value) => setMethodFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="ground">Ground</SelectItem>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AutoTable
            model={api.shipment}
            search={search}
            filter={filter}
            onClick={(record) => navigate(`/vendor/shipping/${record.id}`)}
            columns={[
              { header: "Tracking #", field: "trackingNumber" },
              { header: "Method", render: ({ record }) => methodBadge(record.shipmentMethod) },
              { header: "Shipment date", field: "shipmentDate" },
              { header: "Order", field: "order.orderId" },
            ]}
            select={{
              id: true,
              trackingNumber: true,
              shipmentMethod: true,
              shipmentDate: true,
              order: { orderId: true },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
