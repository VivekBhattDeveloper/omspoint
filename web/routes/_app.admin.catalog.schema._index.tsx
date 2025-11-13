import { useMemo, type ReactNode } from "react";
import type { Route } from "./+types/_app.admin.catalog.schema._index";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { schema as productModelSchema } from "../api/models/product/schema.gadget";

const RELATIONSHIP_TYPES = new Set(["belongsTo", "hasOne", "hasMany"]);

const ATTRIBUTE_GROUP_CONFIG = [
  {
    id: "identity",
    label: "Identity",
    description: "Naming and merchandising details visible to every channel.",
    attributes: ["productName", "productDescription"],
  },
  {
    id: "commerce",
    label: "Commerce & Pricing",
    description: "Values that unlock pricing, tax, and financial workflows.",
    attributes: ["price"],
  },
  {
    id: "operations",
    label: "Fulfillment & Routing",
    description: "Links products to downstream orders and vendor execution.",
    attributes: ["order"],
  },
] as const;

type DatasetSource = "api" | "fallback";

export type AttributeDefinition = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  relationship: boolean;
  validations: string[];
};

export type NormalizedVendor = {
  id?: string | null;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  updatedAt?: string | null;
};

export type NormalizedProduct = {
  id?: string | null;
  productName?: string | null;
  productDescription?: unknown;
  price?: number | null;
  orderId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  order?: {
    id?: string | null;
    orderId?: string | null;
    seller?: {
      id?: string | null;
      name?: string | null;
      vendor?: NormalizedVendor | null;
    } | null;
  } | null;
};

type CatalogDataset = {
  products: NormalizedProduct[];
  vendors: NormalizedVendor[];
  validationIssues: CatalogValidationIssue[];
  source: DatasetSource;
  error?: string;
};

export type CatalogValidationIssue = {
  id: string;
  attributeKey: string;
  attributeLabel: string;
  productId: string;
  productName?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
  message: string;
  severity: "error" | "warning";
  source: "ingestion";
  observedAt?: string | null;
};

export type AttributeUsageStats = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  relationship: boolean;
  validations: string[];
  totalProducts: number;
  missingCount: number;
  invalidCount: number;
  coverage: number;
  lastUpdatedAt?: string | null;
  sampleIssues: CatalogValidationIssue[];
};

export type AttributeGroupSummary = {
  id: string;
  label: string;
  description: string;
  attributes: AttributeUsageStats[];
  requiredCount: number;
  coverage: number;
  missingCount: number;
  invalidCount: number;
  status: "healthy" | "warning" | "critical";
};

export type VendorImpact = {
  id: string;
  name: string;
  location?: string | null;
  productCount: number;
  impactedProducts: number;
  impactedAttributes: string[];
  pendingIssues: number;
  coverage: number;
  riskLevel: "low" | "medium" | "high";
  lastTouchedAt?: string | null;
};

