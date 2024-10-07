"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DomainsPage() {
  const [domains, setDomains] = useState([
    { id: 1, name: 'example.com', status: 'Active' },
    { id: 2, name: 'test.org', status: 'Pending' },
  ])
  const [newDomain, setNewDomain] = useState('')

  const addDomain = () => {
    if (newDomain) {
      setDomains([...domains, { id: domains.length + 1, name: newDomain, status: 'Pending' }])
      setNewDomain('')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manage Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter new domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <Button onClick={addDomain}>Add Domain</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell>{domain.name}</TableCell>
                  <TableCell>{domain.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
