import { Writable } from 'stream';

export function listToCsvLine(values: unknown[], stream: Writable): void {
    const cols = values.map(formatForCsv);
    const csvLine = `${cols.join(',')}\n`;
    stream.write(csvLine, 'utf8');
}

function formatForCsv(value: unknown): string {
    const str = String(value);
    // Quote if line endings or a quote mark:
    if (/[,"\n\r\f]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
