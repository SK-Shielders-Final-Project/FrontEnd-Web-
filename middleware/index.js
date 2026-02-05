// CSS, 이미지 import 무시
require('ignore-styles');

// Babel 등록
require('@babel/register')({
    ignore: [/(node_modules)/],
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
    ]
});

// 서버 실행
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { handleRender } = require('./render');

const app = express();
const PORT = 3000;

// 로컬 (개발 환경)에서 실행 시 아래 프록시 설정 주석 해제
// // 1. [관리자 서버] 8081 포트
// app.use(
//     '/api/admin',
//     createProxyMiddleware({
//         target: 'http://43.203.51.77:8081',
//         changeOrigin: true,
//         pathRewrite: (path, req) => {
//             // 기존 로직 유지: /api/admin 강제 부착
//             return '/api/admin' + path.replace(/^\/api\/admin/, '');
//         },
//         onProxyReq: (proxyReq, req) => {
//             console.log(`[Admin Proxy] ${req.url} -> http://43.203.51.77:8081${req.path}`);
//         }
//     })
// );

// // 2. [메인 서버] 8080 포트
// app.use(
//     '/api',
//     createProxyMiddleware({
//         target: 'http://43.203.51.77:8080',
//         changeOrigin: true,
//         pathRewrite: (path, req) => {
//              // 기존 로직 유지: /api 강제 부착
//             return '/api' + path.replace(/^\/api/, '');
//         },
//         onProxyReq: (proxyReq, req) => {
//             console.log(`[Main Proxy] ${req.url} -> http://43.203.51.77:8080${req.path}`);
//         }
//     })
// );

app.use(cookieParser());

// 정적 파일 서빙
app.use(express.static(path.resolve(__dirname, '../build'), { index: false }));

// 모든 요청을 SRR 랜더러로 넘김
app.get('*', handleRender);

app.listen(PORT, () => {
    console.log('SSR Middle Server is listening!!');
})