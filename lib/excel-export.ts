import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface MemberExportRecord {
    Name: string;
    Role: string;
    Category?: string;
    Email?: string;
    Bio_Or_Message: string;
    LinkedIn?: string;
    GitHub?: string;
    Is_Leadership?: string;
    Display_Order?: number | string;
    Photo_URL?: string;
    Joined_Or_Created_At?: string;
}

/**
 * Generates and downloads a beautifully formatted Excel (.xlsx) file
 * with auto-sized column widths and multi-line bio / statement text.
 */
export function exportMembersToExcel(
    data: MemberExportRecord[],
    fileName = "AiRA_Lab_Members.xlsx"
) {
    if (!data || data.length === 0) {
        throw new Error("No member data available to export");
    }

    // 1. Create worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Auto-fit column widths based on longest cell content
    const colKeys = Object.keys(data[0] || {}) as (keyof MemberExportRecord)[];
    const colWidths = colKeys.map((key) => {
        let maxLen = key.length;
        data.forEach((row) => {
            const val = row[key];
            if (val !== undefined && val !== null) {
                const lines = String(val).split("\n");
                lines.forEach((line) => {
                    if (line.length > maxLen) {
                        maxLen = Math.min(line.length, 60); // Cap at 60 for long bios
                    }
                });
            }
        });
        return { wch: Math.max(maxLen + 4, 14) };
    });

    worksheet["!cols"] = colWidths;

    // 3. Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members & Profiles");

    // 4. Generate binary buffer and trigger download via file-saver
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, fileName);
}
