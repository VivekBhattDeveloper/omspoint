import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Route } from "./+types/_app.seller.products._index";

interface ProductStats {
  total: number;
  statusCounts: Record<"active" | "draft" | "archived", number>;
  totalVariants: number;
  averageVariants: number;
  uniqueChannels: number;
  topChannel: string | null;
}

interface LoaderProduct {
  id: string;
  title: string;
  handle: string | null;
  channel: string | null;
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

const channelLabelMap: Record<string, string> = {
  manual: "Manual",
  shopify: "Shopify",
  amazon: "Amazon",
  etsy: "Etsy",
  ebay: "eBay",
  woocommerce: "WooCommerce",
  magento: "Magento",
  flipkart: "Flipkart",
  ajio: "Ajio",
  custom: "Custom",
};

const formatChannelLabel = (channel: string | null) => {
  if (!channel) return "Unassigned";
  return channelLabelMap[channel] ?? channel;
};

const channelBadgeVariant = (channel: string | null): BadgeProps["variant"] => {
  switch (channel) {
    case "shopify":
    case "manual":
      return "default";
    case "amazon":
    case "woocommerce":
    case "flipkart":
      return "secondary";
    case "etsy":
    case "custom":
      return "outline";
    case "magento":
    case "ajio":
      return "destructive";
    default:
      return "outline";
  }
};

const statusBadgeVariant = (status: string | null): BadgeProps["variant"] => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "archived":
    default:
      return "outline";
  }
};

const sampleProducts: LoaderProduct[] = [
  {
    id: "seller-product-sample-1",
    title: "Marketplace Skyline Poster",
    handle: "market-skyline-poster",
    channel: "shopify",
    status: "active",
    updatedAt: "2024-03-02T11:00:00.000Z",
    variantCount: 4,
  },
  {
    id: "seller-product-sample-2",
    title: "Exclusive Pride Tee",
    handle: "exclusive-pride-tee",
    channel: "amazon",
    status: "draft",
    updatedAt: "2024-02-26T15:30:00.000Z",
    variantCount: 3,
  },
  {
    id: "seller-product-sample-3",
    title: "Limited Edition Mug",
    handle: "limited-edition-mug",
    channel: "manual",
    status: "archived",
    updatedAt: "2024-02-20T09:15:00.000Z",
    variantCount: 2,
  },
];

