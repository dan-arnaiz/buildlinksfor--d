import { z } from "zod";

export type Publisher = {
  id: string;
  domainName: string;
  niche: string;
  domainRating: number;
  domainAuthority: number;
  domainTraffic: number;
  trafficLocation: string;
  acceptsGreyNiche: boolean;
  spamScore: number;
  currency: string;
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


export const formSchema = z.object({
  domainName: z.string()
  .min(1, "Domain name is required")
  .transform(value => {

    return value.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  })
  .refine(
    (value) => {
      const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      return domainPattern.test(value);
    },
    "Invalid domain name format. It should be domainname.com"
  ),
  niche: z.array(z.string())
    .min(1, "At least one niche is required")
    .refine(
      (value) => value.every(item => item.trim() !== ""),
      "Empty niche values are not allowed"
    ),
  domainRating: z.coerce.number().min(0).max(100),
  domainAuthority: z.coerce.number().min(0).max(100),
  domainTraffic: z.coerce.number().min(0),
  trafficLocation: z.string().optional(),
  spamScore: z.coerce.number().min(0).max(100),
  linkInsertionPrice: z.coerce.number().min(0),
  guestPostPrice: z.coerce.number().min(0),
  currency: z.string().optional(),
  linkInsertionGuidelines: z.string().optional(),
  guestPostGuidelines: z.string().optional(),
  metricsLastUpdate: z.date(),
  notes: z.string().optional(),
  isReseller: z.boolean(),
  acceptsGreyNiche: z.boolean(),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
}).refine(
  (data) => {
    if (data.linkInsertionPrice > 0 || data.guestPostPrice > 0) {
      return !!data.currency;
    }
    return true;
  },
  {
    message: "Currency is required",
    path: ["currency"],
  }
).refine(
  (data) => {
    if (data.isReseller) {
      return !!data.notes;
    }
    return true;
  },
  {
    message: "Notes are required, please put some information for resellers",
    path: ["notes"],
  }
)