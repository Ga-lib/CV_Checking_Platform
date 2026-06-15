const PDFParser = require('pdf2json');

function safeDecodeURIComponent(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

async function extractTextFromPDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfData.Pages.map(page =>
                page.Texts.map(t => safeDecodeURIComponent(t.R.map(r => r.T).join(''))).join(' ')
            ).join('\n');
            resolve(text);
        });

        pdfParser.on('pdfParser_dataError', (err) => {
            reject(err);
        });

        pdfParser.parseBuffer(buffer);
    });
}

module.exports = { extractTextFromPDF };
