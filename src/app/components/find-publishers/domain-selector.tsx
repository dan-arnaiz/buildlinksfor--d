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

interface DomainSelectorProps {
  onSelect: (domain: Domain | null) => void;
}

export default function DomainSelector({ onSelect }: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [filters, setFilters] = useState({
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
    setFilters((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleNicheChange = (selectedNiches: string[]) => {
    setFilters((prev) => ({ ...prev, niches: selectedNiches }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-4">
        <legend className="text-lg font-semibold mb-2">
          Select Client Domain
        </legend>
        <Select onValueChange={handleSelect} value={selectedDomain?.id || ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a client domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id}>
                {domain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="bg-white shadow-sm rounded-lg p-6">
        <legend className="text-lg font-semibold mb-4">SEO Metrics</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </fieldset>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <Label htmlFor="niches" className="block text-lg font-semibold mb-4">
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
  );
}
