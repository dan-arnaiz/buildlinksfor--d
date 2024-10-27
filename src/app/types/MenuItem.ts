import { LucideIcon } from "lucide-react";


export type MenuItem = {
    href: string;
    icon: LucideIcon;
    label: string;
    subItems?: MenuItem[];
  }