const RISK_LEVEL_RANK: Record<VendorImpact["riskLevel"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export type CatalogSummary = {
  totalAttributes: number;
  requiredAttributes: number;
  relationshipAttributes: number;
  productCount: number;
  validationErrors: number;
  validationWarnings: number;
  vendorsImpacted: number;
  averageCoverage: number;
};

export type CatalogSnapshot = {
  summary: CatalogSummary;
  attributeStats: AttributeUsageStats[];
  attributeGroups: AttributeGroupSummary[];
  vendorPreviews: VendorImpact[];
  validationIssues: CatalogValidationIssue[];
  datasetSource: DatasetSource;
  datasetError?: string;
};

// Minimal fallback data for edge cases
export const FALLBACK_VENDORS: NormalizedVendor[] = [];

export const FALLBACK_PRODUCTS: NormalizedProduct[] = [];

export const FALLBACK_DATASET: CatalogDataset = {
  products: [],
  vendors: [],
  validationIssues: [],
  source: "fallback",
};

const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

const toPlainRecord = <T,>(record: T): unknown => {
  if (record && typeof (record as unknown as { toJSON?: () => unknown }).toJSON === "function") {
    try {
      return ((record as unknown as { toJSON: () => unknown }).toJSON());
    } catch {
      return record;
    }
  }
  return record;
};

const normalizeCollection = <T,>(records: unknown): T[] => {
  if (!records) {
    return [];
  }
  if (Array.isArray(records)) {
    return records.map((record) => toPlainRecord(record) as T);
  }
  if (typeof records === "object" && Symbol.iterator in (records as object)) {
    return Array.from(records as Iterable<unknown>, (item) => toPlainRecord(item) as T);
  }
  return [];
};

const toTitleCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const validationLabel = (key: string, value: unknown): string => {
  const base = toTitleCase(key);
  if (typeof value === "boolean") {
    return base;
  }
  if (value === null || value === undefined) {
    return base;
  }
  if (typeof value === "object") {
    try {
      return `${base}: ${JSON.stringify(value)}`;
    } catch {
      return base;
    }
  }
  return `${base}: ${String(value)}`;
};

const extractRichText = (value: unknown): string => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    const rich = value as Record<string, unknown>;
    if (typeof rich.markdown === "string") {
      return rich.markdown;
    }
    if (typeof rich.plainText === "string") {
      return rich.plainText;
    }
    if (typeof rich.truncatedHTML === "string") {
      return rich.truncatedHTML;
    }
  }
  return "";
};

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (typeof value === "number") {
    return !Number.isNaN(value);
  }
  if (typeof value === "boolean") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    const richText = extractRichText(value);
    if (richText) {
      return true;
    }
    if ("id" in (value as Record<string, unknown>)) {
      return hasValue((value as Record<string, unknown>).id);
    }
    return Object.keys(value as Record<string, unknown>).length > 0;
  }
  return true;
};

const extractVendorFromProduct = (
  product: NormalizedProduct,
  directory: Map<string, NormalizedVendor>
): NormalizedVendor | null => {
  const vendor = product.order?.seller?.vendor;
  if (vendor?.id) {
    const fromDirectory = directory.get(vendor.id);
    return {
      id: vendor.id,
      name: fromDirectory?.name ?? vendor.name ?? `Vendor ${vendor.id}`,
      city: fromDirectory?.city ?? vendor.city ?? null,
      state: fromDirectory?.state ?? vendor.state ?? null,
      country: fromDirectory?.country ?? vendor.country ?? null,
      updatedAt: fromDirectory?.updatedAt ?? vendor.updatedAt ?? null,
    };
  }
  return null;
};

const formatLocation = (vendor: NormalizedVendor): string | null => {
  const parts = [vendor.city, vendor.state, vendor.country].filter(Boolean) as string[];
  return parts.length ? parts.join(", ") : null;
};

const updateEpoch = (current: number | undefined, timestamp?: string | null): number | undefined => {
  if (!timestamp) {
    return current;
  }
  const value = Date.parse(timestamp);
  if (Number.isNaN(value)) {
    return current;
  }
  if (current === undefined || value > current) {
    return value;
  }
  return current;
};

const computeRiskLevel = (coverage: number, pendingIssues: number): VendorImpact["riskLevel"] => {
  if (pendingIssues === 0) {
    return "low";
  }
  if (coverage >= 90 && pendingIssues <= 2) {
    return "medium";
  }
  if (coverage >= 80 && pendingIssues <= 4) {
    return "medium";
  }
  return "high";
};

type AttributeAccumulator = {
  definition: AttributeDefinition;
  missingCount: number;
  invalidCount: number;
  lastUpdatedEpoch?: number;
  sampleIssues: CatalogValidationIssue[];
};

type VendorAccumulator = {
  vendor: NormalizedVendor;
  productIds: Set<string>;
  impactedProductIds: Set<string>;
  attributeKeys: Set<string>;
  issueCount: number;
  issueObservations: number;
  lastTouchedEpoch?: number;
};

type AttributeEvaluation = {
  missing: boolean;
  invalid: boolean;
  message?: string;
  severity?: "error" | "warning";
};

