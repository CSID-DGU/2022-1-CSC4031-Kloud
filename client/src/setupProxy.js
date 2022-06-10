import BASE_URL from "./api_server";

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: BASE_URL,
      changeOrigin: true,
    })
  );
};
