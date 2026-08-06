/**
 * Sprint L (HF-SPRINT-L-01) — Importacao de clientes via CSV.
 *
 * Fluxo:
 *   1. User baixa template CSV (4 colunas: name, email, phone, company)
 *   2. Preenche no Excel/Sheets, exporta como CSV
 *   3. Upload aqui -> parse client-side (sem libs externas)
 *   4. Preview das primeiras 5 linhas + count
 *   5. Confirm -> POST /api/cowork/clients/import-simple
 *   6. Mostra resultado: created, skipped (ja existentes), errors granulares
 *
 * Por que parse no client em vez de mandar arquivo:
 *   - Usuario ve preview ANTES de confirmar (evita import errado)
 *   - Erros de formato aparecem instantaneo (vs round-trip)
 *   - Backend nao precisa lidar com upload de arquivo binario
 *   - Funciona offline (parse) ate o submit
 */
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { getAPIClient } from "@services/apiClient";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { ReactElement, useState } from "react";
import { toast } from "react-toastify";

interface ParsedRow {
  name: string;
  email: string;
  phone: string;
  company: string;
  _row: number;
  _valid: boolean;
  _reason?: string;
}

interface ImportResult {
  total: number;
  created: number;
  skippedExisting: string[];
  errors: Array<{ row: number; email: string; reason: string }>;
}

const TEMPLATE_CSV =
  "name,email,phone,company\n" +
  "Joao Silva,joao@empresa.com,+5511999990001,Empresa Joao\n" +
  "Maria Santos,maria@example.com,+5511988887777,Acme Ltda\n" +
  "Pedro Costa,pedro@start.io,,Startup Pedro\n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

/**
 * Parser CSV simples — sem dependencia externa.
 * Suporta:
 *   - Header obrigatorio na linha 1
 *   - Aspas envolventes em valores com virgula: "Joao, Jr",joao@x.com,...
 *   - CRLF ou LF
 * NAO suporta:
 *   - Aspas duplas escapadas dentro de campos (raro pra import de cliente)
 *   - Delimitador != virgula
 */
function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  // Detecta header e identifica colunas (aceita ordem variavel)
  const header = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const idx = {
    name: header.indexOf("name"),
    email: header.indexOf("email"),
    phone: header.indexOf("phone"),
    company: header.indexOf("company"),
  };
  if (idx.name < 0 || idx.email < 0) {
    throw new Error('CSV deve ter cabecalho com pelo menos "name" e "email"');
  }

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    const r: ParsedRow = {
      name: (cols[idx.name] || "").trim(),
      email: (cols[idx.email] || "").trim().toLowerCase(),
      phone: idx.phone >= 0 ? (cols[idx.phone] || "").trim() : "",
      company: idx.company >= 0 ? (cols[idx.company] || "").trim() : "",
      _row: i + 1,
      _valid: true,
    };
    if (!r.name) {
      r._valid = false;
      r._reason = "Nome vazio";
    } else if (!r.email || !EMAIL_RE.test(r.email)) {
      r._valid = false;
      r._reason = "Email invalido";
    }
    rows.push(r);
  }
  return rows;
}

function parseRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

