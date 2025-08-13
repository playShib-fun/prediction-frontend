"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { BetRecord, FilterState, ProcessedBetData } from "@/lib/history-types";
import { HistoryDataProcessor } from "@/lib/history-utils";

interface ExportButtonProps {
  data: BetRecord[];
  filters: FilterState;
}

export default function ExportButton({ data, filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "json" = "csv") => {
    try {
      setIsExporting(true);
      const exportRows = HistoryDataProcessor.convertToExportData(data as ProcessedBetData[]);
      const content = format === "csv" ? HistoryDataProcessor.generateCSV(exportRows) : HistoryDataProcessor.generateJSON(exportRows);
      const blob = new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8;" : "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = HistoryDataProcessor.generateExportFilename(format, filters);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => handleExport("csv")} disabled={isExporting} className="bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700">
        <Download className="w-4 h-4 mr-2" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
      <Button onClick={() => handleExport("json")} disabled={isExporting} variant="outline" className="border-gray-700 text-gray-300">
        JSON
      </Button>
    </div>
  );
}
