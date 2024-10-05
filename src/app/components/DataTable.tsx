'use client'

import { Publisher } from '../types/Publisher'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import PublisherForm from './PublisherForm'
import { addPublisher, updatePublisher, deletePublisher } from '../actions/publisherActions'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define your columns
const columns: ColumnDef<Publisher>[] = [
  {
    accessorKey: "domainName",
    header: "Domain Name",
  },
  {
    accessorKey: "niche",
    header: "Niche",
  },
  {
    accessorKey: "domainRating",
    header: "DR",
  },
  {
    accessorKey: "domainAuthority",
    header: "DA",
  },
  {
    accessorKey: "domainTraffic",
    header: "Traffic",
  },
  {
    accessorKey: "spamScore",
    header: "Spam Score",
  },
  {
    accessorKey: "linkInsertionPrice",
    header: "Link Insertion Price",
  },
  {
    accessorKey: "guestPostPrice",
    header: "Guest Post Price",
  },
]

const formSchema = z.object({
  domainName: z.string().min(1, "Domain name is required"),
  niche: z.string().min(1, "Niche is required"),
  domainRating: z.number().min(0).max(100),
  domainAuthority: z.number().min(0).max(100),
  domainTraffic: z.number().min(0),
  spamScore: z.number().min(0).max(100),
  linkInsertionPrice: z.number().min(0),
  guestPostPrice: z.number().min(0),
})

export function DataTable({ initialData, filterParams }: { initialData: Publisher[], filterParams: string }) {
  const [data, setData] = useState<Publisher[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainName: "",
      niche: "",
      domainRating: 0,
      domainAuthority: 0,
      domainTraffic: 0,
      spamScore: 0,
      linkInsertionPrice: 0,
      guestPostPrice: 0,
    },
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
    },
  })

  useEffect(() => {
    table.getColumn("domainName")?.setFilterValue(filterParams)
  }, [filterParams, table])

  const handleAddPublisher = async (values: z.infer<typeof formSchema>) => {
    const addedPublisher = await addPublisher(values)
    setData([...data, addedPublisher])
    setIsFormOpen(false)
  }

  const handleEditPublisher = async (values: z.infer<typeof formSchema>) => {
    if (editingPublisher) {
      const updatedPublisher = { ...editingPublisher, ...values }
      const result = await updatePublisher(updatedPublisher)
      setData(data.map(p => p.id === result.id ? result : p))
      setEditingPublisher(null)
      setIsFormOpen(false)
    }
  }

  const handleDeletePublisher = async (id: string) => {
    const result = await deletePublisher(id)
    if (result) {
      setData(data.filter(p => p.id !== id))
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPublisher(null)
    form.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPublisher(null)
              form.reset()
            }} className="bg-primary text-white hover:bg-primary-dark transition-colors">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Publisher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] md:max-w-[700px] p-6" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">{editingPublisher ? 'Edit Publisher' : 'Add Publisher'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingPublisher ? handleEditPublisher : handleAddPublisher)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {columns.map((column) => (
                    <FormField
                      key={column.accessorKey as string}
                      control={form.control}
                      name={column.accessorKey as keyof z.infer<typeof formSchema>}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{column.header as string}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type={typeof field.value === 'number' ? 'number' : 'text'}
                              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-white hover:bg-primary-dark transition-colors px-6 py-2 rounded-md">
                    {editingPublisher ? 'Update' : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center py-2">
        <DropdownMenu>
          {/* ... existing DropdownMenu code ... */}
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button onClick={() => {
                      setEditingPublisher(row.original)
                      form.reset(row.original)
                      setIsFormOpen(true)
                    }}>Edit</Button>
                    <Button onClick={() => handleDeletePublisher(row.original.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default DataTable