const getAttributeValue = (product: NormalizedProduct, key: string): unknown => {
  switch (key) {
    case "productDescription":
      return product.productDescription;
    case "order":
      return product.order ?? product.orderId;
    default:
      return (product as Record<string, unknown>)[key];
  }
};

const evaluateAttributeForProduct = (
  definition: AttributeDefinition,
  product: NormalizedProduct
): AttributeEvaluation => {
  const rawValue = getAttributeValue(product, definition.key);
  const present = hasValue(rawValue);

  if (!present) {
    if (definition.required) {
      return {
        missing: true,
        invalid: false,
        message: `${definition.label} is required`,
        severity: "error",
      };
    }
    if (definition.relationship) {
      return {
        missing: true,
        invalid: false,
        message: `${definition.label} is not linked`,
        severity: "warning",
      };
    }
    return { missing: false, invalid: false };
  }

  if (definition.key === "price") {
    if (typeof rawValue !== "number") {
      return {
        missing: false,
        invalid: true,
        message: "Price must be numeric",
        severity: "error",
      };
    }
    if ((rawValue as number) <= 0) {
      return {
        missing: false,
        invalid: true,
        message: "Price must be greater than 0",
        severity: "error",
      };
    }
  }

  if (definition.key === "productDescription") {
    const text = extractRichText(rawValue);
    if (text.trim().length < 10) {
      return {
        missing: false,
        invalid: true,
        message: "Description must be at least 10 characters",
        severity: "error",
      };
    }
  }

  if (definition.key === "productName") {
    const name = typeof rawValue === "string" ? rawValue : "";
    if (name.trim().length === 0) {
      return {
        missing: false,
        invalid: true,
        message: "Product name is required",
        severity: "error",
      };
    }
  }

  return { missing: false, invalid: false };
};

const ensureVendorAccumulator = (
  vendor: NormalizedVendor | null,
  state: Map<string, VendorAccumulator>
): VendorAccumulator | null => {
  if (!vendor?.id) {
    return null;
  }
  const existing = state.get(vendor.id);
  if (existing) {
    existing.vendor = {
      ...existing.vendor,
      ...vendor,
    };
    return existing;
  }
  const accumulator: VendorAccumulator = {
    vendor: { ...vendor },
    productIds: new Set<string>(),
    impactedProductIds: new Set<string>(),
    attributeKeys: new Set<string>(),
    issueCount: 0,
    issueObservations: 0,
    lastTouchedEpoch: vendor.updatedAt ? updateEpoch(undefined, vendor.updatedAt) : undefined,
  };
  state.set(vendor.id, accumulator);
  return accumulator;
};

export const buildAttributeDefinitions = (schema: typeof productModelSchema): AttributeDefinition[] =>
  Object.entries(schema.fields ?? {}).map(([key, field]) => {
    const fieldWithValidations = field as { validations?: Record<string, unknown> };
    const validations = fieldWithValidations.validations
      ? Object.entries(fieldWithValidations.validations)
          .filter(([, value]) => value !== false && value !== undefined)
          .map(([rule, value]) => validationLabel(rule, value))
      : [];

    return {
      key,
      label: toTitleCase(key),
      type: field.type,
      required: Boolean(fieldWithValidations.validations?.required),
      unique: Boolean(fieldWithValidations.validations?.unique),
      relationship: RELATIONSHIP_TYPES.has(field.type),
      validations,
    } satisfies AttributeDefinition;
  });

