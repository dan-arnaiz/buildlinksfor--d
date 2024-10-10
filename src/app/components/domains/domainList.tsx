"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon, Pencil, Trash2, Eye, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Domain } from "@/app/types/Domains";
import {
  fetchDomains,
  addDomain,
  updateDomain,
  deleteDomain,
} from "@/app/actions/domainActions";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
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
import Loading from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Domain name is required")
    .transform((value) => {
      return value.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");
    })
    .refine((value) => {
      const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      return domainPattern.test(value);
    }, "Invalid domain name format. It should be domainname.com"),
  niches: z
    .array(z.string())
    .min(1, "At least one niche is required")
    .refine(
      (value) => value.every((item) => item.trim() !== ""),
      "Empty niche values are not allowed"
    ),
  keywords: z
    .array(z.string())
    .min(1, "At least one keyword is required")
    .refine(
      (value) => value.every((item) => item.trim() !== ""),
      "Empty keyword values are not allowed"
    ),
  existingLinks: z.string().transform(
    (str) =>
      str
        .split("\n")
        .map((s) => s.trim())
        .filter((link) => {
          const urlPattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocols
              "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
              "((\\d{1,3}\\.){3}d{1,3}))" + // OR ip (v4) address
              "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
              "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
              "(\\#[-a-z\\d_]*)?$",
            "i"
          ); // fragment locator
          return !!urlPattern.test(link);
        })
        .join("\n") // Join back into a string
  ),
  seoMetricsRequirements: z.object({
    minDomainRating: z.number().min(0).max(100),
    minDomainAuthority: z.number().min(0).max(100),
    minDomainTraffic: z.number().min(0),
    otherRequirements: z.string().optional(),
  }),
});

