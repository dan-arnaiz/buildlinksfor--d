"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Domain } from "@/app/types/Domains";
import { fetchDomains } from "@/app/actions/domainActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import Image from "next/image";
import { motion } from "framer-motion";
import { getFaviconUrl, getInitials } from "@/app/utils/domainUtils";

interface DomainSelectorProps {
  onSelect: (domain: Domain | null) => void;
  initialDomain?: Domain | null;
  onSeoMetricsChange?: (metrics: {
    minDomainRating: number;
    minDomainAuthority: number;
    minDomainTraffic: number;
    niches: string[];
  }) => void;
  initialSeoMetrics?: {
    minDomainRating: number;
    minDomainAuthority: number;
    minDomainTraffic: number;
    niches: string[];
  };
}

export default function DomainSelector({
  onSelect,
  initialDomain = null,
  onSeoMetricsChange,
  initialSeoMetrics,
}: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(initialDomain);
  const [filters, setFilters] = useState(initialSeoMetrics || {
    minDomainRating: 0,
    minDomainAuthority: 0,
    minDomainTraffic: 0,
    niches: [] as string[],
  });
  const [allNiches, setAllNiches] = useState<string[]>([]);

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const fetchedDomains = await fetchDomains();
        const activeDomains = fetchedDomains.filter(
          (domain) => !domain.archived
        );
        setDomains(activeDomains);

        // Extract all unique niches
        const niches = new Set<string>();
        activeDomains.forEach((domain) => {
          domain.niches.split(",").forEach((niche) => niches.add(niche.trim()));
        });
        setAllNiches(Array.from(niches));
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };
    loadDomains();
  }, []);

  const handleSelect = (value: string) => {
    const domain = domains.find((d) => d.id === value) || null;
    setSelectedDomain(domain);
    onSelect(domain);

    if (domain) {
      setFilters({
        minDomainRating: domain.seoMetricsRequirements?.minDomainRating || 0,
        minDomainAuthority:
          domain.seoMetricsRequirements?.minDomainAuthority || 0,
        minDomainTraffic: domain.seoMetricsRequirements?.minDomainTraffic || 0,
        niches: domain.niches.split(",").map((niche) => niche.trim()),
      });
    } else {
      setFilters({
        minDomainRating: 0,
        minDomainAuthority: 0,
        minDomainTraffic: 0,
        niches: [],
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: parseInt(value) || 0 };
    setFilters(newFilters);
    onSeoMetricsChange?.(newFilters);
  };

  const handleNicheChange = (selectedNiches: string[]) => {
    const newFilters = { ...filters, niches: selectedNiches };
    setFilters(newFilters);
    onSeoMetricsChange?.(newFilters);
  };


  return (
    <motion.div
      className="space-y-6 max-w-full mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-lg p-4 border border-gray-200">
        <Label htmlFor="domainSelect" className="text-lg font-semibold mb-2 block">
          Select Client Domain
        </Label>
        <Select onValueChange={handleSelect} value={selectedDomain?.id || ""}>
          <SelectTrigger className="w-full" id="domainSelect">
            <SelectValue placeholder="Select a client domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id}>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center bg-gray-200 rounded-full text-xs font-bold overflow-hidden">
                    <Image
                      src={getFaviconUrl(domain.name)}
                      alt={`${domain.name} favicon`}
                      width={16}
                      height={16}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const parentElement = e.currentTarget.parentElement;
                        if (parentElement) {
                          parentElement.innerHTML = getInitials(domain.name);
                        }
                      }}
                    />
                  </div>
                  {domain.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDomain && (
        <motion.div
          className="rounded-lg p-6 border border-gray-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">SEO Metrics & Niches Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="minDomainRating" className="block mb-2">
                Min Domain Rating
              </Label>
              <Input
                id="minDomainRating"
                name="minDomainRating"
                type="number"
                value={filters.minDomainRating}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="minDomainAuthority" className="block mb-2">
                Min Domain Authority
              </Label>
              <Input
                id="minDomainAuthority"
                name="minDomainAuthority"
                type="number"
                value={filters.minDomainAuthority}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="minDomainTraffic" className="block mb-2">
                Min Domain Traffic
              </Label>
              <Input
                id="minDomainTraffic"
                name="minDomainTraffic"
                type="number"
                value={filters.minDomainTraffic}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="niches" className="block mb-2">
                Niches
              </Label>
              <MultiSelect
                options={allNiches.map((niche) => ({ label: niche, value: niche }))}
                value={filters.niches}
                onValueChange={handleNicheChange}
                placeholder="Select niches"
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
