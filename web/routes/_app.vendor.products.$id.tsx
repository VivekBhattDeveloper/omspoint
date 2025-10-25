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
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.products.$id";

const vendorProductBaseSelect = {
  id: true,
  title: true,
  status: true,
  vendor: { id: true, name: true },
  productType: true,
  category: true,
  tags: true,
  templateSuffix: true,
  body: { markdown: true, truncatedHTML: true },
  designGuidelines: { markdown: true, truncatedHTML: true },
  productionNotes: { markdown: true, truncatedHTML: true },
  publishedAt: true,
  compareAtPriceRange: true,
  orderLineItems: true,
  variantsData: true,
  printAreas: true,
  mockupConfig: true,
  mockupAssets: true,
  mockupStatus: true,
  updatedAt: true,
  options: {
    edges: {
      node: {
        id: true,
        name: true,
        position: true,
        values: true,
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
        unitCost: true,
        position: true,
        availableForSale: true,
        taxable: true,
        taxCode: true,
        inventoryPolicy: true,
        inventoryQuantity: true,
        requiresShipping: true,
        shippingProfile: true,
        optionLabels: true,
        option1: true,
        option2: true,
        option3: true,
        selectedOptions: true,
        presentmentPrices: true,
        designId: true,
        weight: true,
        weightUnit: true,
        mockupConfig: true,
        media: {
          edges: {
            node: {
              id: true,
              alt: true,
              position: true,
              file: { id: true, filename: true },
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
        alt: true,
        position: true,
        file: { id: true, filename: true },
      },
    },
  },
} as const;

const vendorProductSelectWithHandle = {
  ...vendorProductBaseSelect,
  handle: true,
} as const;

const isMissingHandleError = (error: unknown) =>
  error instanceof Error && error.message.includes("Invalid data for handle");

type LoaderResult = Route.ComponentProps["loaderData"] & {
  isSample?: boolean;
  errorMessage?: string;
};

type VendorProductRecord = Route.ComponentProps["loaderData"]["product"];

const sampleVendorProducts: Record<string, VendorProductRecord> = {
  "vendor-product-sample-1": {
    id: "vendor-product-sample-1",
    title: "Premium Canvas Print",
    handle: "premium-canvas-print",
    status: "active",
    vendor: { id: "vendor-sample-1", name: "Canvas Co" },
    productType: "Wall Art",
    category: "Canvas",
    tags: "canvas, premium, wall-art",
    templateSuffix: null,
    body: {
      markdown:
        "High-quality canvas print stretched over kiln-dried pine frame. Includes hanging hardware and protective shipping packaging.",
      truncatedHTML:
        "<p>High-quality canvas print stretched over kiln-dried pine frame. Includes hanging hardware and protective shipping packaging.</p>",
    },
    designGuidelines: {
      markdown:
        "Upload layered PSD at 300 DPI. Safe zone at 1 in. from edges. Extend background to bleed guides for wrap.",
      truncatedHTML:
        "<p>Upload layered PSD at 300 DPI. Safe zone at 1 in. from edges. Extend background to bleed guides for wrap.</p>",
    },
    productionNotes: {
      markdown: "Inspect for dust prior to packaging. Include silica gel packet for humidity control.",
      truncatedHTML: "<p>Inspect for dust prior to packaging. Include silica gel packet for humidity control.</p>",
    },
    publishedAt: "2024-02-20T10:00:00.000Z",
    compareAtPriceRange: { min: "85.00", max: "120.00" },
    orderLineItems: null,
    variantsData: null,
    printAreas: [
      {
        name: "Front",
        width: 4500,
        height: 3000,
        dpi: 300,
      },
    ],
    mockupConfig: null,
    mockupAssets: null,
    mockupStatus: "ready",
    updatedAt: "2024-03-02T09:30:00.000Z",
    options: {
      edges: [
        {
          node: {
            id: "vendor-product-sample-option-1",
            name: "Size",
            position: 1,
            values: ["12x18 in", "18x24 in", "24x36 in"],
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: "vendor-product-sample-variant-1",
            title: "12x18 in",
            sku: "CANVAS-12x18",
            barcode: "0123456789012",
            price: "95.00",
            compareAtPrice: "110.00",
            unitCost: "42.00",
            position: 1,
            availableForSale: true,
            taxable: true,
            taxCode: "ART-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 25,
            requiresShipping: true,
            shippingProfile: "STANDARD",
            optionLabels: ["12x18 in"],
            option1: "12x18 in",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "12x18 in" }],
            presentmentPrices: null,
            designId: null,
            weight: 24,
            weightUnit: "oz",
            mockupConfig: null,
            media: {
              edges: [
                {
                  node: {
                    id: "vendor-product-sample-variant-media-1",
                    alt: "12x18 canvas with gallery wrap",
                    position: 1,
                    file: { id: "file-sample-1", filename: "canvas-12x18.png" },
                  },
                },
              ],
            },
          },
        },
        {
          node: {
            id: "vendor-product-sample-variant-2",
            title: "18x24 in",
            sku: "CANVAS-18x24",
            barcode: "0123456789043",
            price: "115.00",
            compareAtPrice: "135.00",
            unitCost: "58.00",
            position: 2,
            availableForSale: true,
            taxable: true,
            taxCode: "ART-GST",
            inventoryPolicy: "continue",
            inventoryQuantity: 16,
            requiresShipping: true,
            shippingProfile: "STANDARD",
            optionLabels: ["18x24 in"],
            option1: "18x24 in",
            option2: null,
            option3: null,
            selectedOptions: [{ name: "Size", value: "18x24 in" }],
            presentmentPrices: null,
            designId: null,
            weight: 32,
            weightUnit: "oz",
            mockupConfig: null,
            media: {
              edges: [
                {
                  node: {
                    id: "vendor-product-sample-variant-media-2",
                    alt: "18x24 canvas on wall",
                    position: 1,
                    file: { id: "file-sample-2", filename: "canvas-18x24.png" },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    media: {
      edges: [
        {
          node: {
            id: "vendor-product-sample-media-1",
            alt: "Lifestyle canvas photo",
            position: 1,
            file: { id: "file-product-1", filename: "canvas-lifestyle.png" },
          },
        },
        {
          node: {
            id: "vendor-product-sample-media-2",
            alt: "Close-up of gallery wrap",
            position: 2,
            file: { id: "file-product-2", filename: "canvas-wrap-detail.png" },
          },
        },
      ],
    },
  },
};

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const sampleProduct = sampleVendorProducts[params.id];
  if (sampleProduct) {
    return {
      product: sampleProduct,
      allowHandleSelect: true,
      isSample: true,
    } satisfies LoaderResult;
  }

  const loadProduct = (select: typeof vendorProductBaseSelect | typeof vendorProductSelectWithHandle) =>
    context.api.vendorProduct.findOne(params.id, { select });

  let allowHandleSelect = true;

  try {
    let product;

    try {
      product = await loadProduct(vendorProductSelectWithHandle);
    } catch (error) {
      if (!isMissingHandleError(error)) {
        throw error;
      }
      allowHandleSelect = false;
      product = await loadProduct(vendorProductBaseSelect);
    }

    const normalizedProduct = allowHandleSelect ? product : { ...product, handle: "" };

    return {
      product: normalizedProduct,
      allowHandleSelect,
      isSample: false,
    } satisfies LoaderResult;
  } catch (error) {
    console.error("Failed to load vendor product", error);
    const fallbackProduct = sampleVendorProducts["vendor-product-sample-1"];

    return {
      product:
        fallbackProduct ??
        ({
          id: params.id,
          title: "Unavailable vendor product",
          handle: params.id,
          status: "draft",
          vendor: { id: "vendor-sample", name: "Marketplace vendor" },
          productType: null,
          category: null,
          tags: null,
          templateSuffix: null,
          body: { markdown: null, truncatedHTML: null },
          designGuidelines: { markdown: null, truncatedHTML: null },
          productionNotes: { markdown: null, truncatedHTML: null },
          publishedAt: null,
          compareAtPriceRange: null,
          orderLineItems: null,
          variantsData: null,
          printAreas: null,
          mockupConfig: null,
          mockupAssets: null,
          mockupStatus: "draft",
          updatedAt: null,
          options: { edges: [] },
          variants: { edges: [] },
          media: { edges: [] },
        } as VendorProductRecord),
      allowHandleSelect: false,
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies LoaderResult;
  }
};

export default function VendorProductDetail({ loaderData }: Route.ComponentProps) {
  const { product, allowHandleSelect, isSample, errorMessage } = loaderData as LoaderResult;
  const navigate = useNavigate();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  const optionNodes =
    product.options?.edges
      ?.map((edge) => edge?.node)
      .filter((option): option is NonNullable<typeof option> => Boolean(option)) ?? [];
  const variantNodes =
    product.variants?.edges
      ?.map((edge) => edge?.node)
      .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant)) ?? [];
  const mediaNodes =
    product.media?.edges
      ?.map((edge) => edge?.node)
      .filter((mediaItem): mediaItem is NonNullable<typeof mediaItem> => Boolean(mediaItem)) ?? [];

  if (isSample) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={product.title ?? "Vendor product"}
          description={
            <>
              <span className="inline-flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {product.status ?? "draft"}
                </Badge>
                {product.vendor?.name ? <Badge variant="outline">{product.vendor.name}</Badge> : null}
              </span>
              {product.updatedAt ? (
                <span className="block text-sm text-muted-foreground">
                  Last updated {dateFormatter.format(new Date(product.updatedAt))}
                </span>
              ) : null}
            </>
          }
          actions={
            <Button variant="outline" onClick={() => navigate("/vendor/products")}>
              Back to list
            </Button>
          }
        />

        <DataState variant="sample">
          {errorMessage ? <span className="block pt-1 text-xs text-muted-foreground">Error: {errorMessage}</span> : null}
        </DataState>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Publishing</CardDescription>
              <CardTitle className="text-lg">{product.handle ?? product.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Product type: {product.productType ?? "—"}</p>
              <p>Category: {product.category ?? "—"}</p>
              <p>
                Published:{" "}
                {product.publishedAt ? dateFormatter.format(new Date(product.publishedAt)) : "Not published"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mockups</CardDescription>
              <CardTitle className="capitalize">{product.mockupStatus ?? "unknown"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                Print areas:{" "}
                {Array.isArray(product.printAreas) ? product.printAreas.length : product.printAreas ? 1 : 0}
              </p>
              <p>Variants: {variantNodes.length}</p>
              <p>Media assets: {mediaNodes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendor</CardDescription>
              <CardTitle className="text-lg">{product.vendor?.name ?? "Marketplace vendor"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>Tags: {product.tags ?? "—"}</p>
              <p>Template suffix: {product.templateSuffix ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product content</CardTitle>
            <CardDescription>Reference copy and guidelines for this vendor product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Description</div>
              <p className="whitespace-pre-wrap">{product.body?.markdown ?? "No description provided."}</p>
            </div>
            <div>
              <div className="font-medium text-foreground">Design guidelines</div>
              <p className="whitespace-pre-wrap">
                {product.designGuidelines?.markdown ?? "No design guidance supplied."}
              </p>
            </div>
            <div>
              <div className="font-medium text-foreground">Production notes</div>
              <p className="whitespace-pre-wrap">
                {product.productionNotes?.markdown ?? "No production notes supplied."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Available option groups and values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {optionNodes.length > 0 ? (
              optionNodes.map((option) => (
                <div key={option.id}>
                  <div className="font-medium text-foreground">{option.name ?? "Option"}</div>
                  <div>Values: {Array.isArray(option.values) ? option.values.join(", ") : "—"}</div>
                </div>
              ))
            ) : (
              <p>No options in the sample dataset.</p>
            )}
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
            <CardDescription>Reference assets linked to the product.</CardDescription>
          </CardHeader>
          <CardContent>
            {mediaNodes.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {mediaNodes.map((mediaItem) => (
                  <li key={mediaItem.id} className="flex items-center justify-between gap-4">
                    <span className="font-medium">{mediaItem.file?.filename ?? "Asset"}</span>
                    <span className="text-muted-foreground capitalize">{mediaItem.alt ?? "No alt text"}</span>
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
    <div className="space-y-6">
      <PageHeader
        title={product.title ?? "Vendor product"}
        description={
          <>
            <span className="inline-flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {product.status ?? "draft"}
              </Badge>
              {product.vendor?.name ? <Badge variant="outline">{product.vendor.name}</Badge> : null}
            </span>
            {product.updatedAt ? (
              <span className="block text-sm text-muted-foreground">
                Last updated {dateFormatter.format(new Date(product.updatedAt))}
              </span>
            ) : null}
          </>
        }
        actions={
          <Button variant="outline" onClick={() => navigate("/vendor/products")}>
            Back to list
          </Button>
        }
      />

      <AutoForm
        action={api.vendorProduct.update}
        findBy={product.id}
        select={allowHandleSelect ? vendorProductSelectWithHandle : vendorProductBaseSelect}
      >
        <SubmitResultBanner />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product information</CardTitle>
              <CardDescription>Update vendor ownership, taxonomy, and publishing data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="title" />
                <AutoInput field="handle" />
                <AutoEnumInput field="status" />
                <AutoBelongsToInput field="vendor" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoInput field="productType" />
                <AutoInput field="category" />
                <AutoInput field="tags" />
                <AutoInput field="templateSuffix" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoDateTimePicker field="publishedAt" />
                <AutoEnumInput field="mockupStatus" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="compareAtPriceRange" />
                <AutoJSONInput field="orderLineItems" />
              </div>
              <AutoRichTextInput field="body" />
              <AutoRichTextInput field="designGuidelines" />
              <AutoRichTextInput field="productionNotes" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Define option names, ordering, and allowed values for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="options" label="Options">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="name" />
                    <AutoNumberInput field="position" />
                  </div>
                  <AutoJSONInput field="values" />
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Configure vendor-specific variants, inventory, and pricing.</CardDescription>
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
                    <AutoInput field="unitCost" />
                    <AutoBooleanInput field="availableForSale" />
                    <AutoBooleanInput field="taxable" />
                    <AutoInput field="taxCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="inventoryPolicy" />
                    <AutoNumberInput field="inventoryQuantity" />
                    <AutoBooleanInput field="requiresShipping" />
                    <AutoInput field="shippingProfile" />
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
              <CardDescription>Maintain shared imagery for vendor listings and production references.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="media" label="Media">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoBelongsToInput field="file" optionLabel="filename" />
                    <AutoInput field="alt" />
                  </div>
                  <AutoNumberInput field="position" />
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Print areas</CardTitle>
              <CardDescription>Define printable regions and constraints for downstream mockups.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoJSONInput field="printAreas" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mockup configuration</CardTitle>
              <CardDescription>Capture bounding boxes, asset references, and export manifests for generated mockups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoJSONInput field="mockupConfig" />
              <AutoJSONInput field="mockupAssets" />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <AutoSubmit>Save changes</AutoSubmit>
          <Button variant="ghost" type="button" onClick={() => navigate("/vendor/products")}>
            Cancel
          </Button>
        </div>
      </AutoForm>
    </div>
  );
}
