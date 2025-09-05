const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 解析URL，忽略查询参数
    const urlPath = req.url.split('?')[0];
    
    // 处理静态资源（有文件扩展名的）
    if (path.extname(urlPath)) {
        var filePath = path.join(__dirname, urlPath);
    } else {
        // 对于没有扩展名的路径（如 /callback），返回 index.html（SPA路由）
        var filePath = path.join(__dirname, 'index.html');
    }
    
    // 獲取文件擴展名來設置正確的Content-Type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // 讀取並返回文件
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Server Error</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
});