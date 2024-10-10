'use client'

import { useState, useEffect } from 'react'
import SearchFilters from '../components/SearchFilters'
import DataTable from '../components/DataTable'
import { fetchPublishers } from '../actions/publisherActions'
import { Publisher } from '../types/Publisher'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Loading from '@/components/ui/loading'

export default function Publishers() {
  const [filterParams, setFilterParams] = useState('')
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  useEffect(() => {
    const loadPublishers = async () => {
      try {
        setLoading(true)
        const data = await fetchPublishers(refreshTrigger > 0)
        setPublishers(data)
        setFilteredPublishers(data)
      } catch (error) {
        console.error('Error fetching publishers:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPublishers()
  }, [refreshTrigger])

   const onDataTableRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  }



  useEffect(() => {
    if (filterParams) {
      const params = new URLSearchParams(filterParams)
      const niches = params.get('niches')?.split(',').filter(niche => niche.trim() !== '') || []
      const drMin = parseInt(params.get('drMin') || '0', 10)
      const drMax = parseInt(params.get('drMax') || '100', 10)
      const daMin = parseInt(params.get('daMin') || '0', 10)
      const daMax = parseInt(params.get('daMax') || '100', 10)
      const trafficLocation = params.get('trafficLocation')
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
       const matchesTrafficLocation = trafficLocation === '' || 
         (trafficLocation && publisher.trafficLocation && 
          trafficLocation.split(',').some(location => 
            publisher.trafficLocation.includes(location.trim())
          ))
        return matchesNiche && matchesDr && matchesDa && matchesSpamScore && matchesTraffic && matchesReseller && matchesMetricsLastUpdate && matchesTrafficLocation
      })
      setFilteredPublishers(filtered)
    } else {
      setFilteredPublishers(publishers)
    }
  }, [publishers, filterParams])

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Publishers</h1>
        <Button onClick={() => setIsFormOpen(true)} className="hover:bg-primary-dark transition-colors">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Publisher
        </Button>
      </div>
      <div className={`flex ${isFiltersExpanded ? 'flex-col lg:flex-row' : 'flex-col gap-1 sm:gap-1'} gap-2 sm:gap-4`}>
        <div className={`${isFiltersExpanded ? 'w-full lg:w-[300px] mt-4 flex-shrink-0' : 'w-full'}  transition-all duration-300 ease-in-out`}>
          <SearchFilters 
            onFilter={setFilterParams} 
            isExpanded={isFiltersExpanded}
            setIsExpanded={setIsFiltersExpanded}
          />
        </div>
        <div className={`w-full overflow-x-auto ${isFiltersExpanded ? '' : 'mt-0'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <Loading />
            </div>
          ) : (
            <DataTable initialData={filteredPublishers} key={JSON.stringify(filteredPublishers)} isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen}  onDataTableRefresh={onDataTableRefresh} />
          )}
        </div>
      </div>
    </div>
  )
}