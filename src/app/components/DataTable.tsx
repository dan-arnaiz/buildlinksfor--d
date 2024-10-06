'use client'

import { useState, useEffect } from 'react'
import { Publisher } from '../types/Publisher'
import {  addPublisher, updatePublisher, deletePublisher } from '../actions/publisherActions'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { MultiSelect } from "@/components/ui/multi-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { PlusIcon, SearchIcon, Edit2Icon, Trash2Icon,  ArrowUpDown} from 'lucide-react'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel, VisibilityState } from "@tanstack/react-table"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { format } from 'date-fns'

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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Domain
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
            onError={(e) => {
              const initials = domainName.slice(0, 2).toUpperCase();
              const fallbackElement = document.createElement('div');
              fallbackElement.className = "w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold";
              fallbackElement.textContent = initials;
              e.currentTarget.parentNode?.replaceChild(fallbackElement, e.currentTarget);
            }}
          />
          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {domainName}
          </a>
        </div>
      )
    },
    enableHiding: false,
    enableSorting: true,
    sortingFn: "alphanumeric",
    sortDescFirst: false,
  },
  {
    accessorKey: "niche",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Niche
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const niches = row.getValue("niche") as string;
      return <div className="text-left">{niches.split(',').map(niche => niche.trim()).join(', ')}</div>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "domainRating",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        DR
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainRating") as number).toFixed(0)}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "domainAuthority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        DA
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainAuthority") as number).toFixed(0)}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "domainTraffic",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Traffic
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{(row.getValue("domainTraffic") as number).toLocaleString()}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "spamScore",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Spam Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("spamScore")}%</div>,
    enableSorting: true,
  },
  {
    accessorKey: "linkInsertionPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Link Insertion Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">${(row.getValue("linkInsertionPrice") as number).toLocaleString()}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "guestPostPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Guest Post Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">${(row.getValue("guestPostPrice") as number).toLocaleString()}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "linkInsertionGuidelines",
    header: "Link Insertion Guidelines",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("linkInsertionGuidelines")}>
        {row.getValue("linkInsertionGuidelines")}
      </div>
    ),
  },
  {
    accessorKey: "guestPostGuidelines",
    header: "Guest Post Guidelines",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("guestPostGuidelines")}>
        {row.getValue("guestPostGuidelines")}
      </div>
    ),
  },
  {
    accessorKey: "metricsLastUpdate",
    header: "Metrics Last Update",
    cell: ({ row }) => {
      const metricsLastUpdate = row.getValue("metricsLastUpdate");
      if (metricsLastUpdate && !isNaN(new Date(metricsLastUpdate as string).getTime())) {
        return format(new Date(metricsLastUpdate as string), 'yyyy-MM-dd');
      }
      return "N/A";
    },
  },

  {
    accessorKey: "isReseller",
    header: "Reseller",
    cell: ({ row }) => (row.getValue("isReseller") ? "Yes" : "No"),
  },
  {
    accessorKey: "contactName",
    header: "Contact Name",
    cell: ({ row }) => <div>{row.getValue("contactName")}</div>,
  },
  {
    accessorKey: "contactEmail",
    header: "Contact Email",
    cell: ({ row }) => <div>{row.getValue("contactEmail")}</div>,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("notes")}>
        {row.getValue("notes")}
      </div>
    ),
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
    enableSorting: false,
  },
]

