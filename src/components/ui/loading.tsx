'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10))
    }, 500)

    return () => clearInterval(timer)
  }, [])

  const dataFlowVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.5, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: i * 0.5, duration: 0.01 }
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center  bg-background">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="100"
        viewBox="0 0 200 100"
        className="mb-4"
      >
        <motion.path
          d="M10 50 L90 50"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          variants={dataFlowVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        />
        <motion.path
          d="M110 50 L190 50"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          variants={dataFlowVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        />
        <motion.circle
          cx="100"
          cy="50"
          r="10"
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 500, damping: 15 }}
        />
      </motion.svg>
      <h2 className="text-2xl font-bold text-primary mb-2">Loading Data</h2>
      <p className="text-sm text-muted-foreground mb-4">Please wait...</p>
      <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {progress}% complete
      </p>
    </div>
  )
}