const computeStats = (products: LoaderProduct[]): ProductStats => {
  const total = products.length;
  const statusCounts = products.reduce<ProductStats["statusCounts"]>(
    (counts, product) => {
      const key = (product.status ?? "archived") as keyof ProductStats["statusCounts"];
      if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    { active: 0, draft: 0, archived: 0 }
  );

  const totalVariants = products.reduce((sum, product) => sum + product.variantCount, 0);
  const channelCounts = products.reduce<Record<string, number>>((counts, product) => {
    const key = product.channel ?? "unassigned";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  const channelEntries = Object.entries(channelCounts).sort(([, a], [, b]) => b - a);
  const uniqueChannels = channelEntries.filter(([channel]) => channel !== "unassigned").length;
  const topChannelKey = channelEntries[0]?.[0];

  return {
    total,
    statusCounts,
    totalVariants,
    averageVariants: total ? totalVariants / total : 0,
    uniqueChannels,
    topChannel: topChannelKey && topChannelKey !== "unassigned" ? formatChannelLabel(topChannelKey) : null,
  };
};

const sellerProductBaseSelect = {
  id: true,
  title: true,
  channel: true,
  status: true,
  updatedAt: true,
  variants: { edges: { node: { id: true } } },
} as const;

const sellerProductSelectWithHandle = {
  ...sellerProductBaseSelect,
  handle: true,
} as const;

const isMissingHandleError = (error: unknown) =>
  error instanceof Error && error.message.includes("Invalid data for handle");

const buildLoaderResult = (
  records: Array<{
    id?: string | null;
    title?: string | null;
    handle?: string | null;
    channel?: string | null;
    status?: string | null;
    updatedAt?: string | null;
    variants?: { edges?: Array<{ node?: { id?: string | null } | null } | null> | null } | null;
  }>,
  allowHandleSelect: boolean,
  errorMessage?: string,
): LoaderResult => {
  const products: LoaderProduct[] = records.map((record, index) => ({
    id: record.id ?? `seller-product-${index}`,
    title: record.title ?? "Untitled product",
    handle: allowHandleSelect ? record.handle ?? null : null,
    channel: record.channel ?? null,
    status: record.status ?? null,
    updatedAt: record.updatedAt ?? null,
    variantCount: record.variants?.edges?.length ?? 0,
  }));

  return {
    stats: computeStats(products),
    products,
    isSample: false,
    errorMessage,
  };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const fetchRecords = (
    select: typeof sellerProductSelectWithHandle | typeof sellerProductBaseSelect,
  ) =>
    context.api.sellerProduct.findMany({
      select,
      first: 250,
      sort: { updatedAt: "Descending" },
    });

  try {
    const records = await fetchRecords(sellerProductSelectWithHandle);
    return buildLoaderResult(records, true);
  } catch (error) {
    if (isMissingHandleError(error)) {
      const handleErrorMessage =
        error instanceof Error ? error.message : "Failed to load seller product handles";
      console.warn("Seller products missing handle data; retrying without handle field", error);

      try {
        const records = await fetchRecords(sellerProductBaseSelect);
        return buildLoaderResult(records, false, handleErrorMessage);
      } catch (fallbackError) {
        console.error("Failed to load seller products after handle fallback", fallbackError);
        const fallbackMessage =
          fallbackError instanceof Error
            ? `${handleErrorMessage} (fallback failed: ${fallbackError.message})`
            : handleErrorMessage;

        return {
          stats: computeStats(sampleProducts),
          products: sampleProducts,
          isSample: true,
          errorMessage: fallbackMessage,
        } satisfies LoaderResult;
      }
    }

    console.error("Failed to load seller products", error);
    return {
      stats: computeStats(sampleProducts),
      products: sampleProducts,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellerProductsIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const stats = loaderData.stats ?? computeStats(sampleProducts);
  const products = loaderData.products ?? sampleProducts;
  const integer = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const number = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const showAlert = loaderData.isSample || Boolean(loaderData.errorMessage);
  const alertTitle = loaderData.isSample ? "Sample dataset" : "Handles unavailable";
  const alertDescription = loaderData.isSample
    ? `Unable to load seller products from the API. Displaying sample data instead.${loaderData.errorMessage ? ` Error: ${loaderData.errorMessage}` : ""}`
    : `Some seller products contain invalid handle data. Records are shown without handles until the data is corrected.${loaderData.errorMessage ? ` Error: ${loaderData.errorMessage}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={
          stats.total
            ? `Tracking ${integer.format(stats.total)} seller-managed products across ${integer.format(stats.uniqueChannels)} channel${stats.uniqueChannels === 1 ? "" : "s"} with ${integer.format(stats.totalVariants)} variants in total.`
            : "No seller products yet. Create one to start tracking channel readiness."
        }
        actions={
          <Button onClick={() => navigate("/seller/products/new")} data-testid="seller-products-new">
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
            {stats.total ? `${number.format(stats.averageVariants)} avg per product` : "Add products to start tracking variants."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Channels</CardDescription>
            <CardTitle className="text-3xl">{integer.format(stats.uniqueChannels)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {stats.topChannel ? `Top channel: ${stats.topChannel}` : "Connect a channel to start tracking coverage."}
          </CardContent>
        </Card>
      </div>

      {showAlert && (
        <Alert>
          <AlertTitle>{alertTitle}</AlertTitle>
          <AlertDescription>{alertDescription}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalog records</CardTitle>
          <CardDescription>Seller-specific products and linked variants across channels.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
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
                      <div className="flex flex-col gap-1">
                        <span>{product.title}</span>
                        <span className="text-xs text-muted-foreground">{product.handle ?? (loaderData.isSample ? product.id : "—")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={channelBadgeVariant(product.channel)}>
                        {formatChannelLabel(product.channel)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(product.status)} className="capitalize">
                        {product.status ?? "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{integer.format(product.variantCount)}</TableCell>
                    <TableCell>{product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "—"}</TableCell>
                    <TableCell className="text-right">
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
            <div className="py-8 text-center text-muted-foreground">No seller products found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
