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
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.products.$id";

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const product = await context.api.vendorProduct.findOne(params.id, {
    select: {
      id: true,
      title: true,
      handle: true,
      status: true,
      vendorId: true,
      productType: true,
      category: true,
      tags: true,
      templateSuffix: true,
      body: { markdown: true, truncatedHTML: true },
      publishedAt: true,
      compareAtPriceRange: true,
      variantsData: true,
      orderLineItems: true,
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

  return { product };
};

export default function VendorProductDetail({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const navigate = useNavigate();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

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
        select={{
          title: true,
          handle: true,
          status: true,
          vendor: { id: true },
          productType: true,
          category: true,
          tags: true,
          templateSuffix: true,
          publishedAt: true,
          body: { markdown: true },
          compareAtPriceRange: true,
          variantsData: true,
          orderLineItems: true,
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
        }}
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
              <AutoDateTimePicker field="publishedAt" />
              <AutoRichTextInput field="body" />
              <div className="grid gap-4 md:grid-cols-2">
                <AutoJSONInput field="compareAtPriceRange" />
                <AutoJSONInput field="variantsData" />
                <AutoJSONInput field="orderLineItems" />
              </div>
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
              <CardDescription>Maintain shared imagery for vendor listings and production references.</CardDescription>
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
          <Button variant="ghost" type="button" onClick={() => navigate("/vendor/products")}>
            Cancel
          </Button>
        </div>
      </AutoForm>
    </div>
  );
}
