export function listToCsvLine(items: (string | number | null | undefined)[]) {
    // Basic CSV escaping: wrap strings with quotes if they contain comma or quote
    return items
        .map((item) => {
            if (item == null) return '';
            const str = String(item);
            if (str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`; // escape quotes
            }
            if (str.includes(',') || str.includes('\n')) {
                return `"${str}"`;
            }
            return str;
        })
        .join(',') + '\n';
}

// Thank you, anon.
export function nodeStreamToWebStream(nodeStream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
    const reader = nodeStream[Symbol.asyncIterator]();

    return new ReadableStream({
        async pull(controller) {
            try {
                const { value, done } = await reader.next();
                if (done) {
                    controller.close();
                    return;
                }
                controller.enqueue(value);
            } catch (err) {
                controller.error(err);
            }
        },
        async cancel() {
            if (reader.return) {
                await reader.return();
            }
        },
    });
}
