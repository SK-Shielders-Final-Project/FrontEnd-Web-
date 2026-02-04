const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // -------------------------------------------------------------
  // 1. [관리자 서버] 8081 포트
  // -------------------------------------------------------------
  app.use(
    '/api/admin',
    createProxyMiddleware({
      target: 'http://43.203.51.77:8081',
      changeOrigin: true,
      
      // [핵심 해결책] 잘려나간 '/api/admin'을 강제로 다시 붙입니다.
      pathRewrite: (path, req) => {
        // 혹시라도 이미 붙어있으면 중복 방지를 위해 제거 후 다시 붙임
        return '/api/admin' + path.replace(/^\/api\/admin/, '');
      },

      onProxyReq: (proxyReq, req) => {
         // 로그로 확인: 이제 /auth/login이 아니라 /api/admin/auth/login으로 찍힐 겁니다.
         console.log(`[Admin] 전송됨: ${req.url} -> http://43.203.51.77:8081${req.path}`);
      }
    })
  );

  // -------------------------------------------------------------
  // 2. [메인 서버] 8080 포트
  // -------------------------------------------------------------
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://43.203.51.77:8080',
      changeOrigin: true,
      
      // [핵심 해결책] 잘려나간 '/api'를 강제로 다시 붙입니다.
      pathRewrite: (path, req) => {
        return '/api' + path.replace(/^\/api/, '');
      },

      onProxyReq: (proxyReq, req) => {
         console.log(`[Main] 전송됨: ${req.url} -> http://43.203.51.77:8080${req.path}`);
      }
    })
  );
};