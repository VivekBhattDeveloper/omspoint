import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AutoBelongsToInput,
  AutoBooleanInput,
  AutoDateTimePicker,
  AutoEnumInput,
  AutoForm,
  AutoHasManyForm,
  AutoInput,
  AutoJSONInput,
  AutoNumberInput,
  AutoRichTextInput,
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { DataState } from "@/components/app/data-state";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sellerProductFormSelect } from "@/lib/sellerProductSelect";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.products.$id";
import { Provider as GadgetProvider } from "@gadgetinc/react";

const sampleProduct = {
  id: "seller-product-sample",
  title: "Sample Product",
  handle: "sample-product",
  status: "draft",
  channel: "manual",
  channelStatus: "draft",
  channelProductId: null,
  channelHandle: null,
  channelSettings: null,
  channelPublishingErrors: null,
  seller: { id: "sample-seller", name: "Demo Seller" },
  shop: null,
  order: null,
  vendorCode: null,
  vendorProductId: null,
  productType: "Poster",
  productCategory: "Wall Art",
  category: "Home & Living",
  tags: "demo, sample",
  templateSuffix: null,
  hasVariantsThatRequiresComponents: false,
  trackInventory: true,
  continueSellingWhenOutOfStock: false,
  body: { markdown: "## Sample product\n\nPopulate fields once API access is restored.", truncatedHTML: "<h2>Sample product</h2><p>Populate fields once API access is restored.</p>" },
  publishedAt: null,
  updatedAt: null,
  compareAtPriceRange: null,
  generatedImages: null,
  designAssignments: null,
  designId: null,
  mockupConfig: null,
  mockupAssets: null,
  optionsData: null,
  variantsData: null,
  mediaData: null,
  customCollections: null,
  seoTitle: "Sample product",
  seoDescription: "Demo record while the API is unavailable.",
  options: { edges: [] },
  variants: { edges: [] },
  media: { edges: [] },
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  try {
    const product = await context.api.sellerProduct.findOne(params.id, { select: sellerProductFormSelect });
    return { product, isSample: false } as Route.ComponentProps["loaderData"];
  } catch (error) {
    console.error("Failed to load seller product", error);
    return {
      product: sampleProduct,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } as Route.ComponentProps["loaderData"];
  }
};

