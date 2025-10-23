import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { Route } from "./+types/_app.admin.products._index";

type ProductStats = {
  total: number;
  attached: number;
  unattached: number;
  averagePrice: number;
};

type LoaderProduct = {
  id: string;
  name: string;
  price: number | null;
  orderId: string | null;
  descriptionHTML: string | null;
  isAttached: boolean;
};

type LoaderResult = {
  stats: ProductStats;
  products: LoaderProduct[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleProducts: LoaderProduct[] = [
  {
    id: "sample-1",
    name: "MerchX Premium Hoodie",
    price: 68,
    orderId: "ORD-1024",
    descriptionHTML: "French terry zip hoodie with embroidered logo accents.",
    isAttached: true,
  },
  {
    id: "sample-2",
    name: "SolarFlex Travel Bottle",
    price: 28,
    orderId: null,
    descriptionHTML: "Insulated stainless steel bottle with leak-proof flip straw.",
    isAttached: false,
  },
  {
    id: "sample-3",
    name: "Atlas Pro Backpack",
    price: 94,
    orderId: "ORD-1007",
    descriptionHTML: "Water-resistant shell, padded laptop sleeve, and quick-access pockets.",
    isAttached: true,
  },
];

const calculateStats = (products: LoaderProduct[]): ProductStats => {
  const total = products.length;
  const attached = products.filter((product) => product.isAttached).length;
  const unattached = total - attached;
  const sumPrice = products.reduce((sum, product) => sum + (product.price ?? 0), 0);
  const averagePrice = total ? sumPrice / total : 0;

  return { total, attached, unattached, averagePrice };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.product.findMany({
      select: {
        id: true,
        productName: true,
        price: true,
        productDescription: { truncatedHTML: true },
        order: { id: true, orderId: true },
      },
      sort: { createdAt: "Descending" },
      first: 250,
    });

    const products: LoaderProduct[] = records.map((record, index) => ({
      id: record.id ?? `product-${index}`,
      name: record.productName ?? "Untitled product",
      price: typeof record.price === "number" ? record.price : null,
      orderId: record.order?.orderId ?? null,
      descriptionHTML: record.productDescription?.truncatedHTML ?? null,
      isAttached: Boolean(record.order?.id),
    }));

    return {
      stats: calculateStats(products),
      products,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load products catalog", error);

    return {
      stats: calculateStats(sampleProducts),
      products: sampleProducts,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function AdminProductsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const currency = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const { stats, products, isSample, errorMessage } = loaderData;
  const hasProducts = products.length > 0;

  const handleRowActivate = (productId: string) => {
    navigate(`/admin/products/${productId}`);
  };

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

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load catalog records from the API. Displaying sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

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
          {hasProducts ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    tabIndex={0}
                    onClick={() => handleRowActivate(product.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleRowActivate(product.id);
                      }
                    }}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="tabular-nums">
                        {currency.format(product.price ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>{product.orderId ?? "—"}</TableCell>
                    <TableCell className="max-w-md">
                      {product.descriptionHTML ? (
                        <div
                          className="line-clamp-1 text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: product.descriptionHTML }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.isAttached ? "Attached" : "Unassigned"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
