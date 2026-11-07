import { randomUUID } from "node:crypto";

const host = "https://dbc-a3bbfca6-850a.cloud.databricks.com";
const workspaceId = "7474653288963289";
const dashboardId = "01f1daeb815914e69b3ef75f86f7d789";

async function request(url, options, stage) {
  const result = await fetch(url, { ...options, redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!result.ok) throw new Error(`${stage} returned ${result.status}`);
  return result.json();
}

async function scopedToken(viewer) {
  const { DATABRICKS_CLIENT_ID: client, DATABRICKS_CLIENT_SECRET: secret } = process.env;
  if (!client || !secret) throw new Error("Missing server credentials");
  const endpoint = new URL(`/oidc/v1/token?o=${workspaceId}`, host);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(`${client}:${secret}`).toString("base64")}`,
  };
  const oauth = (stage, params) => request(endpoint, {
    method: "POST", headers, body: new URLSearchParams({ ...params, grant_type: "client_credentials" }),
  }, stage);

  const bootstrap = await oauth("Service OAuth", { scope: "all-apis" });
  const info = new URL(`/api/2.0/lakeview/dashboards/${dashboardId}/published/tokeninfo`, host);
  info.search = new URLSearchParams({ o: workspaceId, external_viewer_id: viewer, external_value: "public-demo" });
  const { authorization_details, ...params } = await request(info, {
    headers: { Authorization: `Bearer ${bootstrap.access_token}` },
  }, "Dashboard token scope");
  if (!authorization_details?.length) throw new Error("Dashboard scope missing");
  const scoped = await oauth("Scoped OAuth", {
    ...params, authorization_details: JSON.stringify(authorization_details),
  });
  if (!scoped.access_token || !Number.isFinite(scoped.expires_in)) throw new Error("Scoped token missing");
  return { token: scoped.access_token, expiresIn: scoped.expires_in, instanceUrl: host, workspaceId, dashboardId };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.writeHead(405).end('{"error":"Use POST."}');
    return;
  }
  const origin = process.env.EMBED_ORIGIN;
  if (!origin || req.headers.origin !== origin || req.headers["sec-fetch-site"] === "cross-site") {
    res.writeHead(403).end('{"error":"This origin is not configured for embedding."}');
    return;
  }
  const previous = req.headers.cookie?.match(/(?:^|;\s*)ace_viewer=([0-9a-f-]{36})(?:;|$)/)?.[1];
  const viewer = previous || randomUUID();
  try {
    const response = await scopedToken(viewer);
    if (!previous) {
      res.setHeader("Set-Cookie", `ace_viewer=${viewer}; Path=/api/token; HttpOnly; SameSite=Strict; Max-Age=86400${origin.startsWith("https:") ? "; Secure" : ""}`);
    }
    res.writeHead(200).end(JSON.stringify(response));
  } catch (error) {
    // Upstream bodies and tokens may contain credentials. Only log the stage and status.
    console.error(error.message);
    res.writeHead(502).end('{"error":"Databricks could not issue a dashboard token."}');
  }
}
