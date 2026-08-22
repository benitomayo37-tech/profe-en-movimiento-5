import "server-only";

const checkoutEnvironmentKeys: Record<string, string> = {
  "games-cooperative-volume-1": "HOTMART_CHECKOUT_GAMES_COOPERATIVE_VOLUME_1",
  "physical-education-planning": "HOTMART_CHECKOUT_PHYSICAL_EDUCATION_PLANNING",
  "evaluation-toolkit": "HOTMART_CHECKOUT_EVALUATION_TOOLKIT",
  "ebook-games": "HOTMART_CHECKOUT_EBOOK_GAMES",
  "ebook-active-methodologies": "HOTMART_CHECKOUT_EBOOK_ACTIVE_METHODOLOGIES",
  "teacher-pro-pack": "HOTMART_CHECKOUT_TEACHER_PRO_PACK",
  "fundamentos-tendencias-educacion-fisica": "HOTMART_CHECKOUT_FUNDAMENTOS_TENDENCIAS",
  "suite-19-miniapps-docentes": "HOTMART_CHECKOUT_SUITE_19_MINIAPPS",
};

export function getHotmartCheckoutUrl(productId: string) {
  const environmentKey = checkoutEnvironmentKeys[productId];
  const candidate = environmentKey ? process.env[environmentKey] : undefined;

  if (!candidate) {
    return undefined;
  }

  try {
    const url = new URL(candidate);
    const isSecure = url.protocol === "https:";
    const isHotmartDomain = url.hostname === "hotmart.com" || url.hostname.endsWith(".hotmart.com");

    return isSecure && isHotmartDomain ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
