'use client'

import { useState, useEffect } from 'react'
import SearchFilters from '../components/SearchFilters'
import DataTable from '../components/DataTable'
import { fetchPublishers } from '../actions/publisherActions'
import { Publisher } from '../types/Publisher'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export default function Publishers() {
  const [filterParams, setFilterParams] = useState('')
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)

  useEffect(() => {
    const loadPublishers = async () => {
      try {
        setLoading(true)
        const data = await fetchPublishers()
        setPublishers(data)
        setFilteredPublishers(data)
      } catch (error) {
        console.error('Error fetching publishers:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPublishers()
  }, [])

  useEffect(() => {
    if (filterParams) {
      const params = new URLSearchParams(filterParams)
      const niches = params.get('niches')?.split(',').filter(niche => niche.trim() !== '') || []
      const drMin = parseInt(params.get('drMin') || '0', 10)
      const drMax = parseInt(params.get('drMax') || '100', 10)
      const daMin = parseInt(params.get('daMin') || '0', 10)
      const daMax = parseInt(params.get('daMax') || '100', 10)
      const spamScoreMin = parseInt(params.get('spamScoreMin') || '0', 10)
      const spamScoreMax = parseInt(params.get('spamScoreMax') || '100', 10)
      const trafficMin = parseInt(params.get('trafficMin') || '0', 10)
      const trafficMax = parseInt(params.get('trafficMax') || '100000000', 10)
      const isReseller = params.get('isReseller')
      const metricsLastUpdateStart = params.get('metricsLastUpdateStart')
      const metricsLastUpdateEnd = params.get('metricsLastUpdateEnd')

      const filtered = publishers.filter(publisher => {
        const publisherNiches = publisher.niche.split(',').map(n => n.trim())
        const matchesNiche = niches.length === 0 || niches.some(niche => publisherNiches.includes(niche))
        const matchesDr = publisher.domainRating >= drMin && publisher.domainRating <= drMax
        const matchesDa = publisher.domainAuthority >= daMin && publisher.domainAuthority <= daMax
        const matchesSpamScore = publisher.spamScore >= spamScoreMin && publisher.spamScore <= spamScoreMax
        const matchesTraffic = publisher.domainTraffic >= trafficMin && publisher.domainTraffic <= trafficMax
        const matchesReseller = isReseller === 'all' || publisher.isReseller === (isReseller === 'true')
        const matchesMetricsLastUpdate = metricsLastUpdateStart && metricsLastUpdateEnd
          ? new Date(publisher.metricsLastUpdate) >= new Date(metricsLastUpdateStart) && new Date(publisher.metricsLastUpdate) <= new Date(metricsLastUpdateEnd)
          : true
        return matchesNiche && matchesDr && matchesDa && matchesSpamScore && matchesTraffic && matchesReseller && matchesMetricsLastUpdate
      })
      setFilteredPublishers(filtered)
    } else {
      setFilteredPublishers(publishers)
    }
  }, [publishers, filterParams])

  console.log(filterParams)

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Publishers</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-white hover:bg-primary-dark transition-colors">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Publisher
        </Button>
      </div>
      <div className={`flex ${isFiltersExpanded ? 'flex-col lg:flex-row' : 'flex-col gap-1 sm:gap-1'} gap-2 sm:gap-4`}>
        <div className={`${isFiltersExpanded ? 'w-full lg:w-[300px] mt-4' : 'w-full'}  transition-all duration-300 ease-in-out`}>
          <SearchFilters 
            onFilter={setFilterParams} 
            isExpanded={isFiltersExpanded}
            setIsExpanded={setIsFiltersExpanded}
          />
        </div>
        <div className={`w-full overflow-x-auto ${isFiltersExpanded ? '' : 'mt-4'}`}>
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="h-8 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <DataTable initialData={filteredPublishers} key={JSON.stringify(filteredPublishers)} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />
          )}
        </div>
      </div>
    </div>
  )
}