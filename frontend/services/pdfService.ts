import { Measurement } from "@/services/orm/entities/measurement";
import { getGlucoseLevelInfo } from "@/utils/glucoseLevels";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from "react-native";

export function generateHistoryHtml(measurements: Measurement[]): string {
  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const total = sorted.length;
  const values = sorted.map((m) => m.value).filter((v) => v !== null && v !== undefined);
  const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;

  const inRangeCount = sorted.filter((m) => {
    const info = getGlucoseLevelInfo(m.value);
    return info.level === "bom";
  }).length;
  const inRangePercent = total > 0 ? Math.round((inRangeCount / total) * 100) : 0;

  const tableRowsHtml = sorted
    .map((m, index) => {
      const levelInfo = getGlucoseLevelInfo(m.value);

      let badgeBg = "#DCFCE7";
      let badgeText = "#15803D";
      let badgeBorder = "#86EFAC";

      if (levelInfo.level === "atencao") {
        badgeBg = "#FEF3C7";
        badgeText = "#B45309";
        badgeBorder = "#FDE68A";
      } else if (levelInfo.level === "risco") {
        badgeBg = "#FFEDD5";
        badgeText = "#C2410C";
        badgeBorder = "#FDBA74";
      } else if (levelInfo.level === "alto_risco") {
        badgeBg = "#FEE2E2";
        badgeText = "#B91C1C";
        badgeBorder = "#FCA5A5";
      }

      const dateObj = m.date ? new Date(m.date) : new Date();
      const formattedDate = dateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const rowBg = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";

      return `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 10px 12px; font-weight: 500; color: #334155; border-bottom: 1px solid #E2E8F0;">
            ${formattedDate} <span style="color: #94A3B8; font-size: 11px; margin-left: 4px;">${formattedTime}</span>
          </td>
          <td style="padding: 10px 12px; font-weight: 700; color: #0F172A; font-size: 14px; border-bottom: 1px solid #E2E8F0;">
            ${m.value} <span style="font-size: 11px; font-weight: 500; color: #64748B;">mg/dL</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background-color: ${badgeBg}; color: ${badgeText}; border: 1px solid ${badgeBorder};">
              ${levelInfo.label}
            </span>
          </td>
          <td style="padding: 10px 12px; color: #475569; font-size: 12px; border-bottom: 1px solid #E2E8F0;">
            ${m.note || "<span style='color:#CBD5E1;'>—</span>"}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1E293B;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
            -webkit-print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 22px;
            font-weight: 800;
            color: #1E40AF;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #64748B;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #64748B;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .summary-card {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
          }
          .summary-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .summary-value {
            font-size: 18px;
            font-weight: 800;
            color: #0F172A;
          }
          .summary-value.primary { color: #2563EB; }
          .summary-value.success { color: #16A34A; }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background-color: #F1F5F9;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 2px solid #E2E8F0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #E2E8F0;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            border-top: 1px solid #94A3B8;
            width: 200px;
            text-align: center;
            padding-top: 4px;
            font-size: 11px;
            color: #64748B;
          }
          .disclaimer {
            font-size: 10px;
            color: #94A3B8;
            max-width: 300px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Diabetes Care</div>
            <div class="brand-subtitle">Relatório Clínico de Glicemia</div>
          </div>
          <div class="meta-info">
            <div><strong>Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Total de Registros:</strong> ${total}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Média Geral</div>
            <div class="summary-value primary">${avg} <span style="font-size:11px; font-weight:500;">mg/dL</span></div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Na Faixa Ideal</div>
            <div class="summary-value success">${inRangePercent}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Menor Valor</div>
            <div class="summary-value">${min} <span style="font-size:11px; font-weight:500;">mg/dL</span></div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Maior Valor</div>
            <div class="summary-value">${max} <span style="font-size:11px; font-weight:500;">mg/dL</span></div>
          </div>
        </div>

        <div class="section-title">Histórico Detalhado de Medições</div>
        <table>
          <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Valor (mg/dL)</th>
              <th>Classificação</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div class="disclaimer">
            Este relatório foi gerado automaticamente pelo aplicativo Diabetes Care para acompanhamento pessoal do paciente.
          </div>
          <div class="signature-box">
            Assinatura do Profissional de Saúde
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Abre a janela nativa de visualização/impressão do PDF.
 */
export async function previewHistoryPdf(measurements: Measurement[]) {
  if (measurements.length === 0) {
    Alert.alert("Sem dados", "Não há medições cadastradas para visualizar o relatório.");
    return;
  }

  const htmlContent = generateHistoryHtml(measurements);

  try {
    await Print.printAsync({
      html: htmlContent,
    });
  } catch (error) {
    console.error("Erro ao visualizar PDF:", error);
    Alert.alert("Erro", "Não foi possível abrir a pré-visualização do PDF.");
  }
}

/**
 * Gera o PDF e abre a caixa de diálogo de compartilhamento direto.
 */
export async function exportHistoryPdf(measurements: Measurement[]) {
  if (measurements.length === 0) {
    Alert.alert("Sem dados", "Não há medições registradas para exportar o relatório.");
    return;
  }

  const htmlContent = generateHistoryHtml(measurements);

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Compartilhamento Indisponível",
        "Não é possível compartilhar arquivos neste dispositivo.",
      );
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Compartilhar Relatório de Glicemia",
      UTI: ".pdf",
    });
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    Alert.alert("Erro", "Ocorreu um problema ao exportar o arquivo PDF.");
  }
}