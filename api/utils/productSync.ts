import { generateDefaultTitle } from "./titleValidation";

type PrimitiveRecord = Record<string, unknown>;

const PRODUCT_STATUS_FALLBACK = "draft";
const PRODUCT_STATUS_OPTIONS = new Set(["draft", "active", "archived"]);

const cleanObject = <T extends PrimitiveRecord>(input: T): T =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;

const toIsoString = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed.toISOString();
    }
  }

  return undefined;
};

const normaliseTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((tag) => typeof tag === "string").join(", ");
  }

  return typeof value === "string" ? value : undefined;
};

const coerceBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const coerceNumber = (value: unknown, fallback?: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstDefined = <T>(...candidates: T[]): T | undefined =>
  candidates.find((candidate) => candidate !== undefined);

const normaliseProductStatus = (
  status: unknown,
): "draft" | "active" | "archived" => {
  if (typeof status === "string") {
    const lowered = status.toLowerCase();
    if (PRODUCT_STATUS_OPTIONS.has(lowered)) {
      return lowered as "draft" | "active" | "archived";
    }
  }

  return PRODUCT_STATUS_FALLBACK;
};

const normalisePrice = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return undefined;
};

/**
 * Builds an upsert payload for the sellerProduct model using a Shopify product-like payload.
 * Use the `overrides` parameter to supply identifiers (e.g., seller, shop) that are not present on the source payload.
 */
export const buildSellerProductUpsertInput = (
  product: PrimitiveRecord,
  overrides: PrimitiveRecord = {},
) => {
  const base = {
    title:
      (product.title as string | undefined) ??
      generateDefaultTitle("sellerProduct", product),
    handle: product.handle as string | undefined,
    status: normaliseProductStatus(firstDefined(product.status, product.state)),
    body: (product.body ?? product.bodyHtml) as string | undefined,
    vendor: product.vendor as string | undefined,
    productType: product.productType as string | undefined,
    tags: normaliseTags(product.tags),
    category: product.category as string | undefined,
    productCategory: product.productCategory as string | undefined,
    templateSuffix: product.templateSuffix as string | undefined,
    publishedAt: toIsoString(
      firstDefined(product.publishedAt, product.published_at),
    ),
    shopifyCreatedAt: toIsoString(
      firstDefined(product.shopifyCreatedAt, product.createdAt, product.created_at),
    ),
    shopifyUpdatedAt: toIsoString(
      firstDefined(product.shopifyUpdatedAt, product.updatedAt, product.updated_at),
    ),
    hasVariantsThatRequiresComponents: coerceBoolean(
      product.hasVariantsThatRequiresComponents,
      false,
    ),
    optionsData: product.options as unknown,
    variantsData: product.variants as unknown,
    mediaData: product.media as unknown,
    featuredMediaData: product.featuredMedia as unknown,
    compareAtPriceRange: product.compareAtPriceRange as unknown,
    customCollections: product.customCollections as unknown,
    checkoutLineItems: product.checkoutLineItems as unknown,
    orderLineItems: product.orderLineItems as unknown,
    channel: product.channel as string | undefined,
    channelHandle: product.channelHandle as string | undefined,
    channelProductId:
      (product.channelProductId as string | undefined) ??
      (product.id as string | undefined),
    vendorCode: product.vendorCode as string | undefined,
    vendorProductId: product.vendorProductId as string | undefined,
    generatedImages: product.generatedImages as unknown,
    designId: product.designId as string | undefined,
  };

  return cleanObject({ ...base, ...overrides });
};

/**
 * Builds an upsert payload for the sellerProductVariant model using a Shopify variant-like payload.
 */
export const buildSellerProductVariantUpsertInput = (
  variant: PrimitiveRecord,
  overrides: PrimitiveRecord = {},
) => {
  const basePrice =
    normalisePrice(variant.price) ??
    normalisePrice(overrides.price) ??
    "0.00";

  const base = {
    title:
      (variant.title as string | undefined) ??
      generateDefaultTitle("sellerProductVariant", variant),
    sku: variant.sku as string | undefined,
    barcode: variant.barcode as string | undefined,
    price: basePrice,
    compareAtPrice: variant.compareAtPrice as string | undefined,
    position: coerceNumber(variant.position, undefined),
    option1: variant.option1 as string | undefined,
    option2: variant.option2 as string | undefined,
    option3: variant.option3 as string | undefined,
    availableForSale: coerceBoolean(variant.availableForSale, true),
    taxable: coerceBoolean(variant.taxable, true),
    taxCode: variant.taxCode as string | undefined,
    inventoryPolicy: variant.inventoryPolicy as string | undefined,
    inventoryQuantity: coerceNumber(variant.inventoryQuantity, 0),
    selectedOptions: variant.selectedOptions as unknown,
    presentmentPrices: variant.presentmentPrices as unknown,
    requiresShipping: coerceBoolean(variant.requiresShipping, true),
    shopifyCreatedAt: toIsoString(
      firstDefined(variant.shopifyCreatedAt, variant.createdAt, variant.created_at),
    ),
    shopifyUpdatedAt: toIsoString(
      firstDefined(variant.shopifyUpdatedAt, variant.updatedAt, variant.updated_at),
    ),
    inventoryItem:
      (variant.inventoryItemId as string | undefined) ??
      ((variant.inventoryItem as PrimitiveRecord | undefined)?.id as
        | string
        | undefined),
    designId: variant.designId as string | undefined,
  };

  return cleanObject({ ...base, ...overrides });
};

