export type Domain = {
  id: string;
  name: string;
  niches: string;
  keywords: string;
  existingLinks: string;
  seoMetricsRequirements?: {
    minDomainRating?: number;
    minDomainAuthority?: number;
    minDomainTraffic?: number;
    otherRequirements?: string;
  };
};
