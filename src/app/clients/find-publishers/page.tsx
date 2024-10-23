"use client";

import { useState, useEffect } from "react";
import DomainSelector from "@/app/components/find-publishers/domain-selector";
import { Domain } from "@/app/types/Domains";
import { Publisher } from "@/app/types/Publisher";
import { fetchPublishers, handleBlacklist, handleGetLinks } from "@/app/actions/publisherActions";
import { DataTable } from "@/app/components/publishers/DataTable";
import Loading from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Search, List, ChevronDown, ChevronUp, LinkIcon, Link2, LucideLink, BanIcon, PlusIcon, CheckCheckIcon, XIcon } from "lucide-react";

export default function FindPublishers() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [step, setStep] = useState(1);
  const [seoMetrics, setSeoMetrics] = useState({
    minDomainRating: 0,
    minDomainAuthority: 0,
    minDomainTraffic: 0,
    niches: [] as string[],
  });
  const [isDomainSelectorCollapsed, setIsDomainSelectorCollapsed] = useState(false);

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
    if (domain) {
      setStep(2);
      setSeoMetrics({
        minDomainRating: domain.seoMetricsRequirements?.minDomainRating || 0,
        minDomainAuthority: domain.seoMetricsRequirements?.minDomainAuthority || 0,
        minDomainTraffic: domain.seoMetricsRequirements?.minDomainTraffic || 0,
        niches: domain.niches.split(",").map((niche) => niche.trim()),
      });
    }
  };

  const handleSeoMetricsChange = (newMetrics: typeof seoMetrics) => {
    setSeoMetrics(newMetrics);
    filterPublishers(newMetrics);
  };

  const filterPublishers = (metrics: typeof seoMetrics) => {
    const filtered = publishers.filter((publisher) => {
      return (
        publisher.domainRating >= metrics.minDomainRating &&
        publisher.domainAuthority >= metrics.minDomainAuthority &&
        publisher.domainTraffic >= metrics.minDomainTraffic &&
        (metrics.niches.length === 0 ||
          metrics.niches.some((niche) => publisher.niche.includes(niche)))
      );
    });
    setFilteredPublishers(filtered);
  };

  const handleDataTableRefresh = async () => {
    const refreshedPublishers = await fetchPublishers();
    setPublishers(refreshedPublishers);
    setFilteredPublishers(refreshedPublishers);
  };

  const toggleDomainSelector = () => {
    setIsDomainSelectorCollapsed(!isDomainSelectorCollapsed);
  };

  return (
    <div className="space-y-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Find Publishers</h1>
      
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 1 ? "bg-primary" : "bg-secondary"
        } text-primary-foreground`}>
          <Search size={20} />
        </div>
        <div className="flex-1 h-1 mx-2 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: step >= 2 ? '100%' : '0%' }}
          />
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 2 ? "bg-primary" : "bg-secondary"
        } text-primary-foreground`}>
          <List size={20} />
        </div>
      </div>

      {step === 1 && (
        <DomainSelector onSelect={handleDomainSelect} />
      )}

      {step === 2 && (
        <div>
          <div className="bg-card rounded-lg shadow-sm mb-8">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={toggleDomainSelector}
            >
              <h3 className="text-lg font-semibold">Domain and SEO Metrics</h3>
              {isDomainSelectorCollapsed ? 
                <ChevronDown className="text-primary" size={20} /> : 
                <ChevronUp className="text-primary" size={20} />
              }
            </div>
            {!isDomainSelectorCollapsed && (
              <div className="p-4 border-t border-border">
                <DomainSelector
                  onSelect={handleDomainSelect}
                  initialDomain={selectedDomain}
                  onSeoMetricsChange={handleSeoMetricsChange}
                  initialSeoMetrics={seoMetrics}
                />
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Matching Publishers</h2>
            {filteredPublishers.length > 0 ? (
              <DataTable
                initialData={filteredPublishers}
                key={JSON.stringify(filteredPublishers)}
                onDataTableRefresh={handleDataTableRefresh}
                disableContextMenu={true}
                showActions={true}
                actions={
                  [
                    {
                      icon: <CheckCheckIcon  className="h-4 w-4 text-primary" />,
                      label: "Approve",
                      onClick: (publisher) => handleGetLinks(publisher),                
                    },
                    {
                      icon: <XIcon className="h-4 w-4 text-destructive" />,
                      label: "Reject",
                      onClick: (publisher) => handleBlacklist(publisher),
                    }
                  ]
                }
              />
            ) : (
              <div className="bg-secondary rounded-lg p-6 text-center">
                <Loading
                  showProgressBar={false}
                  title="No Publishers Found"
                  subtitle="Try adjusting your filters or adding more publishers"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
