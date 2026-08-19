import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Animated PPC logo — SVG draw-on effect inspired by CodeRabbit.
 * The logo fades in with a subtle scale animation on mount.
 */
export function AnimatedLogo({ src, alt, className = '' }: AnimatedLogoProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <img
        src={src}
        alt={alt}
        className="hero-logo-highlight h-full w-auto object-contain"
      />
    </motion.div>
  );
}

// Animated SVG logo with path draw effect.
// Use this for SVG logos that need to animate their paths on mount.

export function AnimatedSvgLogo({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.svg viewBox="0 0 120 40" className={className} initial="hidden" animate="visible">
      {children}
    </motion.svg>
  );
}

interface AnimatedPathProps {
  d: string;
  strokeWidth?: number;
  stroke?: string;
  fill?: string;
  delay?: number;
  duration?: number;
}

export function AnimatedPath({
  d,
  strokeWidth = 2,
  stroke = 'currentColor',
  fill = 'none',
  delay = 0,
  duration = 1.2,
}: AnimatedPathProps) {
  return (
    <motion.path
      d={d}
      strokeWidth={strokeWidth}
      stroke={stroke}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        hidden: {
          pathLength: 0,
          opacity: 0,
        },
        visible: {
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: {
              delay,
              duration,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              delay,
              duration: 0.3,
            },
          },
        },
      }}
    />
  );
}
