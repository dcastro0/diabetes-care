// utils/glucoseLevels.ts

export type GlucoseLevel = "bom" | "atencao" | "risco" | "alto_risco" | "desconhecido";

interface LevelInfo {
  level: GlucoseLevel;
  colorClass: string; // Tailwind color class (text color)
  bgColorClass: string; // Tailwind color class (background color for indicator)
  label: string;
}

export function getGlucoseLevelInfo(value: number | null | undefined): LevelInfo {
  if (value === null || value === undefined || isNaN(value)) {
    return { level: "desconhecido", colorClass: "text-slate-500", bgColorClass: "bg-slate-200", label: "Inválido" };
  }

  if (value >= 70 && value <= 140) {
    return { level: "bom", colorClass: "text-green-600", bgColorClass: "bg-green-100", label: "Bom" };
  } else if ((value >= 141 && value <= 180) || (value >= 60 && value <= 69)) {
    return { level: "atencao", colorClass: "text-yellow-600", bgColorClass: "bg-yellow-100", label: "Atenção" };
  } else if ((value >= 181 && value <= 250) || (value >= 50 && value <= 59)) {
    return { level: "risco", colorClass: "text-orange-600", bgColorClass: "bg-orange-100", label: "Risco" };
  } else { // value > 250 or value < 50
    return { level: "alto_risco", colorClass: "text-red-600", bgColorClass: "bg-red-100", label: "Alto Risco" };
  }
}