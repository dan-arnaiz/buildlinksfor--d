"use client";

import Loading from "@/components/ui/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loading
        title="Page not found"
        subtitle="The page you are looking for does not exist."
        showProgressBar={false}
      />
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="mr-4 transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/">Go Back</Link>
        </Button>
      </motion.div>
    </div>
  );
}
