export type Domain = {
  id: string;
  name: string;
  niches: string;
  keywords: string;
  notes: string;
  seoMetricsRequirements?: {
    minDomainRating?: number;
    minDomainAuthority?: number;
    minDomainTraffic?: number;
    otherRequirements?: string;
  };
};
