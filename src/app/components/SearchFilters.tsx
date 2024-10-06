'use client'

import { useState, useEffect } from 'react'
import { Slider } from "@/components/ui/slider"
import { MultiSelect } from "@/components/ui/multi-select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { fetchPublishers } from '../actions/publisherActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SearchFilters({ onFilter }: { onFilter: (queryString: string) => void }) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [drRange, setDrRange] = useState([0, 100])
  const [daRange, setDaRange] = useState([0, 100])
  const [spamScoreRange, setSpamScoreRange] = useState([0, 100])
  const [trafficRange, setTrafficRange] = useState([0, 100000000])
  const [niches, setNiches] = useState<{ label: string, value: string }[]>([])
  const [maxTraffic, setMaxTraffic] = useState(100000000)
  const [isReseller, setIsReseller] = useState<boolean | null>(null);

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
      isReseller: isReseller === null ? 'all' : isReseller.toString()
    }).toString();
    onFilter(queryString)
  }, [selectedNiches, drRange, daRange, spamScoreRange, trafficRange, isReseller, onFilter])

  const handleClearFilters = () => {
    setSelectedNiches([])
    setDrRange([0, 100])
    setDaRange([0, 100])
    setSpamScoreRange([0, 100])
    setTrafficRange([0, maxTraffic])
    setIsReseller(null)
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
    <Card className="w-full mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-bold">Search Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <Label htmlFor="niche-select" className="text-xs sm:text-sm">Niches</Label>
          <MultiSelect
           id="niche-select"
           options={niches.sort((a, b) => a.label.localeCompare(b.label))}
           value={selectedNiches}
           onValueChange={setSelectedNiches}
            placeholder="Choose niches"
            className="w-full"
          />
        </div>

        <Separator />

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-4">
            <Label htmlFor="traffic-slider" className="text-xs sm:text-sm">Ahref Traffic</Label>
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

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="dr-slider" className="text-xs sm:text-sm">Domain Rating (DR): {drRange[0]} - {drRange[1]}</Label>
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
              <Label htmlFor="da-slider" className="text-xs sm:text-sm">Domain Authority (DA): {daRange[0]} - {daRange[1]}</Label>
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
              <Label htmlFor="spam-slider" className="text-xs sm:text-sm">Spam Score (SS): {spamScoreRange[0]} - {spamScoreRange[1]}</Label>
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
          </div>

          <div className="flex items-center space-x-4">
            <Label className="text-xs sm:text-sm">Is Reseller:</Label>
            <RadioGroup 
              value={isReseller === null ? 'all' : isReseller ? 'yes' : 'no'} 
              onValueChange={(value) => setIsReseller(value === 'all' ? null : value === 'yes')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-xs sm:text-sm">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="text-xs sm:text-sm">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="text-xs sm:text-sm">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleClearFilters} className="text-xs">Clear Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}