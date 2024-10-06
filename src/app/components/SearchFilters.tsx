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

export default function SearchFilters({ onFilter }: { onFilter: (queryString: string) => void }) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [drRange, setDrRange] = useState([0, 100])
  const [daRange, setDaRange] = useState([0, 100])
  const [spamScoreRange, setSpamScoreRange] = useState([0, 100])
  const [trafficRange, setTrafficRange] = useState([0, 100000000])
  const [niches, setNiches] = useState<{ label: string, value: string }[]>([])
  const [maxTraffic, setMaxTraffic] = useState(100000000)

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
      spamScoreMax: spamScoreRange[1].toString()
    }).toString();
    onFilter(queryString)
  }, [selectedNiches, drRange, daRange, spamScoreRange, trafficRange, onFilter])

  const handleClearFilters = () => {
    setSelectedNiches([])
    setDrRange([0, 100])
    setDaRange([0, 100])
    setSpamScoreRange([0, 100])
    setTrafficRange([0, maxTraffic])
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
        <CardTitle className="text-lg sm:text-xl font-bold">Search Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <Label htmlFor="niche-select" className="text-sm sm:text-base">Niches</Label>
          <MultiSelect
            id="niche-select"
            options={niches}
            value={selectedNiches}
            onValueChange={setSelectedNiches}
            placeholder="Choose niches"
            className="w-full"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <Label htmlFor="traffic-slider" className="text-sm sm:text-base">Ahref Traffic</Label>
          <div className="flex items-center space-x-2 justify-end">
            <span>Min:</span>
            <Input
              type="text"
              value={trafficRange[0].toLocaleString()}
              onChange={(e) => handleTrafficInputChange(0, e.target.value.replace(/,/g, ''))}
              className="w-20"
              onFocus={(e) => e.target.select()}
            />
            <span>Max:</span>
            <Input
              type="text"
              value={trafficRange[1].toLocaleString()}
              onChange={(e) => handleTrafficInputChange(1, e.target.value.replace(/,/g, ''))}
              style={{ width: `${trafficRange[1].toLocaleString().length + 2}ch`, minWidth: '8ch' }}
              onFocus={(e) => e.target.select()}
            />
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

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="dr-slider" className="text-sm sm:text-base">Domain Rating (DR): {drRange[0]} - {drRange[1]}</Label>
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

          <div className="space-y-3">
            <Label htmlFor="da-slider" className="text-sm sm:text-base">Domain Authority (DA): {daRange[0]} - {daRange[1]}</Label>
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

          <div className="space-y-3">
            <Label htmlFor="spam-slider" className="text-sm sm:text-base">Spam Score (SS): {spamScoreRange[0]} - {spamScoreRange[1]}</Label>
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
        <div className="flex justify-end pt-4">
          <Button onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </CardContent>
    </Card>
  ) }