const ClientImport = () => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsv(String(reader.result || ""));
        setRows(parsed);
        if (parsed.length === 0) {
          toast.warn("CSV vazio ou sem dados validos");
        }
      } catch (err: any) {
        toast.error(err?.message || "Falha ao ler CSV");
        setRows([]);
      }
    };
    reader.onerror = () => toast.error("Falha ao ler arquivo");
    reader.readAsText(f, "utf-8");
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workeaser_clientes_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const validRows = rows.filter((r) => r._valid);
    if (validRows.length === 0) {
      toast.error("Nenhuma linha valida pra importar");
      return;
    }
    if (
      !confirm(
        `Importar ${validRows.length} cliente(s)?\n\n` +
          `Linhas com erro (${rows.length - validRows.length}) serao puladas. ` +
          `Emails duplicados (que ja existem no sistema) tambem.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const api = getAPIClient();
      const payload = {
        rows: validRows.map((r) => ({
          name: r.name,
          email: r.email,
          phone: r.phone || undefined,
          company: r.company || undefined,
        })),
      };
      const { data } = await api.post(
        "/cowork/clients/import-simple",
        payload
      );
      const r: ImportResult = data?.result || data;
      setResult(r);
      toast.success(`${r.created} cliente(s) criado(s)`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message || "Falha na importacao"
      );
    } finally {
      setBusy(false);
    }
  };

  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <>
      <Head>
        <title>Importar clientes (CSV) — Workeaser</title>
      </Head>
      <div style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/relationship/client-management"
            style={{ fontSize: 13, color: "#525252", textDecoration: "none" }}
          >
            ← Voltar pra clientes
          </Link>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "8px 0 8px",
              letterSpacing: -0.5,
            }}
          >
            Importar clientes via CSV
          </h1>
          <p style={{ fontSize: 14, color: "#525252", margin: 0, lineHeight: 1.5 }}>
            Suba uma planilha de até 500 linhas com seus clientes. Cada linha vira
            uma conta de cliente (User + ClientAccount) linkada ao seu cowork.
          </p>
        </div>

        {/* Step 1 — Template */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={stepIconStyle}>1</div>
            <div style={{ flex: 1 }}>
              <h3 style={cardTitleStyle}>Baixe o template</h3>
              <p style={cardDescStyle}>
                Modelo CSV com 4 colunas: <code>name, email, phone, company</code>.
                Preencha no Excel/Google Sheets e exporte como CSV.
              </p>
            </div>
            <button type="button" onClick={downloadTemplate} style={btnSecondary}>
              📥 Baixar template
            </button>
          </div>
        </div>

        {/* Step 2 — Upload */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={stepIconStyle}>2</div>
            <div style={{ flex: 1 }}>
              <h3 style={cardTitleStyle}>Suba seu CSV</h3>
              <p style={cardDescStyle}>
                {filename
                  ? `Arquivo: ${filename}`
                  : "Selecione o arquivo CSV preenchido."}
              </p>
            </div>
            <label style={btnPrimary}>
              📁 Escolher arquivo
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Step 3 — Preview */}
        {rows.length > 0 && (
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={cardTitleStyle}>3. Pré-visualização</h3>
              <p style={cardDescStyle}>
                Total: {rows.length} ·{" "}
                <strong style={{ color: "#16a34a" }}>{validCount} válidas</strong>
                {invalidCount > 0 && (
                  <>
                    {" "}·{" "}
                    <strong style={{ color: "#dc2626" }}>
                      {invalidCount} com erro
                    </strong>
                  </>
                )}
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fafafa", textAlign: "left" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Telefone</th>
                    <th style={thStyle}>Empresa</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r) => (
                    <tr
                      key={r._row}
                      style={{
                        background: r._valid ? "#fff" : "#fef2f2",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <td style={tdStyle}>{r._row}</td>
                      <td style={tdStyle}>{r.name || "—"}</td>
                      <td style={tdStyle}>{r.email || "—"}</td>
                      <td style={tdStyle}>{r.phone || "—"}</td>
                      <td style={tdStyle}>{r.company || "—"}</td>
                      <td style={tdStyle}>
                        {r._valid ? (
                          <span style={{ color: "#16a34a" }}>✓ OK</span>
                        ) : (
                          <span style={{ color: "#dc2626" }}>
                            ⚠ {r._reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#737373",
                    textAlign: "center",
                    marginTop: 12,
                  }}
                >
                  Mostrando primeiras 20 de {rows.length} linhas
                </p>
              )}
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                type="button"
                onClick={handleImport}
                disabled={busy || validCount === 0}
                style={{
                  ...btnPrimary,
                  opacity: busy || validCount === 0 ? 0.6 : 1,
                  cursor: busy || validCount === 0 ? "not-allowed" : "pointer",
                }}
              >
                {busy
                  ? "Importando..."
                  : `Importar ${validCount} cliente${validCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Resultado */}
        {result && (
          <div
            style={{
              ...cardStyle,
              background: "#f0fdf4",
              border: "1px solid #86efac",
            }}
          >
            <h3 style={{ ...cardTitleStyle, color: "#16a34a" }}>
              ✅ Importação concluída
            </h3>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <div>
                <strong>{result.created}</strong> cliente(s) criado(s) com sucesso
              </div>
              <div>
                <strong>{result.skippedExisting.length}</strong> pulado(s) (email já
                existente)
              </div>
              <div>
                <strong>{result.errors.length}</strong> erro(s) durante criação
              </div>
            </div>

            {result.skippedExisting.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "#525252" }}>
                  Ver emails pulados ({result.skippedExisting.length})
                </summary>
                <ul style={{ fontSize: 12, marginTop: 8 }}>
                  {result.skippedExisting.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </details>
            )}

            {result.errors.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "#dc2626" }}>
                  Ver erros ({result.errors.length})
                </summary>
                <ul style={{ fontSize: 12, marginTop: 8, color: "#dc2626" }}>
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      Linha {e.row} ({e.email}): {e.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div style={{ marginTop: 20 }}>
              <Link
                href="/relationship/client-management"
                style={{ ...btnPrimary, display: "inline-block" }}
              >
                Ver lista de clientes →
              </Link>
            </div>
          </div>
        )}

        {/* Help */}
        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: 8,
            fontSize: 13,
            color: "#92400e",
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Dicas:</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            <li>
              Cliente importado recebe senha temporária aleatória — ele deve usar
              "Esqueci minha senha" pra acessar pela primeira vez
            </li>
            <li>
              Limite de 500 linhas por importação (divida em arquivos menores se
              precisar)
            </li>
            <li>Phone e company são opcionais; name e email são obrigatórios</li>
            <li>
              Emails já cadastrados no Workeaser (mesmo de outros coworks) são
              pulados — sem erro, só ficam fora
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e5e5",
  borderRadius: 10,
  padding: 20,
  marginBottom: 16,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  margin: "0 0 6px",
};

const cardDescStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#525252",
  margin: 0,
  lineHeight: 1.5,
};

const stepIconStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "#1677ff",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 14,
  flexShrink: 0,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 18px",
  background: "#1677ff",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 18px",
  background: "transparent",
  color: "#1677ff",
  border: "1px solid #1677ff",
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  color: "#525252",
  borderBottom: "1px solid #e5e5e5",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
};

ClientImport.getLayout = function getLayout(page: ReactElement) {
  return <CoworkingLayout>{page}</CoworkingLayout>;
};

export default ClientImport;
