export interface TransactionRow {
    date: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    amount: number;
    description?: string;
}

export interface ParseResult {
    success: boolean;
    data: TransactionRow[];
    errors: string[];
}

export function parseCSV(csvContent: string): ParseResult {
    const errors: string[] = [];
    const data: TransactionRow[] = [];

    try {
        const lines = csvContent.trim().split('\n');

        if (lines.length < 2) {
            return {
                success: false,
                data: [],
                errors: ['File CSV kosong atau tidak valid']
            };
        }

        // Validate header
        const header = lines[0].toLowerCase().trim();
        const expectedHeaders = ['date', 'type', 'category', 'amount', 'description'];
        const headerCols = header.split(',').map(h => h.trim());

        const hasRequiredHeaders = ['date', 'type', 'category', 'amount'].every(
            required => headerCols.includes(required)
        );

        if (!hasRequiredHeaders) {
            return {
                success: false,
                data: [],
                errors: ['Header CSV tidak valid. Format yang benar: date,type,category,amount,description']
            };
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            const cols = line.split(',').map(c => c.trim());

            if (cols.length < 4) {
                errors.push(`Baris ${i + 1}: Data tidak lengkap`);
                continue;
            }

            const [dateStr, type, category, amountStr, description] = cols;

            // Validate date
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                errors.push(`Baris ${i + 1}: Format tanggal tidak valid (${dateStr})`);
                continue;
            }

            // Validate type
            if (type !== 'INCOME' && type !== 'EXPENSE') {
                errors.push(`Baris ${i + 1}: Type harus INCOME atau EXPENSE (${type})`);
                continue;
            }

            // Validate amount
            const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
            if (isNaN(amount) || amount <= 0) {
                errors.push(`Baris ${i + 1}: Amount tidak valid (${amountStr})`);
                continue;
            }

            // Validate category
            if (!category) {
                errors.push(`Baris ${i + 1}: Category tidak boleh kosong`);
                continue;
            }

            data.push({
                date: dateStr,
                type: type as "INCOME" | "EXPENSE",
                category,
                amount: Math.round(amount),
                description: description || undefined
            });
        }

        return {
            success: errors.length === 0,
            data,
            errors
        };

    } catch (error) {
        return {
            success: false,
            data: [],
            errors: [`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
    }
}

export function generateCSVTemplate(): string {
    const template = `date,type,category,amount,description
2024-02-01,INCOME,Gaji,5000000,Gaji Bulanan Januari
2024-02-02,EXPENSE,Makanan,50000,Makan siang
2024-02-03,EXPENSE,Transport,25000,Ongkos ke kantor
2024-02-04,INCOME,Bonus,1000000,Bonus project`;

    return template;
}

export function downloadCSVTemplate() {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'template-transaksi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
