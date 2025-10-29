/**
 * Pricing Calculation Utilities
 *
 * Handles price calculations for:
 * - Base service prices
 * - Add-ons pricing
 * - Total project cost
 * - Deposit calculations (50% deposit model)
 */

export interface PricingBreakdown {
  basePrice: number;
  addOnsTotal: number;
  subtotal: number;
  discount: number;
  total: number;
  depositAmount: number; // 50% of total
  finalPayment: number;  // Remaining 50%
  addOns: AddOnPricing[];
}

export interface AddOnPricing {
  id: number;
  name: string;
  category: string;
  price: number;
  isFree: boolean;
}

/**
 * Calculate total project price including base service and selected add-ons
 *
 * @param basePrice - Base price of the selected service (e.g., ₱15,000 for Landing Page)
 * @param addOns - Array of selected add-ons with pricing
 * @param discountPercentage - Optional discount percentage (0-100)
 * @returns Complete pricing breakdown
 *
 * @example
 * ```typescript
 * const pricing = calculateTotalPrice(15000, [
 *   { id: 1, name: 'Google Analytics', category: 'analytics', price: 0, isFree: true },
 *   { id: 2, name: 'Mailchimp Integration', category: 'marketing', price: 3000, isFree: false }
 * ]);
 *
 * console.log(pricing.total); // ₱18,000
 * console.log(pricing.depositAmount); // ₱9,000
 * ```
 */
export function calculateTotalPrice(
  basePrice: number,
  addOns: AddOnPricing[] = [],
  discountPercentage: number = 0
): PricingBreakdown {
  // Calculate add-ons total (exclude free add-ons)
  const addOnsTotal = addOns
    .filter(addon => !addon.isFree)
    .reduce((sum, addon) => sum + addon.price, 0);

  // Calculate subtotal
  const subtotal = basePrice + addOnsTotal;

  // Calculate discount amount
  const discount = Math.round((subtotal * discountPercentage) / 100);

  // Calculate final total
  const total = subtotal - discount;

  // Calculate deposit (50% of total)
  const depositAmount = Math.round(total / 2);

  // Calculate final payment (remaining 50%)
  const finalPayment = total - depositAmount;

  return {
    basePrice,
    addOnsTotal,
    subtotal,
    discount,
    total,
    depositAmount,
    finalPayment,
    addOns,
  };
}

/**
 * Format price in Philippine Peso with thousands separator
 *
 * @param amount - Amount in pesos
 * @param includeSymbol - Whether to include ₱ symbol
 * @returns Formatted price string
 *
 * @example
 * ```typescript
 * formatPrice(15000); // "₱15,000"
 * formatPrice(15000, false); // "15,000"
 * formatPrice(18500); // "₱18,500"
 * ```
 */
export function formatPrice(amount: number, includeSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('en-PH');
  return includeSymbol ? `₱${formatted}` : formatted;
}

/**
 * Format price in thousands (k format) for display
 *
 * @param amount - Amount in pesos
 * @returns Formatted price string (e.g., "15k", "18.5k")
 *
 * @example
 * ```typescript
 * formatPriceShort(15000); // "15k"
 * formatPriceShort(18500); // "18.5k"
 * formatPriceShort(150000); // "150k"
 * ```
 */
export function formatPriceShort(amount: number): string {
  const thousands = amount / 1000;

  // If it's a whole number, show without decimals
  if (thousands % 1 === 0) {
    return `${thousands}k`;
  }

  // Otherwise, show with 1 decimal place
  return `${thousands.toFixed(1)}k`;
}

/**
 * Group add-ons by category for organized display
 *
 * @param addOns - Array of add-ons
 * @returns Object with add-ons grouped by category
 *
 * @example
 * ```typescript
 * const grouped = groupAddOnsByCategory(addOns);
 * // {
 * //   analytics: [...],
 * //   marketing: [...],
 * //   communication: [...]
 * // }
 * ```
 */
export function groupAddOnsByCategory(
  addOns: AddOnPricing[]
): Record<string, AddOnPricing[]> {
  return addOns.reduce((groups, addOn) => {
    const category = addOn.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOnPricing[]>);
}

/**
 * Category display names for UI
 */
export const ADDON_CATEGORY_LABELS: Record<string, string> = {
  analytics: 'Analytics & Tracking',
  marketing: 'Marketing & Lead Capture',
  communication: 'Communication',
  social: 'Social & Community',
  payment: 'Payment & E-commerce',
  other: 'Other Services',
};

/**
 * Get category label for display
 */
export function getCategoryLabel(category: string): string {
  return ADDON_CATEGORY_LABELS[category] || 'Other';
}

/**
 * Calculate estimated timeline based on add-ons complexity
 *
 * @param baseTimeline - Base timeline in days (e.g., 14 for "1-2 weeks")
 * @param addOns - Selected add-ons
 * @returns Estimated timeline in days
 *
 * Complex add-ons (payment gateways, custom APIs) add extra days
 */
export function calculateEstimatedTimeline(
  baseTimeline: number,
  addOns: AddOnPricing[]
): number {
  // Complex add-ons that require more integration time
  const complexAddOns = [
    'paymongo payment gateway',
    'stripe payment gateway',
    'custom api integration',
    'hubspot crm integration',
    'activecampaign integration',
  ];

  // Count complex add-ons
  const complexCount = addOns.filter(addon =>
    complexAddOns.some(complex =>
      addon.name.toLowerCase().includes(complex)
    )
  ).length;

  // Add 2-3 days per complex integration
  const additionalDays = complexCount * 2;

  return baseTimeline + additionalDays;
}

/**
 * Format timeline in human-readable format
 *
 * @param days - Number of days
 * @returns Formatted timeline string
 *
 * @example
 * ```typescript
 * formatTimeline(14); // "1-2 weeks"
 * formatTimeline(30); // "3-4 weeks"
 * formatTimeline(45); // "5-7 weeks"
 * ```
 */
export function formatTimeline(days: number): string {
  const weeks = Math.ceil(days / 7);

  if (weeks <= 2) {
    return '1-2 weeks';
  } else if (weeks <= 4) {
    return '2-4 weeks';
  } else if (weeks <= 8) {
    return '4-8 weeks';
  } else if (weeks <= 12) {
    return '8-12 weeks';
  } else {
    return '12-16 weeks';
  }
}

/**
 * Validate pricing data
 * Ensures all prices are valid numbers and non-negative
 */
export function validatePricing(pricing: PricingBreakdown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (pricing.basePrice < 0) {
    errors.push('Base price cannot be negative');
  }

  if (pricing.total < 0) {
    errors.push('Total price cannot be negative');
  }

  if (pricing.depositAmount > pricing.total) {
    errors.push('Deposit amount cannot exceed total price');
  }

  pricing.addOns.forEach((addon, index) => {
    if (!addon.isFree && addon.price < 0) {
      errors.push(`Add-on "${addon.name}" has negative price`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
