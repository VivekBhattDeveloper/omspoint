import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Route } from "./+types/_app.vendor.products._index";

type ProductStats = {
  total: number;
  statusCounts: Record<"active" | "draft" | "archived", number>;
  totalVariants: number;
  averageVariants: number;
  totalMedia: number;
};

type LoaderProduct = {
  id: string;
  title: string;
  status: string | null;
  updatedAt: string | null;
  variantCount: number;
  mediaCount: number;
};

type LoaderResult = {
  stats: ProductStats;
  products: LoaderProduct[];
  isSample: boolean;
  errorMessage?: string;
};

const sampleProducts: LoaderProduct[] = [
  {
    id: "sample-product-1",
    title: "Premium Eco Hoodie",
    status: "active",
    updatedAt: "2024-02-28T12:00:00.000Z",
    variantCount: 6,
    mediaCount: 4,
  },
  {
    id: "sample-product-2",
    title: "SolarFlex Travel Bottle",
    status: "draft",
    updatedAt: "2024-02-26T09:30:00.000Z",
    variantCount: 3,
    mediaCount: 2,
  },
  {
    id: "sample-product-3",
    title: "Atlas Pro Backpack",
    status: "archived",
    updatedAt: "2024-02-20T18:45:00.000Z",
    variantCount: 5,
    mediaCount: 5,
  },
];

const computeStats = (products: LoaderProduct[]): ProductStats => {
  const total = products.length;
  const statusCounts = products.reduce<ProductStats["statusCounts"]>(
    (counts, product) => {
      const key = (product.status ?? "unknown") as keyof ProductStats["statusCounts"];
      if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    { active: 0, draft: 0, archived: 0 }
  );
  const totalVariants = products.reduce((sum, product) => sum + product.variantCount, 0);
  const totalMedia = products.reduce((sum, product) => sum + product.mediaCount, 0);

  return {
    total,
    statusCounts,
    totalVariants,
    averageVariants: total ? totalVariants / total : 0,
    totalMedia,
  };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.vendorProduct.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        variants: { edges: { node: { id: true } } },
        media: { edges: { node: { id: true } } },
      },
      sort: { updatedAt: "Descending" },
      first: 250,
    });

    const products: LoaderProduct[] = records.map((record, index) => ({
      id: record.id ?? `vendor-product-${index}`,
      title: record.title ?? "Untitled product",
      status: record.status ?? null,
      updatedAt: record.updatedAt ?? null,
      variantCount: record.variants?.edges?.length ?? 0,
      mediaCount: record.media?.edges?.length ?? 0,
    }));

    return {
      stats: computeStats(products),
      products,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load vendor products", error);

    return {
      stats: computeStats(sampleProducts),
      products: sampleProducts,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorProductsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const integer = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { dateStyle: "medium", timeStyle: "short" }),
    [],
  );
  const { stats, products, isSample, errorMessage } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`Managing ${integer.format(stats.total)} vendor catalog items for production readiness.`}
        actions={
          <Button onClick={() => navigate("/vendor/products/new")}>
            New product
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total products</CardDescription>
            <CardTitle className="text-3xl">{integer.format(stats.total)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Active</span><span>{integer.format(stats.statusCounts.active)}</span></div>
            <div className="flex justify-between"><span>Draft</span><span>{integer.format(stats.statusCounts.draft)}</span></div>
            <div className="flex justify-between"><span>Archived</span><span>{integer.format(stats.statusCounts.archived)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Variants in scope</CardDescription>
            <CardTitle className="text-3xl">{integer.format(stats.totalVariants)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats.total ? `${number.format(stats.averageVariants)} avg per product` : "Variants appear once products are added"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Media assets</CardDescription>
            <CardTitle className="text-3xl">{integer.format(stats.totalMedia)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Images and other assets attached to vendor products
          </CardContent>
        </Card>
      </div>

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load vendor products from the API. Showing sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalog records</CardTitle>
          <CardDescription>Vendor-owned inventory for production and fulfillment.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    onClick={() => navigate(`/vendor/products/${product.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/vendor/products/${product.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "outline"} className="capitalize">
                        {product.status ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{integer.format(product.variantCount)}</TableCell>
                    <TableCell>{integer.format(product.mediaCount)}</TableCell>
                    <TableCell>
                      {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="px-2 text-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/vendor/products/${product.id}`);
                        }}
                      >
                        Edit
                      </Button>
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