export const evaluateCatalogSnapshot = (
  dataset: CatalogDataset,
  attributeDefinitions: AttributeDefinition[]
): CatalogSnapshot => {
  const products = dataset.products ?? [];
  const vendors = dataset.vendors ?? [];
  const existingValidationIssues = dataset.validationIssues ?? [];
  const totalProducts = products.length;

  const vendorDirectory = new Map<string, NormalizedVendor>();
  vendors.forEach((vendor) => {
    if (vendor.id) {
      vendorDirectory.set(vendor.id, vendor);
    }
  });

  const attributeAccumulators = new Map<string, AttributeAccumulator>();
  attributeDefinitions.forEach((definition) => {
    attributeAccumulators.set(definition.key, {
      definition,
      missingCount: 0,
      invalidCount: 0,
      sampleIssues: [],
    });
  });

  const vendorState = new Map<string, VendorAccumulator>();
  const syntheticValidationIssues: CatalogValidationIssue[] = [];
  let issueCounter = 0;

  // Process existing validation issues from the database first
  existingValidationIssues.forEach((issue) => {
    const accumulator = attributeAccumulators.get(issue.attributeKey);
    if (accumulator && accumulator.sampleIssues.length < 3) {
      accumulator.sampleIssues.push(issue);
    }
  });

  products.forEach((product, index) => {
    const normalizedProduct: NormalizedProduct = product ?? {};
    const productId = normalizedProduct.id ?? `product-${index + 1}`;
    const productTimestamp = normalizedProduct.updatedAt ?? normalizedProduct.createdAt ?? null;

    const vendor = extractVendorFromProduct(normalizedProduct, vendorDirectory);
    const vendorAccumulator = ensureVendorAccumulator(vendor, vendorState);
    if (vendorAccumulator) {
      vendorAccumulator.productIds.add(productId);
      vendorAccumulator.lastTouchedEpoch = updateEpoch(vendorAccumulator.lastTouchedEpoch, productTimestamp);
    }

    attributeDefinitions.forEach((definition) => {
      const accumulator = attributeAccumulators.get(definition.key);
      if (!accumulator) {
        return;
      }

      accumulator.lastUpdatedEpoch = updateEpoch(accumulator.lastUpdatedEpoch, productTimestamp);

      const evaluation = evaluateAttributeForProduct(definition, normalizedProduct);
      const hasIssue = evaluation.missing || evaluation.invalid;

      if (evaluation.missing) {
        accumulator.missingCount += 1;
      }
      if (evaluation.invalid) {
        accumulator.invalidCount += 1;
      }

      if (!hasIssue) {
        return;
      }

      // Only create synthetic issues if we don't have real ones for this product/attribute combination
      const hasExistingIssue = existingValidationIssues.some(
        (issue) => issue.productId === productId && issue.attributeKey === definition.key
      );

      if (!hasExistingIssue) {
        const issue: CatalogValidationIssue = {
          id: `synthetic-${productId}:${definition.key}:${issueCounter += 1}`,
          attributeKey: definition.key,
          attributeLabel: definition.label,
          productId,
          productName: normalizedProduct.productName ?? undefined,
          vendorId: vendorAccumulator?.vendor.id,
          vendorName: vendorAccumulator?.vendor.name,
          message:
            evaluation.message ??
            (evaluation.missing
              ? `${definition.label} is missing`
              : `${definition.label} is invalid`),
          severity: evaluation.severity ?? (definition.required ? "error" : "warning"),
          source: "ingestion",
          observedAt: productTimestamp,
        };

        syntheticValidationIssues.push(issue);
        if (accumulator.sampleIssues.length < 3) {
          accumulator.sampleIssues.push(issue);
        }
      }

      if (vendorAccumulator) {
        vendorAccumulator.issueCount += 1;
        vendorAccumulator.issueObservations += 1;
        vendorAccumulator.attributeKeys.add(definition.key);
        vendorAccumulator.impactedProductIds.add(productId);
      }
    });
  });

  // Count issues from existing validation records by attribute
  existingValidationIssues.forEach((issue) => {
    const accumulator = attributeAccumulators.get(issue.attributeKey);
    if (accumulator) {
      if (issue.severity === 'error') {
        accumulator.invalidCount += 1;
      } else {
        accumulator.missingCount += 1;
      }
    }
  });

  vendors.forEach((vendor) => {
    ensureVendorAccumulator(vendor, vendorState);
  });

  const attributeStats: AttributeUsageStats[] = Array.from(attributeAccumulators.values()).map(
    ({ definition, missingCount, invalidCount, lastUpdatedEpoch, sampleIssues }) => {
      const validCount = totalProducts - missingCount - invalidCount;
      const coverage = totalProducts > 0 ? Math.max(0, Math.round((validCount / totalProducts) * 100)) : 100;
      const lastUpdatedAt = lastUpdatedEpoch ? new Date(lastUpdatedEpoch).toISOString() : null;

      return {
        key: definition.key,
        label: definition.label,
        type: definition.type,
        required: definition.required,
        unique: definition.unique,
        relationship: definition.relationship,
        validations: definition.validations,
        totalProducts,
        missingCount,
        invalidCount,
        coverage,
        lastUpdatedAt,
        sampleIssues,
      } satisfies AttributeUsageStats;
    }
  );

  attributeStats.sort((a, b) => a.label.localeCompare(b.label));

  const attributeStatsMap = new Map(attributeStats.map((stat) => [stat.key, stat]));

  const attributeGroups: AttributeGroupSummary[] = ATTRIBUTE_GROUP_CONFIG.map((config) => {
    const stats = config.attributes
      .map((key) => attributeStatsMap.get(key))
      .filter((stat): stat is AttributeUsageStats => Boolean(stat));

    const missingCount = stats.reduce((sum, stat) => sum + stat.missingCount, 0);
    const invalidCount = stats.reduce((sum, stat) => sum + stat.invalidCount, 0);
    const coverage = stats.length
      ? Math.round(stats.reduce((sum, stat) => sum + stat.coverage, 0) / stats.length)
      : 100;

    let status: AttributeGroupSummary["status"] = "healthy";
    if (invalidCount > 0) {
      status = "critical";
    } else if (missingCount > 0) {
      status = "warning";
    }

    return {
      id: config.id,
      label: config.label,
      description: config.description,
      attributes: stats,
      requiredCount: stats.filter((stat) => stat.required).length,
      coverage,
      missingCount,
      invalidCount,
      status,
    } satisfies AttributeGroupSummary;
  });

  const vendorPreviews: VendorImpact[] = Array.from(vendorState.values()).map((accumulator, index) => {
    const productCount = accumulator.productIds.size;
    const totalObservations = attributeDefinitions.length * Math.max(productCount, 1);
    const coverage = productCount === 0
      ? 100
      : Math.max(
          0,
          Math.round(((totalObservations - accumulator.issueObservations) / totalObservations) * 100)
        );

    const pendingIssues = accumulator.issueCount;
    const impactedProducts = accumulator.impactedProductIds.size;
    const impactedAttributes = Array.from(accumulator.attributeKeys).sort();
    const lastTouchedAt = accumulator.lastTouchedEpoch
      ? new Date(accumulator.lastTouchedEpoch).toISOString()
      : accumulator.vendor.updatedAt ?? null;

    return {
      id: accumulator.vendor.id ?? `vendor-${index + 1}`,
      name: accumulator.vendor.name ?? "Unassigned vendor",
      location: formatLocation(accumulator.vendor),
      productCount,
      impactedProducts,
      impactedAttributes,
      pendingIssues,
      coverage,
      riskLevel: computeRiskLevel(coverage, pendingIssues),
      lastTouchedAt,
    } satisfies VendorImpact;
  });

  vendorPreviews.sort((a, b) => {
    const rankDelta = RISK_LEVEL_RANK[b.riskLevel] - RISK_LEVEL_RANK[a.riskLevel];
    if (rankDelta !== 0) {
      return rankDelta;
    }
    if (b.pendingIssues !== a.pendingIssues) {
      return b.pendingIssues - a.pendingIssues;
    }
    if (b.productCount !== a.productCount) {
      return b.productCount - a.productCount;
    }
    return a.name.localeCompare(b.name);
  });

  // Combine existing and synthetic validation issues
  const allValidationIssues = [...existingValidationIssues, ...syntheticValidationIssues];

  const severityRank: Record<CatalogValidationIssue["severity"], number> = { error: 2, warning: 1 };

  allValidationIssues.sort((a, b) => {
    const severityDelta = severityRank[b.severity] - severityRank[a.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }
    const timeA = a.observedAt ? Date.parse(a.observedAt) : 0;
    const timeB = b.observedAt ? Date.parse(b.observedAt) : 0;
    if (!Number.isNaN(timeB - timeA) && timeB !== timeA) {
      return timeB - timeA;
    }
    return a.id.localeCompare(b.id);
  });

  const summary: CatalogSummary = {
    totalAttributes: attributeDefinitions.length,
    requiredAttributes: attributeDefinitions.filter((definition) => definition.required).length,
    relationshipAttributes: attributeDefinitions.filter((definition) => definition.relationship).length,
    productCount: totalProducts,
    validationErrors: allValidationIssues.filter((issue) => issue.severity === "error").length,
    validationWarnings: allValidationIssues.filter((issue) => issue.severity === "warning").length,
    vendorsImpacted: vendorPreviews.filter((vendor) => vendor.pendingIssues > 0).length,
    averageCoverage: attributeStats.length
      ? Math.round(attributeStats.reduce((sum, stat) => sum + stat.coverage, 0) / attributeStats.length)
      : 100,
  } satisfies CatalogSummary;

  return {
    summary,
    attributeStats,
    attributeGroups,
    vendorPreviews,
    validationIssues: allValidationIssues,
    datasetSource: dataset.source,
    datasetError: dataset.error,
  } satisfies CatalogSnapshot;
};

