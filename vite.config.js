import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        operator: resolve(__dirname, "operator/index.html"),
        adminLogin: resolve(__dirname, "admin-login.html"),
        adminDashboard: resolve(__dirname, "admin-dashboard.html"),
        adminHistorico: resolve(__dirname, "admin-historico.html"),
        adminCadastros: resolve(__dirname, "admin-cadastros.html"),
        adminAuditoria: resolve(__dirname, "admin-auditoria.html")
      }
    }
  }
});
