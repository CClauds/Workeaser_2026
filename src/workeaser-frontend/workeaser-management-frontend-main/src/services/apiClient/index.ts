import axios, { AxiosError } from "axios";
import * as next from "next";
import { parseCookies } from "nookies";

/**
 * HF-AUDIT-05: response interceptor garante que `error.response.data.error.message`
 * SEMPRE existe como objeto válido. Antes, 17 telas no frontend faziam
 * `err.response.data.error.message.forEach(...)` e quebravam com "Cannot read
 * properties of undefined" quando:
 *   - havia timeout/erro de rede (err.response não existia)
 *   - backend devolvia formato diferente
 *
 * Defesa em profundidade: normalizar AQUI = todos os callers protegidos sem refactor.
 */
function normalizeErrorShape(err: AxiosError | any): any {
  if (!err) return err;
  if (!err.response) {
    err.response = {
      status: 0,
      data: {
        error: { code: "NETWORK_ERROR", message: "Erro de rede ou timeout. Tente novamente." },
      },
    } as any;
  }
  if (!err.response.data) {
    err.response.data = {
      error: { code: "EMPTY_RESPONSE", message: "Servidor sem resposta." },
    };
  }
  if (!err.response.data.error) {
    err.response.data.error = {
      code: `HTTP_${err.response.status || "UNKNOWN"}`,
      message: typeof err.response.data === "string"
        ? err.response.data
        : (err.message || "Erro desconhecido."),
    };
  }
  // Garante que .message exista (string OU array de {message})
  if (err.response.data.error.message === undefined || err.response.data.error.message === null) {
    err.response.data.error.message = err.message || "Erro desconhecido.";
  }
  return err;
}

export const getAPIClient = (
  ctx?:
    | Pick<next.NextPageContext, "req">
    | {
        req: next.NextApiRequest;
      }
    | null
    | undefined
) => {
  const { "user-token": token } = parseCookies(ctx);

  // SSR (getServerSideProps): necesita URL absoluta al contenedor API en Docker network.
  // Cliente (navegador): usa ruta relativa /api → nginx proxy.
  const isServer = typeof window === 'undefined';
  const baseURL = isServer
    ? (process.env.NEXT_PUBLIC_API_URL_INTERNAL || 'http://workeaser-api:3333/api')
    : (process.env.NEXT_PUBLIC_API_URL || '/api');

  // 1B.2-httpOnly: cliente usa withCredentials para que el navegador envíe
  // la cookie httpOnly automáticamente. CookieAuth middleware en backend
  // la inyecta como Bearer header. SSR lee la cookie del request (funciona con httpOnly).
  const api = axios.create({
    baseURL,
    withCredentials: !isServer,
  });

  if (token) {
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
  }

  // Response interceptor — normaliza erro
  api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeErrorShape(error))
  );

  return api;
};
