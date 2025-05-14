import { Writable } from 'stream';

export function listToCsvLine(values: unknown[], stream: Writable): void {
    const cols = values.map(formatForCsv);
    const csvLine = `${cols.join(',')}\n`;
    stream.write(csvLine, 'utf8');
}

function formatForCsv(value: unknown): string {
    const str = String(value);
    if (/[,"\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