const DomainList: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [niches, setNiches] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [selectedDomainLinks, setSelectedDomainLinks] = useState<string[]>([]);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      niches: [],
      keywords: [],
      existingLinks: "",
      seoMetricsRequirements: {
        minDomainRating: 0,
        minDomainAuthority: 0,
        minDomainTraffic: 0,
        otherRequirements: "",
      },
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const fetchedDomains = await fetchDomains();
    setDomains(fetchedDomains);

    const uniqueNiches = Array.from(
      new Set(
        fetchedDomains.flatMap((domain) =>
          domain.niches.split(",").map((n) => n.trim())
        )
      )
    );
    const uniqueKeywords = Array.from(
      new Set(
        fetchedDomains.flatMap((domain) =>
          domain.keywords.split(",").map((k) => k.trim())
        )
      )
    );

    setNiches(uniqueNiches);
    setKeywords(uniqueKeywords);
  };

  const handleOpenDialog = (domain?: Domain) => {
    setEditingDomain(domain || null);
    if (domain) {
      form.reset({
        name: domain.name,
        niches: domain.niches.split(","),
        keywords: domain.keywords.split(","),
        existingLinks: domain.existingLinks,
        seoMetricsRequirements: {
          minDomainRating: domain.seoMetricsRequirements?.minDomainRating || 0,
          minDomainAuthority:
            domain.seoMetricsRequirements?.minDomainAuthority || 0,
          minDomainTraffic:
            domain.seoMetricsRequirements?.minDomainTraffic || 0,
          otherRequirements:
            domain.seoMetricsRequirements?.otherRequirements || "",
        },
      });
    } else {
      form.reset({
        name: "",
        niches: [],
        keywords: [],
        existingLinks: "",
        seoMetricsRequirements: {
          minDomainRating: 0,
          minDomainAuthority: 0,
          minDomainTraffic: 0,
          otherRequirements: "",
        },
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDomain(null);
    form.reset();
  };

  const handleOpenDeleteDialog = (domain: Domain) => {
    setDomainToDelete(domain);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDomainToDelete(null);
  };

  const handleOpenLinksModal = (links: string) => {
    setSelectedDomainLinks(links.split("\n").map((link) => link.trim()));
    setIsLinksModalOpen(true);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const domainData = {
        ...values,
        niches: values.niches.join(","),
        keywords: values.keywords.join(","),
        seoMetricsRequirements: {
          ...values.seoMetricsRequirements,
          otherRequirements:
            values.seoMetricsRequirements.otherRequirements || "",
        },
      };

      const isDuplicate = domains.some(
        (domain) =>
          domain.name.toLowerCase() === domainData.name.toLowerCase() &&
          (!editingDomain || domain.id !== editingDomain.id)
      );

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Domain already exists in the list",
          variant: "destructive",
        });
        return;
      }

      if (editingDomain) {
        const updatedDomain = await updateDomain({
          ...editingDomain,
          ...domainData,
          seoMetricsRequirements: {
            ...domainData.seoMetricsRequirements,
            otherRequirements:
              domainData.seoMetricsRequirements.otherRequirements || "",
          },
        });
        setDomains(
          domains.map((d) => (d.id === updatedDomain.id ? updatedDomain : d))
        );
        toast({ title: "Success", description: "Domain updated successfully" });
      } else {
        const newDomain = await addDomain(domainData);
        setDomains([...domains, newDomain]);
        toast({ title: "Success", description: "Domain added successfully" });
      }
      handleCloseDialog();
      await fetchData(); // Refresh the data after adding/updating
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save domain",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (domainToDelete) {
        await deleteDomain(domainToDelete.id);
        setDomains(domains.filter((d) => d.id !== domainToDelete.id));
        toast({ title: "Success", description: "Domain deleted successfully" });
        await fetchData(); // Refresh the data after deleting
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    }
    handleCloseDeleteDialog();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Domains</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Domain
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px] md:max-w-[550px] p-6"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingDomain ? "Edit Domain" : "Add Domain"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <Card className="p-4">
                <fieldset className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter domain name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="niches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niche</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={niches.map((niche) => ({
                              label: niche,
                              value: niche,
                            }))}
                            {...field}
                            onValueChange={(value) => field.onChange(value)}
                            placeholder="Select or add niches..."
                            createable={true}
                            onCreateOption={(inputValue) => {
                              const newNiche = inputValue.trim();
                              if (newNiche && !niches.includes(newNiche)) {
                                setNiches((prev) => [...prev, newNiche].sort());
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={keywords.map((keyword) => ({
                              label: keyword,
                              value: keyword,
                            }))}
                            {...field}
                            onValueChange={(value) => field.onChange(value)}
                            placeholder="Select or add keywords..."
                            createable={true}
                            onCreateOption={(inputValue) => {
                              const newKeyword = inputValue.trim();
                              if (
                                newKeyword &&
                                !keywords.includes(newKeyword)
                              ) {
                                setKeywords((prev) =>
                                  [...prev, newKeyword].sort()
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seoMetricsRequirements"
                    render={() => (
                      <FormItem>
                        <FormLabel>SEO Metrics Requirements</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="seoMetricsRequirements.minDomainRating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Domain Rating</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="seoMetricsRequirements.minDomainAuthority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Minimum Domain Authority
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="seoMetricsRequirements.minDomainTraffic"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Domain Traffic</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="seoMetricsRequirements.otherRequirements"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Other Requirements</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="existingLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Links</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter existing links, one per line"
                            className="h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              </Card>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {editingDomain ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this domain? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isLinksModalOpen} onOpenChange={setIsLinksModalOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[550px] p-6">
          <DialogHeader>
            <DialogTitle>Existing Links</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedDomainLinks.map((link, index) => (
              <p key={index} className="mb-2 text-sm">
                {link}
              </p>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsLinksModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px] p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                Domain Name
              </TableHead>
              <TableHead className="p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                Niches
              </TableHead>
              <TableHead className="p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                Keywords
              </TableHead>
              <TableHead className="p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                SEO Metrics Requirements
              </TableHead>
              <TableHead className="p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                Existing Links
              </TableHead>

              <TableHead className="text-right p-3 font-semibold bg-gray-100 dark:bg-gray-900">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.length > 0 ? (
              domains.map((domain) => (
                <ContextMenu key={domain.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow>
                      <TableCell className="font-medium p-3">
                        <div className="flex items-center">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${domain.name}`}
                            alt="Favicon"
                            className="w-4 h-4 mr-2"
                          />
                          <a
                            href={`https://${domain.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {domain.name}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        {domain.niches.split(",").map((niche) => (
                          <p key={niche} className="mr-1">
                            {niche.trim()}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell className="p-3">
                        {domain.keywords.split(",").map((keyword) => (
                          <p key={keyword} className="mr-1">
                            {keyword.trim()}
                          </p>
                        ))}
                      </TableCell>

                      <TableCell className="p-3">
                        <div className="text-sm">
                          Min. Domain Rating ≥{" "}
                          {domain.seoMetricsRequirements?.minDomainRating}
                        </div>
                        <div className="text-sm">
                          Min. Domain Authority ≥{" "}
                          {domain.seoMetricsRequirements?.minDomainAuthority}
                        </div>
                        <div className="text-sm">
                          Min. Traffic ≥{" "}
                          {domain.seoMetricsRequirements?.minDomainTraffic}
                        </div>
                        <div className="text-sm">
                          Other Requirements:{" "}
                          {domain.seoMetricsRequirements?.otherRequirements}
                        </div>
                      </TableCell>
                      <TableCell className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenLinksModal(domain.existingLinks)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Links
                        </Button>
                      </TableCell>
                      <TableCell className="text-right p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(domain)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(domain)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleOpenDialog(domain)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleOpenDeleteDialog(domain)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleOpenLinksModal(domain.existingLinks)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Links
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center w-full  p-8">
                  <Loading
                    showProgressBar={false}
                    title="No Domains "
                    subtitle="Add a domain to get started"
                  />
                  <Button onClick={() => handleOpenDialog()}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Domain
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DomainList;