const statusBadgeVariant = (status: string | null | undefined) => {
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

const channelBadgeVariant = (channel: string | null | undefined) => {
  switch (channel) {
    case "shopify":
    case "manual":
      return "default";
    case "amazon":
    case "woocommerce":
      return "secondary";
    case "etsy":
    case "custom":
      return "outline";
    case "magento":
      return "destructive";
    default:
      return "outline";
  }
};

export default function SellerProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, isSample, errorMessage } = loaderData as Route.ComponentProps["loaderData"] & {
    isSample?: boolean;
    errorMessage?: string;
  };
  const navigate = useNavigate();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );
  const variantNodes =
    (product as any).variants?.edges
      ?.map((edge: any) => edge?.node)
      .filter((variant: any): variant is NonNullable<typeof variant> => Boolean(variant)) ?? [];
  const mediaNodes =
    (product as any).media?.edges
      ?.map((edge: any) => edge?.node)
      .filter((mediaItem: any): mediaItem is NonNullable<typeof mediaItem> => Boolean(mediaItem)) ?? [];

  const header = (
    <PageHeader
      title={(product as any).title ?? "Seller product"}
      description={
        <>
          <span className="inline-flex items-center gap-2">
            <Badge variant={statusBadgeVariant((product as any).status)} className="capitalize">
              {(product as any).status ?? "draft"}
            </Badge>
            <Badge variant={channelBadgeVariant((product as any).channel)}>{(product as any).channel ?? "Unassigned"}</Badge>
          </span>
          {product.updatedAt ? (
            <span className="block text-sm text-muted-foreground">
              Last updated {dateFormatter.format(new Date(product.updatedAt))}
            </span>
          ) : null}
        </>
      }
      actions={
        <Button variant="outline" onClick={() => navigate("/seller/products")}>
          Back to list
        </Button>
      }
    />
  );

  if (isSample) {
    return (
      <div className="space-y-6">
        {header}
        <DataState variant="sample">
          {errorMessage ? <span className="block pt-1 text-xs text-muted-foreground">Error: {errorMessage}</span> : null}
        </DataState>

        <Card>
          <CardHeader>
            <CardTitle>Product snapshot</CardTitle>
            <CardDescription>Read-only summary while the live record is unavailable.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <div className="text-muted-foreground">Handle</div>
              <div className="font-medium text-foreground">{(product as any).handle ?? (product as any).id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Seller</div>
              <div className="font-medium text-foreground">{(product as any).seller?.name ?? "Marketplace seller"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Channel status</div>
              <div className="font-medium text-foreground">{(product as any).channelStatus ?? "draft"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Vendor product</div>
              <div className="font-medium text-foreground">{product.vendorProductId ?? "Unlinked"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Product type</div>
              <div className="font-medium text-foreground">{product.productType ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Category</div>
              <div className="font-medium text-foreground">{product.category ?? "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Marketing copy captured for this product.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{product.body?.markdown ?? "No description available."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>Pricing and availability snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            {variantNodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantNodes.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>{variant.title ?? "Variant"}</TableCell>
                      <TableCell>{variant.sku ?? "—"}</TableCell>
                      <TableCell>{variant.price ?? "—"}</TableCell>
                      <TableCell>{variant.inventoryQuantity ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No variants in the sample dataset.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Assets linked to this product.</CardDescription>
          </CardHeader>
          <CardContent>
            {mediaNodes.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {mediaNodes.map((mediaItem) => (
                  <li key={mediaItem.id} className="flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{mediaItem.file?.filename ?? "Asset"}</span>
                    <span className="text-muted-foreground">Position {mediaItem.position ?? "—"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No media in the sample dataset.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      {header}
      <AutoForm action={api.sellerProduct.update} findBy={(product as any).id} select={sellerProductFormSelect}>
        <SubmitResultBanner />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
              <CardDescription>Core identifiers, publication settings, and vendor linkage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
                <AutoEnumInput field="status" />
                <AutoEnumInput field="channel" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoEnumInput field="channelStatus" />
                <AutoInput field="channelProductId" />
                <AutoInput field="channelHandle" />
                <AutoInput field="vendorCode" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="vendorProductId" />
                <AutoBelongsToInput field="seller" />
                <AutoBelongsToInput field="shop" />
                <AutoBelongsToInput field="order" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productType" />
                <AutoInput field="productCategory" />
                <AutoInput field="category" />
                <AutoInput field="templateSuffix" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoBooleanInput field="hasVariantsThatRequiresComponents" />
                <AutoBooleanInput field="trackInventory" />
                <AutoBooleanInput field="continueSellingWhenOutOfStock" />
                <AutoDateTimePicker field="publishedAt" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="compareAtPriceRange" />
                <AutoJSONInput field="generatedImages" />
              </div>
              <AutoRichTextInput field="body" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel configuration</CardTitle>
              <CardDescription>Per-channel metadata, sync preferences, and publishing diagnostics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoJSONInput field="channelSettings" />
              <AutoJSONInput field="channelPublishingErrors" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options & attributes</CardTitle>
              <CardDescription>Manage product options and supporting structured data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoHasManyForm field="options" label="Options">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="name" />
                    <AutoNumberInput field="position" />
                  </div>
                  <AutoJSONInput field="values" />
                </div>
              </AutoHasManyForm>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="optionsData" />
                <AutoJSONInput field="variantsData" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Update SKU-level pricing, inventory, channel overrides, and media.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="variants" label="Variants">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="title" />
                    <AutoInput field="sku" />
                    <AutoInput field="barcode" />
                    <AutoNumberInput field="position" />
                    <AutoInput field="price" />
                    <AutoInput field="compareAtPrice" />
                    <AutoInput field="cost" />
                    <AutoInput field="unitCost" />
                    <AutoBooleanInput field="availableForSale" />
                    <AutoBooleanInput field="taxable" />
                    <AutoInput field="taxCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="inventoryPolicy" />
                    <AutoNumberInput field="inventoryQuantity" />
                    <AutoBooleanInput field="requiresShipping" />
                    <AutoInput field="hsCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <AutoInput field="option1" />
                    <AutoInput field="option2" />
                    <AutoInput field="option3" />
                  </div>
                  <AutoJSONInput field="optionLabels" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoNumberInput field="weight" />
                    <AutoInput field="weightUnit" />
                  </div>
                  <AutoBelongsToInput field="inventoryItem" optionLabel="sku" />
                  <AutoInput field="designId" />
                  <AutoJSONInput field="selectedOptions" />
                  <AutoJSONInput field="presentmentPrices" />
                  <AutoJSONInput field="mockupConfig" />
                  <AutoHasManyForm field="media" label="Variant media">
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <AutoBelongsToInput field="file" optionLabel="filename" />
                        <AutoInput field="alt" />
                      </div>
                      <AutoNumberInput field="position" />
                    </div>
                  </AutoHasManyForm>
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product media</CardTitle>
              <CardDescription>Assets used across all variants and channels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoHasManyForm field="media" label="Media">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoBelongsToInput field="file" optionLabel="filename" />
                    <AutoInput field="alt" />
                  </div>
                  <AutoNumberInput field="position" />
                </div>
              </AutoHasManyForm>
              <AutoJSONInput field="mediaData" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design & assignments</CardTitle>
              <CardDescription>Track design ownership, placements, and variant assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoInput field="designId" />
              <AutoJSONInput field="designAssignments" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mockups</CardTitle>
              <CardDescription>Maintain configuration and generated assets for storefront mockups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoJSONInput field="mockupConfig" />
              <AutoJSONInput field="mockupAssets" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & organization</CardTitle>
              <CardDescription>Metadata surfaced on sales channels and storefronts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="seoTitle" />
                <AutoRichTextInput field="seoDescription" />
              </div>
              <AutoInput field="tags" />
              <AutoJSONInput field="customCollections" />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <AutoSubmit>Save changes</AutoSubmit>
          <Button variant="ghost" type="button" onClick={() => navigate("/seller/products")}>
            Cancel
          </Button>
        </div>
      </AutoForm>
    </div>
    </GadgetProvider>
  );
}
