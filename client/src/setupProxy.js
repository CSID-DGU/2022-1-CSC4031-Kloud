const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
    })
  );
  app.use(
    "/ws-stomp",
    createProxyMiddleware({ target: "http://localhost:8000", ws: true })
  );
};
