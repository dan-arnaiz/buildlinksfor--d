'use client'

import { useState, useEffect } from 'react'
import { Publisher } from '../types/Publisher'
import {  addPublisher, updatePublisher, deletePublisher } from '../actions/publisherActions'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { MultiSelect } from "@/components/ui/multi-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { PlusIcon, SearchIcon, Edit2Icon, Trash2Icon, MoreHorizontal } from 'lucide-react'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel, VisibilityState } from "@tanstack/react-table"

function extractDomainFromUrl(url: string): string {
  if (!url) return '';
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const hostname = new URL(fullUrl).hostname
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname
  } catch {
    return url
  }
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

const columns: ColumnDef<Publisher>[] = [
  {
    id: "faviconAndDomain",
    header: "Domain",
    accessorFn: (row: Publisher & { url?: string }) => row.domainName || row.url || '',
    cell: ({ row }) => {
      const value = row.getValue("faviconAndDomain") as string
      const domainName = extractDomainFromUrl(value)
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainName)}&sz=32`
      const url = isValidUrl(value) ? value : `https://${domainName}`

      return (
        <div className="flex items-center space-x-2">
          <Image
            src={faviconUrl}
            alt={`${domainName} favicon`}
            width={16}
            height={16}
            className="mr-2"
          />
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {domainName}
          </a>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "niche",
    header: "Niche",
    cell: ({ row }) => {
      const niches = row.getValue("niche") as string;
      return <div className="text-left">{niches.split(',').map(niche => niche.trim()).join(', ')}</div>;
    },
  },
  {
    accessorKey: "domainRating",
    header: "DR",
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainRating") as number).toFixed(0)}</div>,
  },
  {
    accessorKey: "domainAuthority",
    header: "DA",
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainAuthority") as number).toFixed(0)}</div>,
  },
  {
    accessorKey: "domainTraffic",
    header: "Traffic",
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainTraffic") as number).toLocaleString()}</div>,
  },
  {
    accessorKey: "spamScore",
    header: "Spam Score",
    cell: ({ row }) => <div className="text-center">{row.getValue("spamScore")}</div>,
  },
  {
    accessorKey: "linkInsertionPrice",
    header: "Link Insertion Price",
    cell: ({ row }) => <div className="text-center">${(row.getValue("linkInsertionPrice") as number).toLocaleString()}</div>,
  },
  {
    accessorKey: "guestPostPrice",
    header: "Guest Post Price",
    cell: ({ row }) => <div className="text-center">${(row.getValue("guestPostPrice") as number).toLocaleString()}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={() => handleEditPublisher(row.original)}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDeletePublisher(row.original.id)}>
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableHiding: false,
  },
]

const formSchema = z.object({
  domainName: z.string().min(1, "Domain name is required"),
  niche: z.array(z.string())
    .min(1, "At least one niche is required")
    .refine(
      (value) => value.every(item => item.trim() !== ""),
      "Empty niche values are not allowed"
    ),
    domainRating: z.coerce.number().min(0).max(100),
    domainAuthority: z.coerce.number().min(0).max(100),
    domainTraffic: z.coerce.number().min(0),
    spamScore: z.coerce.number().min(0).max(100),
    linkInsertionPrice: z.coerce.number().min(0),
    guestPostPrice: z.coerce.number().min(0),
})

