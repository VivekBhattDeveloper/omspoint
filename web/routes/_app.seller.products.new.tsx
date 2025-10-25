import { useMemo, useState } from "react";
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
  AutoSubmit,
  SubmitResultBanner,
} from "@/components/auto";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sellerProductFormSelect } from "@/lib/sellerProductSelect";
import type { Route } from "./+types/_app.seller.products.new";
import { api } from "../api";
import { Provider as GadgetProvider } from "@gadgetinc/react";

type VendorProductForImport = Route.LoaderData["vendorProducts"][number];

const SELLER_PRODUCT_CREATE_FIELDS_QUERY = `
  query SellerProductCreateFields($modelApiIdentifier: String!, $action: String!) {
    gadgetMeta {
      model(apiIdentifier: $modelApiIdentifier) {
        action(apiIdentifier: $action) {
          inputFields {
            apiIdentifier
            configuration {
              __typename
              ... on GadgetObjectFieldConfig {
                fields {
                  apiIdentifier
                }
              }
            }
          }
        }
      }
    }
  }
`;

const mapVendorProductToDefaults = (vendorProduct: VendorProductForImport) => {
  const optionEdges = vendorProduct.options?.edges ?? [];
  const variantEdges = vendorProduct.variants?.edges ?? [];

  const options = optionEdges
    .map((edge, index) => edge?.node && {
      name: edge.node.name ?? `Option ${index + 1}`,
      position: edge.node.position ?? index + 1,
      values: edge.node.values ?? [],
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  const variants = variantEdges
    .map((edge, index) => edge?.node && {
      title: edge.node.title ?? `Variant ${index + 1}`,
      sku: edge.node.sku ?? "",
      barcode: edge.node.barcode ?? "",
      price: edge.node.price ?? "",
      compareAtPrice: edge.node.compareAtPrice ?? "",
      option1: edge.node.option1 ?? options[0]?.values?.[0] ?? edge.node.title ?? "",
      option2: edge.node.option2 ?? null,
      option3: edge.node.option3 ?? null,
      position: edge.node.position ?? index + 1,
      availableForSale: true,
      taxable: true,
      inventoryQuantity: 0,
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  return {
    title: vendorProduct.title ?? "",
    handle: vendorProduct.handle ?? "",
    productType: vendorProduct.productType ?? "",
    category: vendorProduct.category ?? "",
    tags: vendorProduct.tags ?? "",
    vendorProductId: vendorProduct.id ?? "",
    body: vendorProduct.body?.markdown ?? "",
    options,
    variants,
  };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  let availableFields: string[] = [];

  try {
    const metadataResult = await context.api.connection.currentClient
      .query(SELLER_PRODUCT_CREATE_FIELDS_QUERY, {
        modelApiIdentifier: "sellerProduct",
        action: "create",
      })
      .toPromise();

    const inputFields = metadataResult.data?.gadgetMeta?.model?.action?.inputFields ?? [];
    const sellerProductField = inputFields.find((field: { apiIdentifier?: string }) => field.apiIdentifier === "sellerProduct");
    const objectFields = ((sellerProductField as any)?.configuration?.fields ?? []) as Array<{ apiIdentifier?: string }>;
    availableFields = objectFields.map((field) => field.apiIdentifier).filter((field): field is string => Boolean(field));
  } catch (metadataError) {
    console.warn("Failed to load seller product create field metadata", metadataError);
  }

  try {
    const vendorProducts = await context.api.vendorProduct.findMany({
      first: 50,
      sort: { updatedAt: "Descending" },
      select: {
        id: true,
        title: true,
        handle: true,
        productType: true,
        category: true,
        tags: true,
        body: { markdown: true },
        vendor: { id: true, name: true },
        options: { edges: { node: { id: true, name: true, position: true, values: true } } },
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
              option1: true,
              option2: true,
              option3: true,
            },
          },
        },
      },
    });

    return { vendorProducts, availableFields } satisfies Route.LoaderData;
  } catch (error) {
    console.error("Failed to load vendor products for import", error);
    return { vendorProducts: [], availableFields } satisfies Route.LoaderData;
  }
};

export default function SellerProductCreate({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({
    status: "draft",
    channel: "manual",
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
  });
  const [formSeed, setFormSeed] = useState(0);

  const handleVendorImport = (vendorProduct: VendorProductForImport) => {
    const mappedValues = mapVendorProductToDefaults(vendorProduct);
    setDefaultValues((previous) => ({
      ...previous,
      ...mappedValues,
    }));
    setFormSeed((seed) => seed + 1);
  };

  const vendorProducts = useMemo(
    () => loaderData.vendorProducts ?? [],
    [loaderData.vendorProducts],
  );
  const availableFieldSet = useMemo(() => new Set(loaderData.availableFields ?? []), [loaderData.availableFields]);
  const disabledRichTextFields = useMemo(() => ["body", "seoDescription"], []);
  const filteredSelect = useMemo(() => {
    if (!availableFieldSet.size) {
      return sellerProductFormSelect;
    }
    const disabledRichTextSet = new Set(disabledRichTextFields);
    const entries = Object.entries(sellerProductFormSelect).filter(([key]) => {
      if (key === "id") {
        return true;
      }
      if (disabledRichTextSet.has(key)) {
        return false;
      }
      return availableFieldSet.has(key);
    });
    return Object.fromEntries(entries) as typeof sellerProductFormSelect;
  }, [availableFieldSet, disabledRichTextFields]);

  return (
    <GadgetProvider api={api}>
      <div className="space-y-6">
      <PageHeader
        title="New seller product"
        description="Create a seller-managed product, optionally importing data from a vendor record."
        actions={
          <Button variant="outline" onClick={() => navigate("/seller/products")}>
            Cancel
          </Button>
        }
      />

      <VendorImportDialog vendorProducts={vendorProducts} onSelect={handleVendorImport} />

      <AutoForm
        key={formSeed}
        action={api.sellerProduct.create}
        defaultValues={defaultValues}
        select={filteredSelect}
        onSuccess={() => navigate("/seller/products")}
      >
        <SubmitResultBanner />
        <SellerProductCreateForm
          availableFieldSet={availableFieldSet}
          disabledRichTextFields={disabledRichTextFields}
          onCancel={() => navigate("/seller/products")}
        />
      </AutoForm>
    </div>
    </GadgetProvider>
  );
}

const SellerProductCreateForm = ({
  availableFieldSet,
  disabledRichTextFields,
  onCancel,
}: {
  availableFieldSet: Set<string>;
  disabledRichTextFields: string[];
  onCancel: () => void;
}) => {
  const disabledRichTextSet = useMemo(() => new Set(disabledRichTextFields), [disabledRichTextFields]);
  const hasField = (field: string) => availableFieldSet.has(field) && !disabledRichTextSet.has(field);
  const disabledRichText = disabledRichTextFields.filter((field) => availableFieldSet.has(field));

  const missingTopLevelFields = useMemo(() => {
    const expected = [
      "channel",
      "channelStatus",
      "channelProductId",
      "channelHandle",
      "vendorCode",
      "productCategory",
      "trackInventory",
      "continueSellingWhenOutOfStock",
      "hasVariantsThatRequiresComponents",
      "channelSettings",
      "channelPublishingErrors",
      "options",
      "optionsData",
      "variantsData",
      "variants",
      "mediaData",
      "media",
      "designId",
      "designAssignments",
      "mockupConfig",
      "mockupAssets",
      "seoTitle",
      "seoDescription",
      "tags",
      "customCollections",
      "body",
    ];
    return expected.filter((field) => !(availableFieldSet.has(field) && !disabledRichTextSet.has(field)));
  }, [availableFieldSet, disabledRichTextSet]);

  const showChannelConfiguration = hasField("channelSettings") || hasField("channelPublishingErrors");
  const showOptionsExtras = hasField("options") || hasField("optionsData") || hasField("variantsData");
  const showProductMedia = hasField("media") || hasField("mediaData");
  const showDesignCard = hasField("designId") || hasField("designAssignments");
  const showMockupCard = hasField("mockupConfig") || hasField("mockupAssets");
  const showSeoCard = hasField("seoTitle") || hasField("seoDescription") || hasField("tags") || hasField("customCollections");

  const missingSummary =
    missingTopLevelFields.length > 5
      ? `${missingTopLevelFields.slice(0, 5).join(", ")}, ...`
      : missingTopLevelFields.join(", ");

  return (
    <>
      {missingTopLevelFields.length ? (
        <Alert className="border-amber-200/60 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTitle>Limited seller product schema</AlertTitle>
          <AlertDescription>
            Some advanced fields ({missingSummary}) are not available in the current environment. Those inputs stay hidden until the schema
            syncs.
            {disabledRichText.length
              ? ` Rich text editors (${disabledRichText.join(
                  ", ",
                )}) are temporarily disabled due to missing editor assets. You can update them from the detail page once the editor bundle is restored.`
              : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>Core identifiers, channel defaults, and vendor linkage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <AutoInput field="title" />
              <AutoInput field="handle" />
              {hasField("status") ? <AutoEnumInput field="status" /> : null}
              {hasField("channel") ? <AutoEnumInput field="channel" /> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {hasField("channelStatus") ? <AutoEnumInput field="channelStatus" /> : null}
              {hasField("channelProductId") ? <AutoInput field="channelProductId" /> : null}
              {hasField("channelHandle") ? <AutoInput field="channelHandle" /> : null}
              {hasField("vendorCode") ? <AutoInput field="vendorCode" /> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {hasField("vendorProductId") ? <AutoInput field="vendorProductId" /> : null}
              {hasField("seller") ? <AutoBelongsToInput field="seller" /> : null}
              {hasField("shop") ? <AutoBelongsToInput field="shop" /> : null}
              {hasField("order") ? <AutoBelongsToInput field="order" /> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {hasField("productType") ? <AutoInput field="productType" /> : null}
              {hasField("productCategory") ? <AutoInput field="productCategory" /> : null}
              {hasField("category") ? <AutoInput field="category" /> : null}
              {hasField("templateSuffix") ? <AutoInput field="templateSuffix" /> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {hasField("trackInventory") ? <AutoBooleanInput field="trackInventory" /> : null}
              {hasField("continueSellingWhenOutOfStock") ? <AutoBooleanInput field="continueSellingWhenOutOfStock" /> : null}
              {hasField("hasVariantsThatRequiresComponents") ? (
                <AutoBooleanInput field="hasVariantsThatRequiresComponents" />
              ) : null}
              {hasField("publishedAt") ? <AutoDateTimePicker field="publishedAt" /> : null}
            </div>
            {disabledRichTextSet.has("body") && availableFieldSet.has("body") ? (
              <p className="text-sm text-muted-foreground">
                Body content can be edited after creation once the rich text editor bundle is available.
              </p>
            ) : null}
          </CardContent>
        </Card>

        {showChannelConfiguration ? (
          <Card>
            <CardHeader>
              <CardTitle>Channel configuration</CardTitle>
              <CardDescription>Sync preferences and publishing diagnostics per channel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasField("channelSettings") ? <AutoJSONInput field="channelSettings" /> : null}
              {hasField("channelPublishingErrors") ? <AutoJSONInput field="channelPublishingErrors" /> : null}
            </CardContent>
          </Card>
        ) : null}

        {showOptionsExtras ? (
          <Card>
            <CardHeader>
              <CardTitle>Options & attributes</CardTitle>
              <CardDescription>Define option sets and supporting metadata for this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasField("options") ? (
                <AutoHasManyForm field="options" label="Options">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="name" />
                    <AutoInput field="values" />
                  </div>
                </AutoHasManyForm>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {hasField("optionsData") ? <AutoJSONInput field="optionsData" /> : null}
                {hasField("variantsData") ? <AutoJSONInput field="variantsData" /> : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {hasField("variants") ? (
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Capture SKU-level pricing, inventory, and channel overrides.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoHasManyForm field="variants" label="Variants">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="title" />
                    <AutoInput field="sku" />
                    <AutoInput field="barcode" />
                    <AutoInput field="price" />
                    <AutoInput field="compareAtPrice" />
                    <AutoBooleanInput field="availableForSale" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AutoInput field="inventoryPolicy" />
                    <AutoInput field="inventoryQuantity" />
                    <AutoBooleanInput field="requiresShipping" />
                    <AutoInput field="hsCode" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <AutoInput field="option1" />
                    <AutoInput field="option2" />
                    <AutoInput field="option3" />
                  </div>
                </div>
              </AutoHasManyForm>
            </CardContent>
          </Card>
        ) : null}

        {showProductMedia ? (
          <Card>
            <CardHeader>
              <CardTitle>Product media</CardTitle>
              <CardDescription>Assets applied across all variants and channels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasField("media") ? (
                <AutoHasManyForm field="media" label="Media">
                  <div className="space-y-4">
                    <AutoBelongsToInput field="file" />
                  </div>
                </AutoHasManyForm>
              ) : null}
              {hasField("mediaData") ? <AutoJSONInput field="mediaData" /> : null}
            </CardContent>
          </Card>
        ) : null}

        {showDesignCard ? (
          <Card>
            <CardHeader>
              <CardTitle>Design & assignments</CardTitle>
              <CardDescription>Track design ownership, placements, and variant mappings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasField("designId") ? <AutoInput field="designId" /> : null}
              {hasField("designAssignments") ? <AutoJSONInput field="designAssignments" /> : null}
            </CardContent>
          </Card>
        ) : null}

        {showMockupCard ? (
          <Card>
            <CardHeader>
              <CardTitle>Mockups</CardTitle>
              <CardDescription>Seed mockup configuration for storefront or marketplace previews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasField("mockupConfig") ? <AutoJSONInput field="mockupConfig" /> : null}
              {hasField("mockupAssets") ? <AutoJSONInput field="mockupAssets" /> : null}
            </CardContent>
          </Card>
        ) : null}

        {showSeoCard ? (
          <Card>
            <CardHeader>
              <CardTitle>SEO & organization</CardTitle>
              <CardDescription>Metadata surfaced on sales channels and storefronts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {hasField("seoTitle") ? <AutoInput field="seoTitle" /> : null}
              </div>
              {disabledRichTextSet.has("seoDescription") && availableFieldSet.has("seoDescription") ? (
                <p className="text-sm text-muted-foreground">
                  SEO description is temporarily hidden; update it from the detail page once the editor bundle is restored.
                </p>
              ) : null}
              {hasField("tags") ? <AutoInput field="tags" /> : null}
              {hasField("customCollections") ? <AutoJSONInput field="customCollections" /> : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-center gap-2 pt-6">
          <AutoSubmit>Create product</AutoSubmit>
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

const VendorImportDialog = ({
  vendorProducts,
  onSelect,
}: {
  vendorProducts: VendorProductForImport[];
  onSelect: (product: VendorProductForImport) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(
    () =>
      vendorProducts.filter((product) => {
        const searchable = `${product.title ?? ""} ${product.handle ?? ""} ${product.vendor?.name ?? ""}`.toLowerCase();
        return searchable.includes(query.toLowerCase());
      }),
    [vendorProducts, query],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Import from vendor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import vendor product</DialogTitle>
          <DialogDescription>
            Select a vendor product to pre-populate the seller form with title, description, options, and variants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search vendor products…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ScrollArea className="h-80 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.title ?? "Untitled product"}</TableCell>
                      <TableCell>{product.handle ?? "—"}</TableCell>
                      <TableCell>{product.vendor?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onSelect(product);
                            setOpen(false);
                          }}
                        >
                          Import
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No vendor products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
