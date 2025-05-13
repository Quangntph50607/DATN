// components/LegoBricks.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LegoBricks() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => {
        // Generate stable positions using hash of index
        const left = 10 + ((i * 83) % 80);
        const top = 10 + ((i * 97) % 80);
        const hue = (i * 137) % 360;

        return (
          <motion.div
            key={i}
            className="lego-brick"
            initial={{ y: 0 }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, (i % 5) - 2.5],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              repeatType: "mirror",
            }}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              background: `hsl(${hue}deg 100% 60%)`,
            }}
          />
        );
      })}
    </div>
  );
}
