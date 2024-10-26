'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LoadingProps {
  title?: string;
  subtitle?: string;
  expectedDuration?: number;
  primaryColor?: string;
  secondaryColor?: string;
  showProgressBar?: boolean;
}

export default function Loading({
  title = "Loading Data",
  subtitle = "Please wait...",
  expectedDuration = 30000,
  primaryColor = "hsl(var(--primary))",
  showProgressBar = true,
}: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [randomLinks, setRandomLinks] = useState<number[][]>([])

  useEffect(() => {
    if (!showProgressBar) return;

    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime
      const newProgress = Math.min((elapsedTime / expectedDuration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [expectedDuration, showProgressBar])

  // Generate random links only on the client side
  useEffect(() => {
    const generateRandomLinks = () => {
      const links = [...Array(5)].map(() => {
        const isFromCentral = Math.random() > 0.5;
        const startNodeIndex = Math.floor(Math.random() * 8);
        const endNodeIndex = Math.floor(Math.random() * 8);
        return [isFromCentral, startNodeIndex, endNodeIndex];
      });
      setRandomLinks(links as number[][]);
    };

    generateRandomLinks();
  }, []); // Runs once on component mount


  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="mb-4"
      >
        {/* Network nodes */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const cx = 100 + Math.cos(angle) * 70;
          const cy = 100 + Math.sin(angle) * 70;

          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="5"
              fill={primaryColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
              }}
            />
          );
        })}

        {/* Connecting links */}
        {[...Array(8)].map((_, i) => {
          const startAngle = (i / 8) * Math.PI * 2;
          const endAngle = ((i + 1) / 8) * Math.PI * 2;
          const startX = 100 + Math.cos(startAngle) * 70;
          const startY = 100 + Math.sin(startAngle) * 70;
          const endX = 100 + Math.cos(endAngle) * 70;
          const endY = 100 + Math.sin(endAngle) * 70;

          return (
            <motion.line
              key={i}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={primaryColor}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{
                duration: 1,
                delay: i * 0.1,
              }}
            />
          );
        })}

        {/* Random links to/from nodes or central node */}
        {randomLinks.map((link, i) => {
          const [isFromCentral, startNodeIndex, endNodeIndex] = link;
          const startAngle = (startNodeIndex / 8) * Math.PI * 2;
          const endAngle = (endNodeIndex / 8) * Math.PI * 2;
          const startX = isFromCentral ? 100 : 100 + Math.cos(startAngle) * 70;
          const startY = isFromCentral ? 100 : 100 + Math.sin(startAngle) * 70;
          const endX = isFromCentral ? 100 + Math.cos(endAngle) * 70 : 100;
          const endY = isFromCentral ? 100 + Math.sin(endAngle) * 70 : 100;

          return (
            <motion.line
              key={`random-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={primaryColor}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 1.5,
                delay: i * 0.2 + 1,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: Math.random() * 2 + 1,
              }}
            />
          );
        })}

        {/* Central node */}
        <motion.circle
          cx="100"
          cy="100"
          r="8"
          fill={primaryColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
          }}
        />

        {/* Pulsating effect */}
        <motion.circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.2 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </motion.svg>
      <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      {showProgressBar && (
        <>
          <div className="w-64 h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}80`
              }}
              initial={{ width: '0%', x: '-100%' }}
              animate={{ width: `${progress}%`, x: '0%' }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {Math.round(progress)}% complete
          </p>
        </>
      )}
    </div>
  )
}
