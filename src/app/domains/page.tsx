import { Button } from "@/components/ui/button";

import { PlusIcon } from "lucide-react";
    export default function DomainsPage() {
      return (
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Domains</h1>
            <Button className="hover:bg-primary-dark transition-colors">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Domain
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
         
          </div>
        </div>
      )
    }
        