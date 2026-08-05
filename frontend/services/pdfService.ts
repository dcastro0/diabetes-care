import { Measurement } from "@/services/orm/entities/measurement";
import { getGlucoseLevelInfo } from "@/utils/glucoseLevels";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from "react-native";

function createHistoryHtml(measurements: Measurement[]): string {
  const tableRows = measurements
    .map((m) => {
      const levelInfo = getGlucoseLevelInfo(m.value);

      let cssColor = "black";
      switch (levelInfo.level) {
        case "bom":
          cssColor = "green";
          break;
        case "atencao":
          cssColor = "#B45309";
          break;
        case "risco":
          cssColor = "orange";
          break;
        case "alto_risco":
          cssColor = "red";
          break;
      }

      const formattedDate = m.date ? new Date(m.date).toLocaleDateString("pt-BR") : "-";
      const formattedTime = m.date ? new Date(m.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit'}) : "-";

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px;">${formattedDate}</td>
          <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px;">${formattedTime}</td>
          <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px; color: ${cssColor}; font-weight: bold;">
            ${m.value !== null && m.value !== undefined ? `${m.value} mg/dL` : "-"}
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px; color: ${cssColor};">
            ${levelInfo.label}
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px;">${m.note || ""}</td>
        </tr>
      `;
    })
    .join("");

  const styles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 20px; font-size: 10px; color: #333; }
      h1 { color: #0056b3; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
      p { font-size: 10px; color: #555; margin-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
      th { background-color: #f0f0f0; font-weight: bold; font-size: 10px; }
      td { font-size: 9px; }
      tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
  `;

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        <h1>Relatório de Glicemia</h1>
        <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Valor</th>
              <th>Nível</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export async function generateHistoryPdf(measurements: Measurement[]) {
  if (measurements.length === 0) {
    Alert.alert("Sem dados", "Não há medições registradas para gerar o relatório.");
    return;
  }

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const htmlContent = createHistoryHtml(sortedMeasurements);

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      margins: {
         top: 20,
         bottom: 20,
         left: 20,
         right: 20
       }
    });
    console.log('PDF gerado em (URI temporária):', uri);

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Compartilhamento Indisponível",
        "Não é possível compartilhar arquivos neste dispositivo.",
      );
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar Relatório de Glicemia',
      UTI: '.pdf',
    });

  } catch (error) {
    console.error("Erro ao gerar ou compartilhar PDF:", error);
    Alert.alert("Erro Inesperado", "Ocorreu um problema ao tentar gerar ou compartilhar o relatório em PDF.");
  }
}