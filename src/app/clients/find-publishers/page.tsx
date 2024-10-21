"use client";

import { useState, useEffect } from "react";
import DomainSelector from "@/app/components/find-publishers/domain-selector";
import { Domain } from "@/app/types/Domains";
import { Publisher } from "@/app/types/Publisher";
import { fetchPublishers } from "@/app/actions/publisherActions";
import { DataTable } from "@/app/components/publishers/DataTable";

export default function FindPublishers() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadPublishers = async () => {
      const fetchedPublishers = await fetchPublishers();
      console.log("Fetched publishers:", fetchedPublishers);
      setPublishers(fetchedPublishers);
      setFilteredPublishers(fetchedPublishers);
    };
    loadPublishers();
  }, []);

  useEffect(() => {
    if (selectedDomain) {
      const filtered = publishers.filter((publisher) => {
        const domainRequirements = selectedDomain.seoMetricsRequirements;
        const domainNiches = selectedDomain.niches
          .split(",")
          .map((niche) => niche.trim());
        return (
          publisher.domainRating >=
            (domainRequirements?.minDomainRating || 0) &&
          publisher.domainAuthority >=
            (domainRequirements?.minDomainAuthority || 0) &&
          publisher.domainTraffic >=
            (domainRequirements?.minDomainTraffic || 0) &&
          (domainNiches.length === 0 ||
            domainNiches.some((niche) => publisher.niche.includes(niche)))
        );
      });
      setFilteredPublishers(filtered);
    } else {
      setFilteredPublishers(publishers);
    }
  }, [selectedDomain, publishers]);

  const handleDomainSelect = (domain: Domain | null) => {
    setSelectedDomain(domain);
  };

  const handleDataTableRefresh = async () => {
    const refreshedPublishers = await fetchPublishers();
    setPublishers(refreshedPublishers);
    setFilteredPublishers(refreshedPublishers);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Publishers</h1>
      <DomainSelector onSelect={handleDomainSelect} />
      <DataTable
        initialData={filteredPublishers}
        key={JSON.stringify(filteredPublishers)}
        onDataTableRefresh={handleDataTableRefresh}
      />
    </div>
  );
}
