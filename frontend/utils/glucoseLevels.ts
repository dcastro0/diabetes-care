export type GlucoseLevel =
  | "bom"
  | "atencao"
  | "risco"
  | "alto_risco"
  | "desconhecido";

export interface GlucoseTarget {
  min: number;
  max: number;
}

export const UNIVERSAL_GLUCOSE_TARGET: GlucoseTarget = {
  min: 70,
  max: 180,
};

export interface LevelInfo {
  level: GlucoseLevel;
  colorClass: string;
  bgColorClass: string;
  label: string;
  feedback: string;
}

export function getGlucoseLevelInfo(
  value: number | null | undefined,
  target: GlucoseTarget = UNIVERSAL_GLUCOSE_TARGET,
): LevelInfo {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      level: "desconhecido",
      colorClass: "text-slate-500",
      bgColorClass: "bg-slate-200",
      label: "Inválido",
      feedback: "Valor inválido informado.",
    };
  }

  const min = target.min > 0 ? target.min : UNIVERSAL_GLUCOSE_TARGET.min;
  const max = target.max > min ? target.max : UNIVERSAL_GLUCOSE_TARGET.max;

  if (value >= min && value <= max) {
    return {
      level: "bom",
      colorClass: "text-green-600",
      bgColorClass: "bg-green-100",
      label: "Na Meta",
      feedback: `Excelente! Sua glicemia está dentro da faixa alvo (${min}–${max} mg/dL).`,
    };
  }

  const lowAttentionMin = Math.max(55, min - 15);
  const highAttentionMax = max + 40;

  if (
    (value > max && value <= highAttentionMax) ||
    (value >= lowAttentionMin && value < min)
  ) {
    return {
      level: "atencao",
      colorClass: "text-yellow-600",
      bgColorClass: "bg-yellow-100",
      label: "Atenção",
      feedback:
        value < min
          ? "Leitura ligeiramente abaixo da meta. Fique atento aos sintomas e siga seu plano de cuidado."
          : "Leitura ligeiramente acima da meta. Hidrate-se e acompanhe na próxima medição.",
    };
  }

  const highRiskMax = max + 90;
  if ((value > highAttentionMax && value <= highRiskMax) || (value >= 50 && value < lowAttentionMin)) {
    return {
      level: "risco",
      colorClass: "text-orange-600",
      bgColorClass: "bg-orange-100",
      label: "Risco",
      feedback:
        value < min
          ? "Atenção à hipoglicemia! Consuma carboidratos de rápida absorção se necessário e monitore em 15 minutos."
          : "Glicemia elevada. Beba água e siga as orientações da sua equipe de saúde.",
    };
  }

  return {
    level: "alto_risco",
    colorClass: "text-red-600",
    bgColorClass: "bg-red-100",
    label: "Alto Risco",
    feedback:
      value < 50
        ? "Hipoglicemia severa! Trate imediatamente conforme orientação médica e peça ajuda se sentir sintomas."
        : "Hiperglicemia acentuada. Mantenha a hidratação e siga o protocolo orientado pelo seu médico.",
  };
}
