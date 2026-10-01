/** Product name shown in the UI. Change here to rebrand. */
export const APP_NAME = "Identificação de Equipamentos";

/**
 * Login do admin. TEMPORARIAMENTE DESLIGADO por padrão: a área /admin fica aberta.
 * Para religar, defina AUTH_ENABLED=true nas variáveis de ambiente (Vercel) e faça redeploy.
 */
export const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
