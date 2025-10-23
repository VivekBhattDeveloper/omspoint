import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "../api";
import type { Route } from "./+types/_app.seller.products.$id";

type SellerProductRecord = Route.ComponentProps["loaderData"]["product"];

type LoaderResult = Route.ComponentProps["loaderData"];

const sampleProducts: Record<string, SellerProductRecord> = {
  "seller-product-sample-1": {
    id: "seller-product-sample-1",
    title: "Marketplace Skyline Poster",
    handle: "market-skyline-poster",
    status: "active",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    vendorProductId: null,
    productType: "Poster",
    category: "Wall Art",
    tags: "skyline, city",
    templateSuffix: null,
    body: {
      markdown: "### Marketplace Skyline Poster\n\nA hero print celebrating the shops skyline. Includes matte finish preview and ready-to-ship packaging notes.",
      truncatedHTML:
        "<h3>Marketplace Skyline Poster</h3><p>A hero print celebrating the shops skyline. Includes matte finish preview and ready-to-ship packaging notes.</p>",
    },
    publishedAt: "2024-03-02T11:00:00.000Z",
    updatedAt: "2024-03-02T13:45:00.000Z",
    variants: {
      edges: [
        {
          node: {
            id: "seller-product-sample-variant-1",
            title: "12x18 in",
            sku: "SKYLINE-12x18",
            barcode: "012345678905",
            price: "24.00",
            compareAtPrice: "28.00",
            position: 1,
            availableForSale: true,
            taxable: true,
            taxCode: "ART-GST",
            inventoryPolicy: "deny",
            inventoryQuantity: 12,
            option1: "12x18 in",
            option2: null,
            option3: null,
            selectedOptions: [
              { name: "Size", value: "12x18 in" },
            ],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-1", sku: "SKYLINE-12x18" },
            media: { edges: [] },
          },
        },
        {
          node: {
            id: "seller-product-sample-variant-2",
            title: "18x24 in",
            sku: "SKYLINE-18x24",
            barcode: "012345678912",
            price: "32.00",
            compareAtPrice: null,
            position: 2,
            availableForSale: true,
            taxable: true,
            taxCode: "ART-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 6,
            option1: "18x24 in",
            option2: null,
            option3: null,
            selectedOptions: [
              { name: "Size", value: "18x24 in" },
            ],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-2", sku: "SKYLINE-18x24" },
            media: { edges: [] },
          },
        },
      ],
    },
    media: {
      edges: [
        {
          node: {
            id: "seller-product-sample-media-1",
            position: 1,
            file: { id: "sample-file-1", filename: "skyline-poster-front.png" },
          },
        },
        {
          node: {
            id: "seller-product-sample-media-2",
            position: 2,
            file: { id: "sample-file-2", filename: "skyline-poster-packaging.png" },
          },
        },
      ],
    },
  },
  "seller-product-sample-2": {
    id: "seller-product-sample-2",
    title: "Exclusive Pride Tee",
    handle: "exclusive-pride-tee",
    status: "draft",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    vendorProductId: "vendor-product-sample-2",
    productType: "Apparel",
    category: "T-Shirts",
    tags: "pride, limited",
    templateSuffix: null,
    body: {
      markdown: "Celebrate all identities with this limited-run tee. Soft cotton blend with tear-away label.",
      truncatedHTML:
        "<p>Celebrate all identities with this limited-run tee. Soft cotton blend with tear-away label.</p>",
    },
    publishedAt: null,
    updatedAt: "2024-02-26T15:30:00.000Z",
    variants: {
      edges: [
        {
          node: {
            id: "seller-product-sample-variant-3",
            title: "Small",
            sku: "PRIDE-TEE-S",
            barcode: null,
            price: "19.50",
            compareAtPrice: null,
            position: 1,
            availableForSale: true,
            taxable: true,
            taxCode: "APP-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 15,
            option1: "Small",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "Small" }],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-3", sku: "PRIDE-TEE-S" },
            media: { edges: [] },
          },
        },
        {
          node: {
            id: "seller-product-sample-variant-4",
            title: "Medium",
            sku: "PRIDE-TEE-M",
            barcode: null,
            price: "19.50",
            compareAtPrice: null,
            position: 2,
            availableForSale: true,
            taxable: true,
            taxCode: "APP-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 10,
            option1: "Medium",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "Medium" }],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-4", sku: "PRIDE-TEE-M" },
            media: { edges: [] },
          },
        },
        {
          node: {
            id: "seller-product-sample-variant-5",
            title: "Large",
            sku: "PRIDE-TEE-L",
            barcode: null,
            price: "19.50",
            compareAtPrice: null,
            position: 3,
            availableForSale: true,
            taxable: true,
            taxCode: "APP-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 8,
            option1: "Large",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "Large" }],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-5", sku: "PRIDE-TEE-L" },
            media: { edges: [] },
          },
        },
      ],
    },
    media: {
      edges: [
        {
          node: {
            id: "seller-product-sample-media-3",
            position: 1,
            file: { id: "sample-file-3", filename: "pride-tee-front.png" },
          },
        },
      ],
    },
  },
  "seller-product-sample-3": {
    id: "seller-product-sample-3",
    title: "Limited Edition Mug",
    handle: "limited-edition-mug",
    status: "archived",
    seller: { id: "sample-seller", name: "Marketplace Demo Seller" },
    vendorProductId: null,
    productType: "Drinkware",
    category: "Mugs",
    tags: "limited, ceramic",
    templateSuffix: null,
    body: {
      markdown: "Microwave-safe ceramic mug with metallic gold accent. Was retired after Winter 2023 collection.",
      truncatedHTML:
        "<p>Microwave-safe ceramic mug with metallic gold accent. Was retired after Winter 2023 collection.</p>",
    },
    publishedAt: "2023-11-18T09:15:00.000Z",
    updatedAt: "2024-02-20T09:15:00.000Z",
    variants: {
      edges: [
        {
          node: {
            id: "seller-product-sample-variant-6",
            title: "Standard",
            sku: "MUG-LIMITED",
            barcode: "012345678929",
            price: "18.00",
            compareAtPrice: "22.00",
            position: 1,
            availableForSale: false,
            taxable: true,
            taxCode: "HOME-GST",
            inventoryPolicy: "deny",
            inventoryQuantity: 0,
            option1: "Standard",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "Standard" }],
            presentmentPrices: null,
            inventoryItem: { id: "inventory-sample-6", sku: "MUG-LIMITED" },
            media: { edges: [] },
          },
        },
      ],
    },
    media: {
      edges: [
        {
          node: {
            id: "seller-product-sample-media-4",
            position: 1,
            file: { id: "sample-file-4", filename: "limited-mug-front.png" },
          },
        },
      ],
    },
  },
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const sampleProduct = sampleProducts[params.id];
  if (sampleProduct) {
    return {
      product: sampleProduct,
      isSample: true,
    } satisfies LoaderResult;
  }

  try {
    const product = await context.api.sellerProduct.findOne(params.id, {
      select: {
        id: true,
        title: true,
        handle: true,
        status: true,
        seller: { id: true, name: true },
        vendorProductId: true,
        productType: true,
        category: true,
        tags: true,
        templateSuffix: true,
        body: { markdown: true, truncatedHTML: true },
        publishedAt: true,
        updatedAt: true,
        variants: {
          edges: {
            node: {
              id: true,
              title: true,
              sku: true,
              barcode: true,
              price: true,
              compareAtPrice: true,
              position: true,
              availableForSale: true,
              taxable: true,
              taxCode: true,
              inventoryPolicy: true,
              inventoryQuantity: true,
              option1: true,
              option2: true,
              option3: true,
              selectedOptions: true,
              presentmentPrices: true,
              inventoryItem: { id: true, sku: true },
              media: {
                edges: {
                  node: {
                    id: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
        media: {
          edges: {
            node: {
              id: true,
              position: true,
              file: { id: true, filename: true },
            },
          },
        },
      },
    });

    return {
      product,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load seller product", error);
    const fallbackProduct = sampleProducts["seller-product-sample-1"];

    return {
      product:
        fallbackProduct ?? {
          id: params.id,
          title: "Unavailable product",
          status: "draft",
          handle: params.id,
          seller: null,
          vendorProductId: null,
          productType: null,
          category: null,
          tags: null,
          templateSuffix: null,
          body: { markdown: null, truncatedHTML: null },
          publishedAt: null,
          updatedAt: null,
          variants: { edges: [] },
          media: { edges: [] },
        },
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function SellerProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, isSample, errorMessage } = loaderData;
  const navigate = useNavigate();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );
  const productVariants = (product.variants?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));
  const productMedia = (product.media?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((mediaItem): mediaItem is NonNullable<typeof mediaItem> => Boolean(mediaItem));

  if (isSample) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={product.title ?? "Seller product"}
          description={
            <>
              <span className="inline-flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {product.status ?? "draft"}
                </Badge>
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

        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load this seller product from the API. Displaying curated sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Product snapshot</CardTitle>
            <CardDescription>Read-only view of the reference product while the API is unavailable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Handle</div>
                <div className="font-medium">{product.handle ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Seller</div>
                <div className="font-medium">{product.seller?.name ?? "Marketplace demo"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product type</div>
                <div className="font-medium">{product.productType ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div className="font-medium">{product.category ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tags</div>
                <div className="font-medium">{product.tags ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Vendor product</div>
                <div className="font-medium">{product.vendorProductId ?? "Unlinked"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Published</div>
                <div className="font-medium">
                  {product.publishedAt ? dateFormatter.format(new Date(product.publishedAt)) : "Not published"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {product.body?.markdown ?? "No description available."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>Snapshot of variant pricing and inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            {productVariants.length > 0 ? (
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
                  {productVariants.map((variant) => (
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
            <CardDescription>Reference files associated with this product.</CardDescription>
          </CardHeader>
          <CardContent>
            {productMedia.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {productMedia.map((mediaItem) => (
                  <li key={mediaItem.id} className="flex items-center justify-between gap-4">
                    <span className="font-medium">{mediaItem.file?.filename ?? "Asset"}</span>
                    <span className="text-muted-foreground">Position {mediaItem.position ?? "—"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No media captured in the sample dataset.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.title ?? "Seller product"}
        description={
          <>
            <span className="inline-flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {product.status ?? "draft"}
              </Badge>
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

      <AutoForm
        action={api.sellerProduct.update}
        findBy={product.id}
        select={{
          title: true,
          handle: true,
          status: true,
          seller: { id: true },
          productType: true,
          category: true,
          tags: true,
          templateSuffix: true,
          vendorProductId: true,
          publishedAt: true,
          body: { markdown: true },
          media: {
            edges: {
              node: {
                id: true,
                position: true,
                file: { id: true, filename: true },
              },
            },
          },
          variants: {
            edges: {
              node: {
                id: true,
                title: true,
                sku: true,
                barcode: true,
                price: true,
                compareAtPrice: true,
                position: true,
                availableForSale: true,
                taxable: true,
                taxCode: true,
                inventoryPolicy: true,
                inventoryQuantity: true,
                option1: true,
                option2: true,
                option3: true,
                selectedOptions: true,
                presentmentPrices: true,
                inventoryItem: { id: true, sku: true },
                media: {
                  edges: {
                    node: {
                      id: true,
                      position: true,
                    },
                  },
                },
              },
            },
          },
        }}
      >
        <SubmitResultBanner />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product information</CardTitle>
              <CardDescription>Update the core identifiers, taxonomy, and associations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
                <AutoEnumInput field="status" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoBelongsToInput field="seller" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productType" />
                <AutoInput field="category" />
                <AutoInput field="tags" />
                <AutoInput field="templateSuffix" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="vendorProductId" />
                <AutoDateTimePicker field="publishedAt" />
              </div>
              <AutoRichTextInput field="body" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Manage SKU-level pricing, inventory, and options.</CardDescription>
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
                    <AutoBooleanInput field="availableForSale" />
                    <AutoBooleanInput field="taxable" />
                    <AutoInput field="taxCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="inventoryPolicy" />
                    <AutoNumberInput field="inventoryQuantity" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <AutoInput field="option1" />
                    <AutoInput field="option2" />
                    <AutoInput field="option3" />
                  </div>
                  <AutoBelongsToInput field="inventoryItem" optionLabel="sku" />
                  <AutoJSONInput field="selectedOptions" />
                  <AutoJSONInput field="presentmentPrices" />

                  <AutoHasManyForm field="media" label="Variant media">
                    <div className="grid gap-4 md:grid-cols-1">
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
              <CardDescription>Attach shared imagery or assets across variants.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="media" label="Media">
                <div className="grid gap-4 md:grid-cols-2">
                  <AutoBelongsToInput field="file" optionLabel="filename" />
                  <AutoNumberInput field="position" />
                </div>
              </AutoHasManyForm>
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
  );
}
