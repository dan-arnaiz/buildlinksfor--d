'use client'

import { useState, useEffect } from 'react'
import SearchFilters from '../components/SearchFilters'
import DataTable from '../components/DataTable'
import { fetchPublishers } from '../actions/publisherActions'
import { Publisher } from '../types/Publisher'

export default function Publishers() {
  const [filterParams, setFilterParams] = useState('')
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)

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

      const filtered = publishers.filter(publisher => {
        const publisherNiches = publisher.niche.split(',').map(n => n.trim())
        const matchesNiche = niches.length === 0 || niches.some(niche => publisherNiches.includes(niche))
        const matchesDr = publisher.domainRating >= drMin && publisher.domainRating <= drMax
        const matchesDa = publisher.domainAuthority >= daMin && publisher.domainAuthority <= daMax
        const matchesSpamScore = publisher.spamScore >= spamScoreMin && publisher.spamScore <= spamScoreMax
        const matchesTraffic = publisher.domainTraffic >= trafficMin && publisher.domainTraffic <= trafficMax
        const matchesReseller = isReseller === 'all' || publisher.isReseller === (isReseller === 'true')
        return matchesNiche && matchesDr && matchesDa && matchesSpamScore && matchesTraffic && matchesReseller 
      })
      setFilteredPublishers(filtered)
    } else {
      setFilteredPublishers(publishers)
    }
  }, [publishers, filterParams])

 

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Publishers</h1>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="w-full lg:w-1/4">
          <SearchFilters onFilter={setFilterParams} />
        </div>
        <div className="w-full lg:w-3/4">
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="h-8 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <DataTable initialData={filteredPublishers} key={JSON.stringify(filteredPublishers)} />
          )}
        </div>
      </div>
    </div>
  )
}