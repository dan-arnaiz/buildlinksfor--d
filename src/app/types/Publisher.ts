export type Publisher = {
  id: string;
  domainName: string;
  niche: string;
  domainRating: number;
  domainAuthority: number;
  domainTraffic: number;
  spamScore: number;
  linkInsertionPrice: number;
  guestPostPrice: number;
  linkInsertionGuidelines?: string;
  guestPostGuidelines?: string;
  metricsLastUpdate: Date;
  notes?: string;
  isReseller: boolean;
  contactName?: string;
  contactEmail?: string;
};
