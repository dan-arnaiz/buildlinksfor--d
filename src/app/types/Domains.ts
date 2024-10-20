import { z } from "zod";

export type Domain = {
  id: string;
  name: string;
  niches: string;
  keywords: string;
  notes: string;
  archived: boolean;
  seoMetricsRequirements?: {
    minDomainRating?: number;
    minDomainAuthority?: number;
    minDomainTraffic?: number;
    otherRequirements?: string;
  };
};
export const formSchema = z.object({
  name: z
    .string()
    .min(1, "Domain name is required")
    .transform((value) => {
      return value.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
    })
    .refine((value) => {
      const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      return domainPattern.test(value);
    }, "Invalid domain name format. It should be domainname.com"),
  niches: z
    .array(z.string())
    .min(1, "At least one niche is required")
    .refine(
      (value) => value.every((item) => item.trim() !== ""),
      "Empty niche values are not allowed"
    ),
  keywords: z
    .array(z.string())
    .min(1, "At least one keyword is required")
    .refine(
      (value) => value.every((item) => item.trim() !== ""),
      "Empty keyword values are not allowed"
    ),
  archived: z.boolean().optional(),
  notes: z.string().optional(),
  seoMetricsRequirements: z.object({
    minDomainRating: z.number().min(0).max(100),
    minDomainAuthority: z.number().min(0).max(100),
    minDomainTraffic: z.number().min(0),
    otherRequirements: z.string().optional(),
  }),
});