const fetchCatalogDataset = async (apiClient: Route.LoaderArgs["context"]["api"]): Promise<CatalogDataset> => {
  if (!apiClient || typeof apiClient !== "object") {
    return { ...FALLBACK_DATASET, error: "API client unavailable" };
  }

  const productManager = (apiClient as { product?: { findMany?: (args: unknown) => Promise<unknown> } }).product;
  const vendorManager = (apiClient as { vendor?: { findMany?: (args: unknown) => Promise<unknown> } }).vendor;
  const catalogValidationManager = (apiClient as { catalogValidation?: { findMany?: (args: unknown) => Promise<unknown> } }).catalogValidation;

  if (!productManager?.findMany || !vendorManager?.findMany) {
    return { ...FALLBACK_DATASET, error: "Product or vendor model not available" };
  }

  try {
    const promises = [
      productManager.findMany({
        select: {
          id: true,
          productName: true,
          productDescription: { markdown: true, plainText: true, truncatedHTML: true },
          price: true,
          orderId: true,
          createdAt: true,
          updatedAt: true,
          order: {
            id: true,
            orderId: true,
            seller: {
              id: true,
              name: true,
              vendor: {
                id: true,
                name: true,
                city: true,
                state: true,
                country: true,
                updatedAt: true,
              },
            },
          },
        },
        sort: { updatedAt: "Descending" },
        first: 250,
      }),
      vendorManager.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          country: true,
          updatedAt: true,
        },
        sort: { name: "Ascending" },
        first: 250,
      }),
    ];

    // Add catalogValidation fetch if available
    if (catalogValidationManager?.findMany) {
      promises.push(
        catalogValidationManager.findMany({
          select: {
            id: true,
            attributeKey: true,
            attributeLabel: true,
            productId: true,
            productName: true,
            vendorId: true,
            vendorName: true,
            message: { markdown: true, truncatedHTML: true },
            severity: true,
            source: true,
            observedAt: true,
          },
          sort: { observedAt: "Descending" },
          first: 250,
        })
      );
    }

    const results = await Promise.all(promises);
    const [productsRaw, vendorsRaw, catalogValidationsRaw] = results;

    const products = normalizeCollection<NormalizedProduct>(productsRaw);
    const vendors = normalizeCollection<NormalizedVendor>(vendorsRaw);
    
    // Process catalog validation issues
    const validationIssues: CatalogValidationIssue[] = catalogValidationsRaw 
      ? normalizeCollection<any>(catalogValidationsRaw).map((issue: any) => ({
          id: issue.id,
          attributeKey: issue.attributeKey,
          attributeLabel: issue.attributeLabel,
          productId: issue.productId,
          productName: issue.productName,
          vendorId: issue.vendorId,
          vendorName: issue.vendorName,
          message: typeof issue.message === 'object' && issue.message?.markdown 
            ? issue.message.markdown 
            : typeof issue.message === 'string' 
            ? issue.message 
            : 'Validation error',
          severity: issue.severity || 'error',
          source: issue.source || 'ingestion',
          observedAt: issue.observedAt,
        } satisfies CatalogValidationIssue))
      : [];

    return { 
      products, 
      vendors, 
      validationIssues,
      source: "api" 
    } satisfies CatalogDataset;
  } catch (error) {
    console.error('Error fetching catalog dataset:', error);
    return { 
      ...FALLBACK_DATASET, 
      validationIssues: [],
      error: serializeError(error), 
      source: "fallback" 
    };
  }
};