export function DataTable({ initialData }: { initialData: Publisher[] }) {
  const [data, setData] = useState<Publisher[]>(initialData)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [niches, setNiches] = useState<string[]>([])
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainName: "",
      niche: [],
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
    const uniqueNiches = Array.from(new Set(data.flatMap(publisher => publisher.niche.split(',').map(n => n.trim()))))
    setNiches(uniqueNiches)
  }, [data])

  const handleAddPublisher = async (values: z.infer<typeof formSchema>) => {
    try {
      // Clean up and flatten the niche array
      const cleanedNiches = values.niche.flatMap(niche => {
        // If the niche is a stringified array, parse it
        if (niche.startsWith('[') && niche.endsWith(']')) {
          try {
            return JSON.parse(niche);
          } catch {
            return niche;
          }
        }
        return niche;
      }).filter(Boolean); // Remove any empty strings

      // Remove duplicates and join into a string
      const nicheString = Array.from(new Set(cleanedNiches)).join(',');
      
      const publisherData = {
        ...values,
        niche: nicheString,
      }

      const addedPublisher = await addPublisher(publisherData)
      setData([...data, addedPublisher])
      setIsFormOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Error adding publisher:', error)
    }
  }

  const handleEditPublisher = (publisher: Publisher) => {
    setEditingPublisher(publisher)
    form.reset({
      domainName: publisher.domainName,
      niche: publisher.niche.split(',').map(n => n.trim()),
      domainRating: publisher.domainRating,
      domainAuthority: publisher.domainAuthority,
      domainTraffic: publisher.domainTraffic,
      spamScore: publisher.spamScore,
      linkInsertionPrice: publisher.linkInsertionPrice,
      guestPostPrice: publisher.guestPostPrice,
    })
    setIsFormOpen(true)
  }

  const handleUpdatePublisher = async (values: z.infer<typeof formSchema>) => {
    if (editingPublisher) {
      try {
        const nicheString = Array.isArray(values.niche) ? values.niche.join(',') : values.niche
        const updatedPublisher = await updatePublisher({ 
          ...editingPublisher, 
          ...values,
          niche: nicheString
        })
        setData(data.map(p => p.id === updatedPublisher.id ? updatedPublisher : p))
        setEditingPublisher(null)
        setIsFormOpen(false)
        router.refresh()
      } catch (error) {
        console.error('Error updating publisher:', error)
      }
    }
  }

  const handleDeletePublisher = async () => {
    if (publisherToDelete) {
      try {
        await deletePublisher(publisherToDelete.id)
        setData(data.filter(p => p.id !== publisherToDelete.id))
        setPublisherToDelete(null)
        router.refresh()
      } catch (error) {
        console.error('Error deleting publisher:', error)
      }
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPublisher(null)
    form.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 w-full"
            />
          </div>
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
          <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-6" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">{editingPublisher ? 'Edit Publisher' : 'Add Publisher'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingPublisher ? handleUpdatePublisher : handleAddPublisher)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="domainName"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel className="text-sm font-medium">Domain Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel className="text-sm font-medium">Niche</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={niches.map(niche => ({ label: niche, value: niche }))}
                            {...field}
                            onValueChange={(value) => field.onChange(value)}
                            placeholder="Select or add niches..."
                            createable={true}
                            onCreateOption={(inputValue) => {
                              const newNiche = inputValue.trim()
                              if (newNiche && !niches.includes(newNiche)) {
                                setNiches(prev => [...prev, newNiche])
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                  {[
                    { id: "domainRating", header: "Domain Rating" },
                    { id: "domainAuthority", header: "Domain Authority" },
                    { id: "domainTraffic", header: "Domain Traffic" },
                    { id: "spamScore", header: "Spam Score" },
                    { id: "linkInsertionPrice", header: "Link Insertion Price" },
                    { id: "guestPostPrice", header: "Guest Post Price" },
                  ].map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.id as keyof z.infer<typeof formSchema>}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{field.header}</FormLabel>
                          <FormControl>
                            <Input 
                              {...formField} 
                              type="number"
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
      <div className="flex justify-end mb-2 mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <MoreHorizontal className="h-4 w-4" />
              <span className="ml-2">View</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <div className="px-3 py-2 text-sm font-semibold">Toggle Columns</div>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="px-3 py-2 flex items-center space-x-2"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    <div className="w-4">
                      {column.getIsVisible() }
                    </div>
                    <span>{column.columnDef.header as string}</span>
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead 
                      key={header.id} 
                      className={`px-4 py-2 ${index < 2 ? 'text-left' : 'text-center'}`}
                    >
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
                      <TableCell key={cell.id} className="px-4 py-2 text-center">
                        {cell.column.id === 'actions' ? (
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPublisher(row.original)}>
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setPublisherToDelete(row.original)}>
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
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
      <AlertDialog open={!!publisherToDelete} onOpenChange={(isOpen) => !isOpen && setPublisherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this publisher?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the publisher from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePublisher}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DataTable