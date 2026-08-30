const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// جذر الملفات الثابتة = مجلد المشروع نفسه (لا يوجد مجلد public)
const ROOT = path.resolve(__dirname);

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function sendText(res, code, message) {
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
}

function sendIndex(res, statusCode) {
    fs.readFile(path.join(ROOT, 'index.html'), (err, content) => {
        if (err) {
            sendText(res, 500, '500 - Internal Server Error');
            return;
        }
        res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    // تعطيل الكاش
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        sendText(res, 405, '405 - Method Not Allowed');
        return;
    }

    // تجاهل الـ query string وفك ترميز المسار
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (e) {
        sendText(res, 400, '400 - Bad Request');
        return;
    }

    if (pathname.endsWith('/')) {
        pathname += 'index.html';
    }

    // تطبيع المسار ثم التأكد أنه لا يخرج من جذر المشروع
    const filePath = path.join(ROOT, path.normalize(pathname));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        sendText(res, 403, '403 - Forbidden');
        return;
    }

    fs.stat(filePath, (statErr, stats) => {
        if (statErr || !stats.isFile()) {
            sendIndex(res, 404);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const isText = contentType.startsWith('text/') || ext === '.js' || ext === '.json' || ext === '.svg';

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                sendText(res, 500, '500 - Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType + (isText ? '; charset=utf-8' : '') });
            res.end(data);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log('Server running at http://' + HOST + ':' + PORT + '/');
});