const formSchema = z.object({
  domainName: z.string()
  .min(1, "Domain name is required")
  .transform(value => {
    // Remove http://, https://, www., and trailing slash
    return value.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  })
  .refine(
    (value) => {
      const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      return domainPattern.test(value);
    },
    "Invalid domain name format. It should be domainname.com"
  ),
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
    linkInsertionGuidelines: z.string().optional(),
    guestPostGuidelines: z.string().optional(),
    metricsLastUpdate: z.date(),
    notes: z.string().optional(),
    isReseller: z.boolean(),
    contactName: z.string().min(1, "Contact name is required"),
    contactEmail: z.string().email("Invalid email address"),
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
  const { toast } = useToast()

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
      linkInsertionGuidelines: "",
      guestPostGuidelines: "",
      metricsLastUpdate: new Date(),
      notes: "",
      isReseller: false,
      contactName: "",
      contactEmail: "",
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
      const cleanedNiches = values.niche.flatMap(niche => {
        if (niche.startsWith('[') && niche.endsWith(']')) {
          try {
            return JSON.parse(niche);
          } catch {
            return niche;
          }
        }
        return niche;
      }).filter(Boolean);

      const nicheString = Array.from(new Set(cleanedNiches)).join(',');

      const publisherData = {
        ...values,
        niche: nicheString,
      }
    
      const isDuplicate = data.some(publisher => publisher.domainName === publisherData.domainName);
      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Publisher already exists in the list",
        });
        return;
      }

      const addedPublisher = await addPublisher(publisherData)
      setData([...data, addedPublisher])
      setIsFormOpen(false)
      form.reset()
      router.refresh()
      toast({
        title: "Success",
        description: "Publisher added successfully",
      })
    } catch (error) {
      console.error('Error adding publisher:', error)
      toast({
        title: "Error",
        description: "Failed to add publisher",
      })
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
      linkInsertionGuidelines: publisher.linkInsertionGuidelines || '',
      guestPostGuidelines: publisher.guestPostGuidelines || '',
      metricsLastUpdate: new Date(publisher.metricsLastUpdate),
      notes: publisher.notes || '',
      isReseller: publisher.isReseller,
      contactName: publisher.contactName || '',
      contactEmail: publisher.contactEmail || '',
    })
    setIsFormOpen(true)
  }

  const handleUpdatePublisher = async (values: z.infer<typeof formSchema>) => {
    if (editingPublisher) {
      try {
        const cleanedNiches = values.niche.flatMap(niche => {
          if (niche.startsWith('[') && niche.endsWith(']')) {
            try {
              return JSON.parse(niche);
            } catch {
              return niche;
            }
          }
          return niche;
        }).filter(Boolean);

        const nicheString = Array.from(new Set(cleanedNiches)).join(',');

        const updatedPublisher = await updatePublisher({ 
          ...editingPublisher, 
          ...values,
          niche: nicheString
        })
        setData(data.map(p => p.id === updatedPublisher.id ? updatedPublisher : p))
        setEditingPublisher(null)
        setIsFormOpen(false)
        router.refresh()
        form.reset()
        toast({
          title: "Success",
          description: "Publisher updated successfully",
        })
      } catch (error) {
        console.error('Error updating publisher:', error)
        toast({
          title: "Error",
          description: "Failed to update publisher",
        })
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
        toast({
          title: "Success",
          description: "Publisher deleted successfully",
        })
      } catch (error) {
        console.error('Error deleting publisher:', error)
        toast({
          title: "Error",
          description: "Failed to delete publisher",
        })
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
          <div className="relative max-w-lg">
            <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 w-full min-w-[350px]"
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
                          onChange={(e) => {
                            const formattedValue = e.target.value
                              .replace(/^(https?:\/\/)?(www\.)?/, '')
                              .replace(/\/$/, '');
                            field.onChange(formattedValue);
                          }}
                          placeholder="example.com"
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
                            options={niches.map(niche => ({ label: niche, value: niche })).sort((a, b) => a.label.localeCompare(b.label))}
                            {...field}
                            onValueChange={(value) => field.onChange(value)}
                            placeholder="Select or add niches..."
                            createable={true}
                            onCreateOption={(inputValue) => {
                              const newNiche = inputValue.trim()
                              if (newNiche && !niches.includes(newNiche)) {
                                setNiches(prev => [...prev, newNiche].sort())
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
                              value={formField.value as string | number | readonly string[] | undefined}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  ))}
                         <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkInsertionGuidelines"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Link Insertion Guidelines</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestPostGuidelines"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Guest Post Guidelines</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metricsLastUpdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metrics Last Update</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} onChange={e => field.onChange(new Date(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="isReseller"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Reseller</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            defaultChecked={false}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
           
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
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
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