'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MultiSelect } from "@/components/ui/multi-select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const niches = [
  { label: "Technology", value: "technology" },
  { label: "Health", value: "health" },
  { label: "Business", value: "business" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Travel", value: "travel" }
]

export default function SearchFilters({ onFilter }: { onFilter: (queryString: string) => void }) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [drRange, setDrRange] = useState([0, 100])
  const [daRange, setDaRange] = useState([0, 100])
  const [spamScoreRange, setSpamScoreRange] = useState([0, 100])

  const handleFilter = () => {
    const queryString = new URLSearchParams({
      niches: selectedNiches.join(','),
      drMin: drRange[0].toString(),
      drMax: drRange[1].toString(),
      daMin: daRange[0].toString(),
      daMax: daRange[1].toString(),
      spamScoreMin: spamScoreRange[0].toString(),
      spamScoreMax: spamScoreRange[1].toString()
    }).toString();
    onFilter(queryString)
  }

  const handleNicheChange = (selectedValues: string[]) => {
    setSelectedNiches(selectedValues)
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Search Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="niche-select" className="text-sm sm:text-base">Niches</Label>
          <MultiSelect
            id="niche-select"
            options={niches}
            value={selectedNiches}
            onValueChange={handleNicheChange}
            placeholder="Choose niches"
            className="w-full"
          />
        </div>

        <Separator />

        <div className="space-y-8">
          <div className="space-y-4">
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

          <div className="space-y-4">
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

          <div className="space-y-4">
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

        <Button onClick={handleFilter} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}