type ProductModel = "sellerProduct" | "vendorProduct" | "shopifyProduct";
type VariantModel =
  | "sellerProductVariant"
  | "vendorProductVariant"
  | "shopifyProductVariant";

const PRODUCT_MODELS: readonly ProductModel[] = [
  "sellerProduct",
  "vendorProduct",
  "shopifyProduct",
] as const;
const VARIANT_MODELS: readonly VariantModel[] = [
  "sellerProductVariant",
  "vendorProductVariant",
  "shopifyProductVariant",
] as const;

const isProductModel = (model: string): model is ProductModel =>
  (PRODUCT_MODELS as readonly string[]).includes(model);

const isVariantModel = (model: string): model is VariantModel =>
  (VARIANT_MODELS as readonly string[]).includes(model);

const TIMESTAMP_PREFIXES: Record<string, string> = {
  sellerProduct: "Seller Product",
  vendorProduct: "Vendor Product",
  sellerProductVariant: "Seller Variant",
  vendorProductVariant: "Vendor Variant",
};

const isoTimestamp = () => new Date().toISOString();

const normaliseTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string").join(", ");
  }

  return typeof value === "string" ? value : undefined;
};

/**
 * Generates a fallback title for product and variant records when one is not supplied.
 * Prefers existing title/handle/sku fields before falling back to a timestamp-based value.
 */
export const generateDefaultTitle = (
  model: string,
  data: Record<string, unknown> = {},
): string => {
  if (typeof data.title === "string" && data.title.trim().length > 0) {
    return data.title.trim();
  }

  if (isProductModel(model)) {
    const handle = typeof data.handle === "string" ? data.handle.trim() : "";
    if (handle) {
      return handle;
    }
  }

  if (isVariantModel(model)) {
    const sku = typeof data.sku === "string" ? data.sku.trim() : "";
    if (sku) {
      return sku;
    }
  }

  const prefix =
    TIMESTAMP_PREFIXES[model] ??
    model
      .replace(/([A-Z])/g, " $1")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\w/, (char) => char.toUpperCase());

  return `${prefix} - ${isoTimestamp()}`;
};

/**
 * Extracts the core title metadata used across admin UIs to pre-fill inputs.
 * For product models, the handle is included. For variants, the SKU is included.
 */
export const extractTitleData = (
  model: string,
  data: Record<string, unknown> = {},
) => {
  const payload: Record<string, unknown> = {};

  if (typeof data.title === "string") {
    payload.title = data.title;
  }

  if (isProductModel(model)) {
    if (typeof data.handle === "string") {
      payload.handle = data.handle;
    }
    const tags = normaliseTags(data.tags);
    if (tags) {
      payload.tags = tags;
    }
  }

  if (isVariantModel(model)) {
    if (typeof data.sku === "string") {
      payload.sku = data.sku;
    }
  }

  return payload;
};