/**
 * Builds an upsert payload for the vendorProduct model using a Shopify product-like payload.
 */
export const buildVendorProductUpsertInput = (
  product: PrimitiveRecord,
  overrides: PrimitiveRecord = {},
) => {
  const base = {
    title:
      (product.title as string | undefined) ??
      generateDefaultTitle("vendorProduct", product),
    handle: product.handle as string | undefined,
    status: normaliseProductStatus(firstDefined(product.status, product.state)),
    body: (product.body ?? product.bodyHtml) as string | undefined,
    vendor: product.vendorName
      ? (product.vendorName as string)
      : (product.vendor as string | undefined),
    productType: product.productType as string | undefined,
    tags: normaliseTags(product.tags),
    category: product.category as string | undefined,
    productCategory: product.productCategory as string | undefined,
    templateSuffix: product.templateSuffix as string | undefined,
    publishedAt: toIsoString(
      firstDefined(product.publishedAt, product.published_at),
    ),
    shopifyCreatedAt: toIsoString(
      firstDefined(product.shopifyCreatedAt, product.createdAt, product.created_at),
    ),
    shopifyUpdatedAt: toIsoString(
      firstDefined(product.shopifyUpdatedAt, product.updatedAt, product.updated_at),
    ),
    hasVariantsThatRequiresComponents: coerceBoolean(
      product.hasVariantsThatRequiresComponents,
      false,
    ),
    optionsData: product.options as unknown,
    variantsData: product.variants as unknown,
    mediaData: product.media as unknown,
    featuredMediaData: product.featuredMedia as unknown,
    compareAtPriceRange: product.compareAtPriceRange as unknown,
    customCollections: product.customCollections as unknown,
    checkoutLineItems: product.checkoutLineItems as unknown,
    orderLineItems: product.orderLineItems as unknown,
  };

  return cleanObject({ ...base, ...overrides });
};

/**
 * Builds an upsert payload for the vendorProductVariant model using a Shopify variant-like payload.
 */
export const buildVendorProductVariantUpsertInput = (
  variant: PrimitiveRecord,
  overrides: PrimitiveRecord = {},
) => {
  const basePrice =
    normalisePrice(variant.price) ??
    normalisePrice(overrides.price) ??
    "0.00";

  const base = {
    title:
      (variant.title as string | undefined) ??
      generateDefaultTitle("vendorProductVariant", variant),
    sku: variant.sku as string | undefined,
    barcode: variant.barcode as string | undefined,
    price: basePrice,
    compareAtPrice: variant.compareAtPrice as string | undefined,
    position: coerceNumber(variant.position, undefined),
    option1: variant.option1 as string | undefined,
    option2: variant.option2 as string | undefined,
    option3: variant.option3 as string | undefined,
    availableForSale: coerceBoolean(variant.availableForSale, true),
    taxable: coerceBoolean(variant.taxable, true),
    taxCode: variant.taxCode as string | undefined,
    inventoryPolicy: variant.inventoryPolicy as string | undefined,
    inventoryQuantity: coerceNumber(variant.inventoryQuantity, 0),
    selectedOptions: variant.selectedOptions as unknown,
    presentmentPrices: variant.presentmentPrices as unknown,
    requiresShipping: coerceBoolean(variant.requiresShipping, true),
    shopifyCreatedAt: toIsoString(
      firstDefined(variant.shopifyCreatedAt, variant.createdAt, variant.created_at),
    ),
    shopifyUpdatedAt: toIsoString(
      firstDefined(variant.shopifyUpdatedAt, variant.updatedAt, variant.updated_at),
    ),
    inventoryItem:
      (variant.inventoryItemId as string | undefined) ??
      ((variant.inventoryItem as PrimitiveRecord | undefined)?.id as
        | string
        | undefined),
  };

  return cleanObject({ ...base, ...overrides });
};
