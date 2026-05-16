// iyzico plan → product/pricing plan mapping
// Set up matching products and pricing plans in your iyzico merchant panel
export const IYZICO_PLAN_MAPPING: Record<string, { productReferenceCode: string; pricingPlanReferenceCode: string }> = {
  STARTER: {
    productReferenceCode: "randevo_starter",
    pricingPlanReferenceCode: "randevo_starter_monthly",
  },
  PRO: {
    productReferenceCode: "randevo_pro",
    pricingPlanReferenceCode: "randevo_pro_monthly",
  },
};
