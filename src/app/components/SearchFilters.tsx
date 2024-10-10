'use client'




import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { MultiSelect } from "@/components/ui/multi-select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { fetchPublishers } from '../actions/publisherActions'

interface SearchFiltersProps {
  onFilter: (params: string) => void
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

export default function SearchFilters({ onFilter, isExpanded, setIsExpanded }: SearchFiltersProps) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [drRange, setDrRange] = useState([0, 100])
  const [daRange, setDaRange] = useState([0, 100])
  const [spamScoreRange, setSpamScoreRange] = useState([0, 100])
  const [trafficRange, setTrafficRange] = useState([0, 100000000])
  const [niches, setNiches] = useState<{ label: string, value: string }[]>([])
  const [maxTraffic, setMaxTraffic] = useState(100000000)
  const [isReseller, setIsReseller] = useState<boolean | null>(null);
  const [metricsLastUpdateRange, setMetricsLastUpdateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedTraffic, setSelectedTraffic] = useState<string[]>([])
  const [trafficOptions, setTrafficOptions] = useState<{ label: string, value: string }[]>([])

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = event.target.value ? new Date(event.target.value) : null;
    setMetricsLastUpdateRange([startDate, metricsLastUpdateRange[1]]);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = event.target.value ? new Date(event.target.value) : null;
    setMetricsLastUpdateRange([metricsLastUpdateRange[0], endDate]);
  };

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const publishers = await fetchPublishers()
        const uniqueNiches = Array.from(new Set(publishers.flatMap(publisher => publisher.niche.split(',').map(n => n.trim()))))
        setNiches(uniqueNiches.map(niche => ({ label: niche, value: niche })))
        const maxPublisherTraffic = Math.max(...publishers.map(publisher => publisher.domainTraffic))
        setMaxTraffic(maxPublisherTraffic)
        setTrafficRange([0, maxPublisherTraffic])
      } catch (error) {
        console.error('Error fetching niches:', error)
      }
    }
    fetchNiches()
  }, [])
  useEffect(() => {
    const fetchTrafficOptions = async () => {
      try {
        const publishers = await fetchPublishers();
        const uniqueTrafficValues = Array.from(new Set(publishers.map(publisher => publisher.trafficLocation)));
        setTrafficOptions(uniqueTrafficValues.map(traffic => ({ label: traffic, value: traffic })));
      } catch (error) {
        console.error('Error fetching traffic options:', error);
      }
    };
    fetchTrafficOptions();
  }, []);


  useEffect(() => {
    const queryString = new URLSearchParams({
      niches: selectedNiches.join(','),
      drMin: drRange[0].toString(),
      drMax: drRange[1].toString(),
      daMin: daRange[0].toString(),
      daMax: daRange[1].toString(),
      trafficMin: trafficRange[0].toString(),
      trafficMax: trafficRange[1].toString(),
      spamScoreMin: spamScoreRange[0].toString(),
      spamScoreMax: spamScoreRange[1].toString(),
      metricsLastUpdateStart  : metricsLastUpdateRange[0]?.toISOString() || '',
      metricsLastUpdateEnd: metricsLastUpdateRange[1]?.toISOString() || '',
      isReseller: isReseller === null ? 'all' : isReseller.toString(),
      trafficLocation: selectedTraffic.join(','),
    }).toString();
    onFilter(queryString)
  }, [selectedNiches, drRange, daRange, spamScoreRange, trafficRange, isReseller, metricsLastUpdateRange, selectedTraffic, onFilter])

  const handleClearFilters = () => {
    setSelectedNiches([])
    setDrRange([0, 100])
    setDaRange([0, 100])
    setSpamScoreRange([0, 100])
    setTrafficRange([0, maxTraffic])
    setIsReseller(null)
    setMetricsLastUpdateRange([null, null])
    setSelectedTraffic([])
    onFilter('')
  }

  const handleTrafficInputChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setTrafficRange(prev => {
        const newRange = [...prev];
        newRange[index] = numValue;
        return newRange;
      });
    }
  };

  return (
    <Collapsible 
      open={isExpanded} 
      onOpenChange={setIsExpanded} 
      className="w-full space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center">
          <span>Filters</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        <Card className="w-full mx-auto p-3 sm:p-4 lg:p-6 ">
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Content Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Content</h3>
              <div className="space-y-1">
                <Label htmlFor="niche-select" className="text-xs">Niches</Label>
                <MultiSelect
                 id="niche-select"
                 options={niches.sort((a, b) => a.label.localeCompare(b.label))}
                 value={selectedNiches}
                 onValueChange={setSelectedNiches}
                  placeholder="Choose niches"
                  className="w-full text-xs"
                />
              </div>
            </div>

            <Separator />

            {/* Traffic Filters */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between">
                  <h3 className="text-sm font-semibold">Traffic</h3>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="traffic-select" className="text-xs">Traffic Location</Label>
                  <MultiSelect
                    id="traffic-select"
                    options={trafficOptions.sort((a, b) => a.label.localeCompare(b.label))}
                    value={selectedTraffic}
                    onValueChange={setSelectedTraffic}
                    placeholder="Choose traffic locations"
                    className="w-full text-xs"
                  />
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <Label htmlFor="traffic-slider" className="text-xs">Ahref Traffic</Label>
                  <div className="flex flex-col md:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 justify-start sm:justify-end">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full">
                      <div className="flex items-center space-x-2 w-full sm:w-1/2">
                        <span className="text-xs whitespace-nowrap">Min:</span>
                        <Input
                          type="text"
                          value={trafficRange[0].toLocaleString()}
                          onChange={(e) => handleTrafficInputChange(0, e.target.value.replace(/,/g, ''))}
                          className="w-full text-xs"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-1/2">
                        <span className="text-xs whitespace-nowrap">Max:</span>
                        <Input
                          type="text"
                          value={trafficRange[1].toLocaleString()}
                          onChange={(e) => handleTrafficInputChange(1, e.target.value.replace(/,/g, ''))}
                          className="w-full text-xs"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </div>
                  <Slider
                    id="traffic-slider"
                    min={0}
                    max={maxTraffic}
                    step={1000}
                    value={trafficRange}
                    onValueChange={setTrafficRange}
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Domain Metrics Filters */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between">
                  <h3 className="text-sm font-semibold">Domain Metrics</h3>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="dr-slider" className="text-xs">Domain Rating (DR): {drRange[0]} - {drRange[1]}</Label>
                  <Slider
                    id="dr-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={drRange}
                    onValueChange={setDrRange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="da-slider" className="text-xs">Domain Authority (DA): {daRange[0]} - {daRange[1]}</Label>
                  <Slider
                    id="da-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={daRange}
                    onValueChange={setDaRange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="spam-slider" className="text-xs">Spam Score (SS): {spamScoreRange[0]} - {spamScoreRange[1]}</Label>
                  <Slider
                    id="spam-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={spamScoreRange}
                    onValueChange={setSpamScoreRange}
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Other Filters */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between">
                  <h3 className="text-sm font-semibold">Other Filters</h3>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="metrics-last-update-slider" className="text-xs">Metrics Last Update</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs whitespace-nowrap w-12">Start:</span>
                      <Input
                        type="date"
                        value={metricsLastUpdateRange[0]?.toISOString().split('T')[0] || ''}
                        onChange={handleStartDateChange}
                        className="w-full text-xs"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs whitespace-nowrap w-12">End:</span>
                      <Input
                        type="date"
                        value={metricsLastUpdateRange[1]?.toISOString().split('T')[0] || ''}
                        onChange={handleEndDateChange}
                        className="w-full text-xs"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label className="text-xs">Is Reseller:</Label>
                  <RadioGroup 
                    value={isReseller === null ? 'all' : isReseller ? 'yes' : 'no'} 
                    onValueChange={(value) => setIsReseller(value === 'all' ? null : value === 'yes')}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-xs">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="text-xs">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="text-xs">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-end pt-4">
              <Button onClick={handleClearFilters} className="text-xs">Clear Filters</Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}