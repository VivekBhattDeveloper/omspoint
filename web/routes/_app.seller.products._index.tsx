import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.products._index";

interface ProductStats {
  total: number;
  statusCounts: Record<"active" | "draft" | "archived", number>;
  totalVariants: number;
  averageVariants: number;
}

interface LoaderProduct {
  id: string;
  title: string;
  handle: string | null;
  status: string | null;
  updatedAt: string | null;
  variantCount: number;
}

interface LoaderResult {
  stats: ProductStats;
  products: LoaderProduct[];
  isSample: boolean;
  errorMessage?: string;
}

const sampleProducts: LoaderProduct[] = [
  {
    id: "seller-product-sample-1",
    title: "Marketplace Skyline Poster",
    handle: "market-skyline-poster",
    status: "active",
    updatedAt: "2024-03-02T11:00:00.000Z",
    variantCount: 4,
  },
  {
    id: "seller-product-sample-2",
    title: "Exclusive Pride Tee",
    handle: "exclusive-pride-tee",
    status: "draft",
    updatedAt: "2024-02-26T15:30:00.000Z",
    variantCount: 3,
  },
  {
    id: "seller-product-sample-3",
    title: "Limited Edition Mug",
    handle: "limited-edition-mug",
    status: "archived",
    updatedAt: "2024-02-20T09:15:00.000Z",
    variantCount: 2,
  },
];

const sampleStats: ProductStats = {
  total: sampleProducts.length,
  statusCounts: {
    active: 1,
    draft: 1,
    archived: 1,
  },
  totalVariants: sampleProducts.reduce((sum, product) => sum + product.variantCount, 0),
  averageVariants: sampleProducts.reduce((sum, product) => sum + product.variantCount, 0) / sampleProducts.length,
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const records = await context.api.sellerProduct.findMany({
      select: {
        id: true,
        title: true,
        handle: true,
        status: true,
        updatedAt: true,
        variants: { edges: { node: { id: true } } },
      },
      first: 250,
      sort: { updatedAt: "Descending" },
    });

    const total = records.length;
    const statusCounts = {
      active: records.filter((record) => record.status === "active").length,
      draft: records.filter((record) => record.status === "draft").length,
      archived: records.filter((record) => record.status === "archived").length,
    } satisfies ProductStats["statusCounts"];
    const totalVariants = records.reduce((sum, record) => sum + (record.variants?.edges?.length ?? 0), 0);

    return {
      stats: {
        total,
        statusCounts,
        totalVariants,
        averageVariants: total ? totalVariants / total : 0,
      },
      products: records.map((record, index) => ({
        id: record.id ?? `seller-product-${index}`,
        title: record.title ?? "Untitled product",
        handle: record.handle ?? null,
        status: record.status ?? null,
        updatedAt: record.updatedAt ?? null,
        variantCount: record.variants?.edges?.length ?? 0,
      })),
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load seller products", error);
    return {
      stats: sampleStats,
      products: sampleProducts,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellerProductsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const stats = loaderData.stats ?? sampleStats;
  const products = loaderData.products ?? sampleProducts;
  const isSample = loaderData.isSample ?? false;
  const integer = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`Tracking ${integer.format(stats.total)} seller-managed products with ${integer.format(stats.totalVariants)} total variants.`}
        actions={
          <Button onClick={() => navigate("/seller/products/new")}>
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
            <CardDescription>Variants managed</CardDescription>
            <CardTitle className="text-3xl">{integer.format(stats.totalVariants)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats.total ? `${number.format(stats.averageVariants)} avg per product` : "Add products to start tracking variants"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog records</CardTitle>
          <CardDescription>Seller-specific products and linked variants.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSample && (
            <Alert>
              <AlertTitle>Sample dataset</AlertTitle>
              <AlertDescription>
                Unable to load seller products from the API. Displaying sample data instead.
                {loaderData.errorMessage ? ` Error: ${loaderData.errorMessage}` : ""}
              </AlertDescription>
            </Alert>
          )}

          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
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
                    onClick={() => navigate(`/seller/products/${product.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/seller/products/${product.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{product.title}</span>
                        <span className="text-xs text-muted-foreground">{product.handle ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "outline"} className="capitalize">
                        {product.status ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{integer.format(product.variantCount)}</TableCell>
                    <TableCell>{product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="px-2 text-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/seller/products/${product.id}`);
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
