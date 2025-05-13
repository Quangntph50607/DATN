// // src/components/ui/lego-button.tsx
// "use client";
// import { motion, MotionProps } from "framer-motion";
// import { ButtonProps } from "../components/type/button-types";
// import { forwardRef } from "react";
// import { Loader2 } from "lucide-react";

// export const LegoButton = forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       children,
//       className = "",
//       variant = "lego-primary",
//       size = "default",
//       isLoading = false,
//       leftIcon,
//       rightIcon,
//       brickEffect = true,
//       shadowColor = "oklch(var(--primary)/0.3)",
//       ...props
//     },
//     ref
//   ) => {
//     // Filter motion props
//     const { whileHover, whileTap, ...restProps } = props as MotionProps;

//     const variantStyles = {
//       "lego-primary": `bg-gradient-to-br from-primary to-primary/80 text-white`,
//       "lego-accent": `bg-gradient-to-br from-accent to-accent/80 text-white`,
//       "lego-destructive": `bg-gradient-to-br from-destructive to-destructive/80 text-white`,
//       outline: `border-2 border-primary bg-transparent text-primary`,
//       ghost: `bg-transparent text-primary hover:bg-primary/10`,
//     };

//     const sizeStyles = {
//       sm: `px-4 py-2 text-sm`,
//       default: `px-6 py-3 text-base`,
//       lg: `px-8 py-4 text-lg`,
//       xl: `px-10 py-5 text-xl`,
//     };

//     return (
//       <motion.button
//         ref={ref}
//         whileHover={
//           brickEffect
//             ? {
//                 y: -2,
//                 boxShadow: `0 4px 8px ${shadowColor}`,
//               }
//             : whileHover
//         }
//         whileTap={
//           brickEffect
//             ? {
//                 scale: 0.98,
//                 boxShadow: `0 2px 4px ${shadowColor}`,
//               }
//             : whileTap
//         }
//         className={`
//           relative font-bold rounded-lg overflow-hidden
//           transition-all duration-200
//           ${variantStyles[variant]}
//           ${sizeStyles[size]}
//           ${className}
//         `}
//         {...restProps}
//       >
//         {brickEffect && (
//           <div className="absolute inset-0 lego-brick-effect"></div>
//         )}

//         <span className="relative z-10 flex items-center justify-center gap-2">
//           {isLoading ? (
//             <Loader2 className="animate-spin" />
//           ) : (
//             <>
//               {leftIcon && <span className="mr-2">{leftIcon}</span>}
//               {children}
//               {rightIcon && <span className="ml-2">{rightIcon}</span>}
//             </>
//           )}
//         </span>
//       </motion.button>
//     );
//   }
// );

// LegoButton.displayName = "LegoButton";
