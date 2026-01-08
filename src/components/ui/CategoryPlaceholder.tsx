"use client";

import {
  Shield,
  Landmark,
  TrendingUp,
  Eye,
  Globe,
  AlertTriangle,
  FileText
} from "lucide-react";

interface CategoryPlaceholderProps {
  category: string;
  className?: string;
}

// Category configurations with gradients and icons
const categoryConfig: Record<string, {
  gradient: string;
  icon: React.ElementType;
}> = {
  Military: {
    gradient: "from-red-950 via-midnight-800 to-midnight-900",
    icon: Shield,
  },
  Political: {
    gradient: "from-blue-950 via-midnight-800 to-midnight-900",
    icon: Landmark,
  },
  Economic: {
    gradient: "from-amber-950 via-midnight-800 to-midnight-900",
    icon: TrendingUp,
  },
  Intelligence: {
    gradient: "from-purple-950 via-midnight-800 to-midnight-900",
    icon: Eye,
  },
  Diplomatic: {
    gradient: "from-cyan-950 via-midnight-800 to-midnight-900",
    icon: Globe,
  },
  Breaking: {
    gradient: "from-red-900 via-red-950 to-midnight-900",
    icon: AlertTriangle,
  },
  Analysis: {
    gradient: "from-slate-800 via-midnight-800 to-midnight-900",
    icon: FileText,
  },
};

const defaultConfig = {
  gradient: "from-midnight-700 via-midnight-800 to-midnight-900",
  icon: FileText,
};

export default function CategoryPlaceholder({ category, className = "" }: CategoryPlaceholderProps) {
  const config = categoryConfig[category] || defaultConfig;
  const Icon = config.icon;

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center ${className}`}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Icon */}
      <Icon className="h-12 w-12 text-white/20" strokeWidth={1} />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/50 to-transparent" />
    </div>
  );
}
