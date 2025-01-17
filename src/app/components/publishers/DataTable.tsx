"use client";

import { getFaviconUrl, getInitials } from "@/app/utils/domainUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
  Cell,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Edit2Icon,
  Eye,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  addPublisher,
  deletePublisher,
  fetchPublishers,
  updatePublisher,
} from "../../actions/publisherActions";
import { currencies } from "../../api/publishers/currencies";
import { formSchema, Publisher } from "../../types/Publisher";

function extractDomainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(fullUrl).hostname;
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return url;
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

type Action = {
  icon: React.ReactNode;
  label: string;
  onClick: (publisher: Publisher) => void;
};

export function DataTable({
  initialData,
  isFormOpen,
  setIsFormOpen,
  onDataTableRefresh,
  disableContextMenu = false,
  showActions = true,
  actions = [],
}: {
  initialData: Publisher[];
  isFormOpen?: boolean;
  setIsFormOpen?: (isFormOpen: boolean) => void;
  onDataTableRefresh?: () => void;
  disableContextMenu?: boolean;
  showActions?: boolean;
  actions?: Action[];
}) {
  const [data, setData] = useState<Publisher[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainName: "",
      niche: [],
      domainRating: 0,
      domainAuthority: 0,
      domainTraffic: 0,
      trafficLocation: "",
      spamScore: 0,
      linkInsertionPrice: 0,
      guestPostPrice: 0,
      currency: "",
      linkInsertionGuidelines: "",
      guestPostGuidelines: "",
      metricsLastUpdate: new Date(),
      notes: "",
      isReseller: false,
      acceptsGreyNiche: false,
      contactName: "",
      contactEmail: "",
    },
  });

  const columns: ColumnDef<Publisher>[] = [
    {
      id: "faviconAndDomain",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[250px] justify-start"
        >
          Domain
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      accessorFn: (row: Publisher & { url?: string }) =>
        row.domainName || row.url || "",
      cell: ({ row }) => {
        const value = row.getValue("faviconAndDomain") as string;
        const domainName = extractDomainFromUrl(value);
        const faviconUrl = getFaviconUrl(domainName);
        const url = isValidUrl(value) ? value : `https://${domainName}`;

        return (
          <div className="flex items-center">
            <div className="w-4 h-4 mr-1 flex items-center justify-center bg-gray-200 rounded-full text-xs font-bold overflow-hidden">
              <Image
                src={faviconUrl}
                alt={`${domainName} favicon`}
                width={16}
                height={16}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  const parentElement = e.currentTarget.parentElement;
                  if (parentElement) {
                    parentElement.innerHTML = getInitials(domainName);
                  }
                }}
              />
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline ml-2"
            >
              {domainName}
            </a>
          </div>
        );
      },
      enableHiding: false,
      enableSorting: true,
      sortingFn: "alphanumeric",
      sortDescFirst: false,
    },
    {
      accessorKey: "niche",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[120px] justify-start"
        >
          Niche
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => {
        const niches = row.getValue("niche") as string;
        return (
          <div className="text-left">
            {niches
              .split(",")
              .map((niche) => niche.trim())
              .join(", ")}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "domainRating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[80px]"
        >
          DR
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("domainRating") as number).toFixed(0)}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "domainAuthority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[80px]"
        >
          DA
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("domainAuthority") as number).toFixed(0)}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "domainTraffic",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[120px]"
        >
          Traffic
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("domainTraffic") as number).toLocaleString()}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "trafficLocation",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[120px] flex items-center justify-between"
        >
          Traffic Location
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("trafficLocation")}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "spamScore",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[120px]"
        >
          Spam Score
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("spamScore")}%</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "linkInsertionPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[180px]"
        >
          Link Insertion Price
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.currency || ""}
          {(row.getValue("linkInsertionPrice") as number).toLocaleString()}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "guestPostPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[160px]"
        >
          Guest Post Price
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.currency || ""}
          {(row.getValue("guestPostPrice") as number).toLocaleString()}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "linkInsertionGuidelines",
      header: () => (
        <Button variant="ghost" className="w-[200px]">
          Link Insertion Guidelines
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("linkInsertionGuidelines")}
        >
          {row.getValue("linkInsertionGuidelines")}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "guestPostGuidelines",
      header: () => (
        <Button variant="ghost" className="w-[200px]">
          Guest Post Guidelines
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("guestPostGuidelines")}
        >
          {row.getValue("guestPostGuidelines")}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "metricsLastUpdate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[160px]"
        >
          Metrics Last Update
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => {
        const metricsLastUpdate = row.getValue("metricsLastUpdate");
        if (
          metricsLastUpdate &&
          !isNaN(new Date(metricsLastUpdate as string).getTime())
        ) {
          return (
            <div className="w-[110px] text-center">
              {format(new Date(metricsLastUpdate as string), "MMM d, yyyy")}
            </div>
          );
        }
        return <div className="max-w-[100px]">N/A</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "isReseller",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[100px]"
        >
          Reseller
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("isReseller") ? "Yes" : "No"}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "acceptsGreyNiche",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[100px]"
        >
          Accepts Grey Niche
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("acceptsGreyNiche") ? "Yes" : "No"}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "contactName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[140px]"
        >
          Contact Name
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-[110px] text-center">
          {row.getValue("contactName")}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "contactEmail",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-[180px]"
        >
          Contact Email
          {column.getIsSorted() && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-start">{row.getValue("contactEmail")}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "notes",
      header: () => (
        <Button variant="ghost" className="w-[200px]">
          Notes
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("notes")}>
          {row.getValue("notes")}
        </div>
      ),
      enableSorting: false,
    },
    ...(showActions
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: Row<Publisher> }) => {
              const publisher = row.original;
              return (
                <div className="flex items-center justify-center space-x-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="icon"
                      onClick={() => action.onClick(publisher)}
                      title={action.label}
                    >
                      {action.icon}
                    </Button>
                  ))}
                </div>
              );
            },
          },
        ]
      : []),
  ];

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
  });

  useEffect(() => {
    const uniqueNiches = Array.from(
      new Set(
        data.flatMap((publisher) =>
          publisher.niche.split(",").map((n) => n.trim())
        )
      )
    );
    setNiches(uniqueNiches);
  }, [data]);

  const handleAddPublisher = async (values: z.infer<typeof formSchema>) => {
    try {
      const cleanedNiches = values.niche
        .flatMap((niche) => {
          if (niche.startsWith("[") && niche.endsWith("]")) {
            try {
              return JSON.parse(niche);
            } catch {
              return niche;
            }
          }
          return niche;
        })
        .filter(Boolean);

      const nicheString = Array.from(new Set(cleanedNiches)).join(",");

      const publisherData = {
        ...values,
        niche: nicheString,
      };

      const isDuplicate = data.some(
        (publisher) => publisher.domainName === publisherData.domainName
      );
      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Publisher already exists in the list",
        });
        return;
      }

      const addedPublisher = await addPublisher({
        ...publisherData,
        trafficLocation: publisherData.trafficLocation || "",
        acceptsGreyNiche: publisherData.acceptsGreyNiche || false,
        currency: publisherData.currency || "",
      });
      await fetchPublishers(true);
      setData([...data, addedPublisher]);
      setIsFormOpen?.(false);
      form.reset();
      onDataTableRefresh?.();
      router.refresh();
      toast({
        title: "Success",
        description: "Publisher added successfully",
      });
    } catch (error) {
      console.error("Error adding publisher:", error);
      toast({
        title: "Error",
        description: "Failed to add publisher",
      });
    }
  };

  const handleEditPublisher = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    form.reset({
      domainName: publisher.domainName,
      niche: publisher.niche.split(",").map((n) => n.trim()),
      domainRating: publisher.domainRating,
      domainAuthority: publisher.domainAuthority,
      domainTraffic: publisher.domainTraffic,
      trafficLocation: publisher.trafficLocation || "",
      spamScore: publisher.spamScore,
      linkInsertionPrice: publisher.linkInsertionPrice,
      guestPostPrice: publisher.guestPostPrice,
      currency: publisher.currency,
      linkInsertionGuidelines: publisher.linkInsertionGuidelines || "",
      guestPostGuidelines: publisher.guestPostGuidelines || "",
      metricsLastUpdate: new Date(),
      notes: publisher.notes || "",
      isReseller: publisher.isReseller,
      acceptsGreyNiche: publisher.acceptsGreyNiche,
      contactName: publisher.contactName || "",
      contactEmail: publisher.contactEmail || "",
    });
    setIsFormOpen?.(true);
  };

  const handleUpdatePublisher = async (values: z.infer<typeof formSchema>) => {
    if (editingPublisher) {
      try {
        const cleanedNiches = values.niche
          .flatMap((niche) => {
            if (niche.startsWith("[") && niche.endsWith("]")) {
              try {
                return JSON.parse(niche);
              } catch {
                return niche;
              }
            }
            return niche;
          })
          .filter(Boolean);

        const nicheString = Array.from(new Set(cleanedNiches)).join(",");

        const isDuplicate = data.some(
          (publisher) =>
            publisher.domainName === values.domainName &&
            publisher.id !== editingPublisher.id
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "Publisher already exists in the list",
          });
          return;
        }

        const updatedPublisher = await updatePublisher({
          ...editingPublisher,
          ...values,
          trafficLocation: values.trafficLocation || "",
          currency: values.currency || "",

          niche: nicheString,
        });
        setData(
          data.map((p) => (p.id === updatedPublisher.id ? updatedPublisher : p))
        );
        setEditingPublisher(null);
        setIsFormOpen?.(false);
        router.refresh();
        onDataTableRefresh?.();
        form.reset();
        await fetchPublishers(true);
        toast({
          title: "Success",
          description: "Publisher updated successfully",
        });
      } catch (error) {
        console.error("Error updating publisher:", error);
        toast({
          title: "Error",
          description: "Failed to update publisher",
        });
      }
    }
  };

  const handleDeletePublisher = async () => {
    if (publisherToDelete) {
      try {
        await deletePublisher(publisherToDelete.id);
        setData(data.filter((p) => p.id !== publisherToDelete.id));
        setPublisherToDelete(null);
        router.refresh();
        await fetchPublishers(true);
        onDataTableRefresh?.();
        toast({
          title: "Success",
          description: "Publisher deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting publisher:", error);
        toast({
          title: "Error",
          description: "Failed to delete publisher",
        });
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen?.(false);
    setEditingPublisher(null);
    form.reset();
  };

  const handleViewPublisher = (publisher: Publisher) => {
    // Implement view logic here
    console.log("Viewing publisher:", publisher);
    // You might want to open a modal or navigate to a details page
  };

  // Helper function to render table row
  const renderTableRow = (row: Row<Publisher>) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell: Cell<Publisher, unknown>) => (
        <TableCell
          key={cell.id}
          className={`px-4 py-3 ${
            cell.column.id === "actions"
              ? "sticky right-0 bg-background shadow-sm z-10"
              : ""
          }`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div>
      <div className="flex flex-col items-end mb-2">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent
            className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1200px] p-6 h-[80vh] flex flex-col"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">
                {editingPublisher ? "Edit Publisher" : "Add Publisher"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  editingPublisher ? handleUpdatePublisher : handleAddPublisher
                )}
                className="flex flex-col h-[calc(97%-2rem)]"
              >
                <div className="flex-grow overflow-y-auto pr-4 mb-4">
                  <Card className="p-4 mb-4">
                    <fieldset className="border p-4 rounded-md">
                      <legend className="text-lg font-semibold mb-2">
                        Domain Information
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="domainName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Domain Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                                  onChange={(e) => {
                                    const formattedValue = e.target.value
                                      .replace(/^(https?:\/\/)?(www\.)?/, "")
                                      .replace(/\/$/, "");
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
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Niche
                              </FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={niches
                                    .map((niche) => ({
                                      label: niche,
                                      value: niche,
                                    }))
                                    .sort((a, b) =>
                                      a.label.localeCompare(b.label)
                                    )}
                                  {...field}
                                  onValueChange={(value) =>
                                    field.onChange(value)
                                  }
                                  placeholder="Select or add niches..."
                                  createable={true}
                                  onCreateOption={(inputValue) => {
                                    const newNiche = inputValue.trim();
                                    if (
                                      newNiche &&
                                      !niches.includes(newNiche)
                                    ) {
                                      setNiches((prev) =>
                                        [...prev, newNiche].sort()
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </fieldset>
                  </Card>
                  <Card className="p-4 mb-4">
                    <fieldset className="border p-4 rounded-md">
                      <legend className="text-lg font-semibold mb-2">
                        Metrics
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            id: "domainRating",
                            header: "Domain Rating",
                            placeholder: "Enter domain rating",
                          },
                          {
                            id: "domainAuthority",
                            header: "Domain Authority",
                            placeholder: "Enter domain authority",
                          },
                          {
                            id: "domainTraffic",
                            header: "Domain Traffic",
                            placeholder: "Enter domain traffic",
                          },
                          {
                            id: "spamScore",
                            header: "Spam Score",
                            placeholder: "Enter spam score",
                          },
                          {
                            id: "trafficLocation",
                            header: "Traffic Location",
                            placeholder: "US, UK, EU, etc.",
                          },
                        ].map((field) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={field.id as keyof z.infer<typeof formSchema>}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {field.header}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...formField}
                                    type={
                                      field.id === "trafficLocation"
                                        ? "text"
                                        : "number"
                                    }
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                                    value={
                                      formField.value as
                                        | string
                                        | number
                                        | readonly string[]
                                        | undefined
                                    }
                                    placeholder={field.placeholder}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs text-red-500" />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </Card>
                  <Card className="p-4 mb-4">
                    <fieldset className="border p-4 rounded-md">
                      <legend className="text-lg font-semibold mb-2">
                        Pricing and Guidelines
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem className="col-span-full">
                              <FormLabel className="text-sm font-medium">
                                Currency
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    {/* Show placeholder only when no currency is selected */}
                                    <SelectValue placeholder="Select currency">
                                      {field.value || "Select currency"}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currencies.map((currency) => (
                                    <SelectItem
                                      key={currency.code}
                                      value={currency.symbol}
                                    >
                                      {currency.symbol}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="guestPostPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Guest Post Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                                  placeholder="Enter guest post price"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="linkInsertionPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Link Insertion Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
                                  placeholder="Enter link insertion price"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
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
                                <Textarea
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder="Enter guest post guidelines"
                                />
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
                                <Textarea
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder="Enter link insertion guidelines"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </fieldset>
                  </Card>
                  <Card className="p-4 mb-4">
                    <fieldset className="border p-4 rounded-md">
                      <legend className="text-lg font-semibold mb-2">
                        Contact Information
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Smith" />
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
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="john.smith@email.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </fieldset>
                  </Card>
                  <Card className="p-4">
                    <fieldset className="border p-4 rounded-md">
                      <legend className="text-lg font-semibold mb-2">
                        Additional Options
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isReseller"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Reseller
                                </FormLabel>
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
                          name="acceptsGreyNiche"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Accepts Grey Niche
                                </FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  defaultChecked={false}
                                />
                              </FormControl>
                              <FormMessage />
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
                                <Textarea
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder="Add any additional notes or comments here. For resellers, please specify the lead source (e.g., Slack, referral, etc.)"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </fieldset>
                  </Card>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="transition-colors px-6 py-2 rounded-md"
                    disabled={form.formState.isSubmitting}
                  >
                    {editingPublisher ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <div className="w-full flex justify-between items-center mt-4">
          <div className="relative max-w-lg">
            <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 w-full min-w-[350px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:flex">
              <Button variant="outline">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM3 5C3.01671 5 3.03323 4.99918 3.04952 4.99758C3.28022 6.1399 4.28967 7 5.5 7C6.71033 7 7.71978 6.1399 7.95048 4.99758C7.96677 4.99918 7.98329 5 8 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H8C7.98329 4 7.96677 4.00082 7.95048 4.00242C7.71978 2.86009 8.28967 2 9.5 2C10.7103 2 11.7198 2.86009 11.9505 4.00242C11.9668 4.00082 11.9833 5 12 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H12C11.9833 4 11.9668 4.00082 11.9505 4.00242C11.7198 5.14473 10.7103 6 9.5 6C8.28967 6 7.28022 5.14473 7.04952 4.00242C7.03323 4.00082 7.01671 4 7 4H1.5C1.22386 4 1 4.22386 1 4.5C1 4.77614 1.22386 5 1.5 5H3ZM11.9505 10.9976C11.7198 12.1399 10.7103 13 9.5 13C8.28967 13 7.28022 12.1399 7.04952 10.9976C7.03323 10.9992 7.01671 11 7 11H1.5C1.22386 11 1 10.7761 1 10.5C1 10.2239 1.22386 10 1.5 10H7C7.98339 10 7.96677 10.0008 7.95048 10.0024C7.71978 8.8601 8.28967 8 9.5 8C10.7103 8 11.7198 8.8601 11.9505 10.0024C11.9668 10.0008 11.9833 10 12 10H13.5C13.7761 10 14 10.2239 14 10.5C14 10.7761 13.7761 11 13.5 11H12C11.9833 11 11.9668 10.9992 11.9505 10.9976ZM8 10.5C8 9.67157 8.67157 9 9.5 9C10.3284 9 11 9.67157 11 10.5C11 11.3284 10.3284 12 9.5 12C8.67157 12 8 11.3284 8 10.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // Don't render the checkbox item for the actions column if showActions is false
                  if (!showActions && column.id === "actions") {
                    return null;
                  }
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id
                        .split(/(?=[A-Z])/)
                        .join(" ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 ${
                      header.id === "actions"
                        ? "sticky right-0 bg-background shadow-sm z-10"
                        : ""
                    }`}
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
              table.getRowModel().rows.map((row) =>
                disableContextMenu ? (
                  renderTableRow(row)
                ) : (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      {renderTableRow(row)}
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-auto">
                      <ContextMenuItem
                        onClick={() => handleViewPublisher(row.original)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleEditPublisher(row.original)}
                      >
                        <Edit2Icon className="mr-2 h-4 w-4" />
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => setPublisherToDelete(row.original)}
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <SearchXIcon className="mr-2 h-4 w-4" />
                    <span className="text-xs font-medium">
                      No Publishers Found
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-4 sm:space-y-0">
        <p className="text-sm text-gray-500 italic text-center sm:text-left">
          Note: Metrics data may not be up to date. Please double-check.
        </p>
        <div className="flex items-center space-x-2">
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
      <AlertDialog
        open={!!publisherToDelete}
        onOpenChange={(isOpen) => !isOpen && setPublisherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this publisher?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              publisher from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePublisher}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DataTable;