export const loader = async ({ context }: Route.LoaderArgs): Promise<CatalogSnapshot> => {
  const definitions = buildAttributeDefinitions(productModelSchema);
  const dataset = await fetchCatalogDataset(context.api);
  return evaluateCatalogSnapshot(dataset, definitions);
};

type GroupStatus = AttributeGroupSummary["status"];

type Severity = CatalogValidationIssue["severity"];

type RiskLevel = VendorImpact["riskLevel"];

const GROUP_STATUS_CONFIG: Record<
  GroupStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  healthy: {
    label: "Passing",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  warning: {
    label: "Needs review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Activity className="h-3.5 w-3.5" />,
  },
  critical: {
    label: "Blocking",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  error: {
    label: "Error",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  warning: {
    label: "Warning",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; className: string; icon: ReactNode }
> = {
  low: {
    label: "Low",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  medium: {
    label: "Medium",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Activity className="h-3.5 w-3.5" />,
  },
  high: {
    label: "High",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const GroupStatusBadge = ({ status }: { status: GroupStatus }) => {
  const config = GROUP_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 font-medium", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const config = RISK_CONFIG[level];
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 font-medium", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);
};

export default function AdminCatalogSchemaPage({ loaderData }: Route.ComponentProps) {
  const {
    summary,
    attributeGroups,
    attributeStats,
    vendorPreviews,
    validationIssues,
    datasetSource,
    datasetError,
  } = loaderData;

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const summaryMetrics = useMemo(
    () => [
      {
        label: "Attributes defined",
        value: numberFormatter.format(summary.totalAttributes),
        description: "Total fields in the product model.",
      },
      {
        label: "Required attributes",
        value: numberFormatter.format(summary.requiredAttributes),
        description: "Fields blocked from publish when missing.",
      },
      {
        label: "Relationship links",
        value: numberFormatter.format(summary.relationshipAttributes),
        description: "References crossing to other models.",
      },
      {
        label: "Products evaluated",
        value: numberFormatter.format(summary.productCount),
        description: "Records scanned for validation gaps.",
      },
      {
        label: "Validation errors",
        value: numberFormatter.format(summary.validationErrors),
        description: "Blocking issues from ingestion runs.",
      },
      {
        label: "Vendors impacted",
        value: numberFormatter.format(summary.vendorsImpacted),
        description: "Partners requiring schema updates.",
      },
      {
        label: "Average coverage",
        value: `${numberFormatter.format(summary.averageCoverage)}%`,
        description: "Healthy attribute coverage across the catalog.",
      },
    ],
    [numberFormatter, summary]
  );

  const topValidationIssues = useMemo(() => validationIssues.slice(0, 8), [validationIssues]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Schema & Validation"
        description="Control product attributes, enforce validation rules, and propagate changes across vendors."
      />

      {datasetError && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fell back to sample data</AlertTitle>
          <AlertDescription>{datasetError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Schema overview</CardTitle>
            <CardDescription>
              Attribute inventory, validation coverage, and downstream blast radius for pending changes.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "self-start text-xs font-semibold uppercase tracking-wide",
              datasetSource === "fallback"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            )}
          >
            {datasetSource === "fallback" ? "Sample dataset" : "Live dataset"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attribute groups</CardTitle>
          <CardDescription>Visualize validation posture across logical attribute bundles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {attributeGroups.map((group) => (
              <div key={group.id} className="flex h-full flex-col rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{group.label}</p>
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                  </div>
                  <GroupStatusBadge status={group.status} />
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Coverage</span>
                      <span className="font-medium text-foreground">{group.coverage}%</span>
                    </div>
                    <Progress value={group.coverage} className="mt-1 h-2" />
                  </div>
                  <div className="space-y-2 text-sm">
                    {group.attributes.map((attribute) => (
                      <div key={attribute.key} className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                        <div>
                          <p className="font-medium text-foreground">{attribute.label}</p>
                          <p className="text-xs text-muted-foreground">{attribute.key}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{attribute.coverage}% healthy</p>
                          <p>
                            {attribute.missingCount} missing · {attribute.invalidCount} invalid
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attribute definitions</CardTitle>
          <CardDescription>Connect product schema metadata to runtime validation signals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Rules</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="text-right">Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeStats.map((attribute) => (
                <TableRow key={attribute.key}>
                  <TableCell>
                    <div className="font-medium text-foreground">{attribute.label}</div>
                    <div className="text-xs text-muted-foreground">{attribute.key}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell align-middle">
                    <Badge variant="outline" className="text-xs font-medium capitalize">
                      {attribute.type}
                    </Badge>
                    {attribute.relationship && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-sky-200 bg-sky-50 text-xs font-medium text-sky-700"
                      >
                        Relationship
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell align-middle">
                    <div className="flex flex-wrap gap-1">
                      {attribute.validations.length === 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No validations
                        </Badge>
                      )}
                      {attribute.validations.map((rule) => (
                        <Badge key={rule} variant="outline" className="text-xs font-medium">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-3">
                      <Progress value={attribute.coverage} className="h-2 w-24" />
                      <span className="text-sm font-medium">{attribute.coverage}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {attribute.lastUpdatedAt ? `Last touched ${formatDateTime(attribute.lastUpdatedAt)}` : "No updates"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    {attribute.missingCount === 0 && attribute.invalidCount === 0 ? (
                      <span className="inline-flex items-center justify-end gap-1 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Clear
                      </span>
                    ) : (
                      <div className="text-sm font-medium text-rose-600">
                        {attribute.missingCount} missing / {attribute.invalidCount} invalid
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor impact analysis</CardTitle>
          <CardDescription>
            Understand which vendors will be affected before publishing schema updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="hidden lg:table-cell">Products</TableHead>
                <TableHead className="hidden lg:table-cell">Impacted attributes</TableHead>
                <TableHead className="text-right">Pending issues</TableHead>
                <TableHead className="hidden xl:table-cell text-right">Last touched</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorPreviews.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{vendor.name}</span>
                      <span className="text-xs text-muted-foreground">{vendor.location ?? "Location pending"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={vendor.coverage} className="h-2 w-20" />
                      <span className="text-sm font-medium">{vendor.coverage}%</span>
                    </div>
                    <div className="mt-1"><RiskBadge level={vendor.riskLevel} /></div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm font-medium text-foreground">
                      {numberFormatter.format(vendor.productCount)} total
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {numberFormatter.format(vendor.impactedProducts)} impacted
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {vendor.impactedAttributes.length === 0 ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          None
                        </Badge>
                      ) : (
                        vendor.impactedAttributes.map((attribute) => (
                          <Badge key={attribute} variant="outline" className="text-xs font-medium">
                            {attribute}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-rose-600">
                    {numberFormatter.format(vendor.pendingIssues)}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-right text-xs text-muted-foreground">
                    {formatDateTime(vendor.lastTouchedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent validation issues</CardTitle>
          <CardDescription>
            Latest ingestion errors grouped by attribute so you can triage before publishing updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topValidationIssues.length === 0 ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
              No validation issues detected in the current data set.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Observed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topValidationIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="text-sm font-medium text-foreground">
                      <div>{issue.attributeLabel}</div>
                      <SeverityBadge severity={issue.severity} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground">
                        {issue.productName ?? issue.productId}
                      </div>
                      <div className="text-xs text-muted-foreground">{issue.productId}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-foreground">{issue.vendorName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{issue.vendorId ?? ""}</div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{issue.message}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateTime(issue.observedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
