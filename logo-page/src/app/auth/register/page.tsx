"use client";
import { motion } from "framer-motion";
import ParticleBackground from "@/shared/ParticleBackground";
import Image from "next/image";
import LegoBricks from "@/shared/LegoBricks";
import RegisterForm from "@/components/auth/RegisterForm";
export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/20 to-destructive/30 animate-gradient-shift">
      {/* Particle Background */}
      <ParticleBackground />

      <LegoBricks />

      {/* LEGO background layer */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src="/images/3-1.png"
          alt="lego background"
          fill
          className="object-cover"
        />
      </div>

      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="backdrop-blur-lg bg-card/80 p-8 rounded-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl"
        />
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="relative z-10 backdrop-blur-lg bg-yellow-200 p-8 rounded-3xl shadow-2xl border border-border w-full max-w-md mx-4"
      >
        <RegisterForm />
      </motion.div>
    </div>
  );
}
