'use client'

import { Suspense, useState } from 'react'
import SearchFilters from '../components/SearchFilters'
import DataTable from '../components/DataTable'

export default function Publishers() {
  const [filterParams, setFilterParams] = useState('')

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Publishers</h1>
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <SearchFilters onFilter={(queryString) => {
            setFilterParams(queryString)
          }} />
        </div>
        <div className="md:col-span-3">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <DataTable initialData={[]} filterParams={filterParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}