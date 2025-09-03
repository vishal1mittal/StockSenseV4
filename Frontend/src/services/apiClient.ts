/*
  frontend-apiClient.ts
  Single-file API client for the frontend that encapsulates:
    - auth flows (register, login, verify email, resend otp)
    - token storage (access, refresh, opaque token, sessionId)
    - token refresh flow with request queuing and a refresh mutex
    - 2FA flows (enable, confirm, disable, refresh backup codes)
    - profile and logout
    - stock endpoints (summary, overview, historical, risk, technical, predictions, news, financedocs)
    - helpers: request timeout, error normalization, subscription to auth state changes

  Usage (high level): import functions from this module and call them from components or services.

  Implementation notes:
    - Tokens stored in localStorage under a single key; you can swap to cookies or other secure storage.
    - Automatic token refresh: when a 401 is encountered, the client will attempt a refresh using the stored refreshToken + opaqueToken.
      Requests launched while a refresh is in progress are queued and resumed after refresh success. If refresh fails, queued requests are rejected.
    - 2FA endpoints follow your backend routes (enable2fa, confirm2fa, refresh2fabackup, disable2fa).
    - All functions return a normalized result: either { ok: true, data } or { ok: false, error }
*/

// --------- Configuration & Types ---------
const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string) ||
    (window as any).__API_BASE_URL__ ||
    "/api";

// storage key for tokens
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY as string;
const RETURN_URL_KEY = "stocksense_return_url";

type Nullable<T> = T | null;

export interface TokenStore {
    accessToken: Nullable<string>;
    refreshToken: Nullable<string>;
    opaqueToken: Nullable<string>;
    sessionId: Nullable<string>;
}

export interface NormalizedResult<T> {
    ok: true;
    data: T;
}

export interface NormalizedError {
    ok: false;
    error: string;
    status?: number;
    details?: any;
}

export type ApiResult<T> = Promise<NormalizedResult<T> | NormalizedError>;

export function isNormalizedError(result: any): result is NormalizedError {
    return result.ok === false;
}

// Minimal user/profile shape (returned by /auth/profile)
export interface UserProfile {
    id: string;
    email: string;
    roles?: string[]; // Adding the twoFA property to resolve the TypeScript error
    twoFA?: {
        enabled: boolean;
        secretEnc?: string | null;
        backupCodesHash?: string[];
    };
}

// --------------- Internal state ----------------
let tokenStore: TokenStore = loadTokenStore();

// A simple subscriber pattern so the app can react to sign-in/sign-out
const authSubscribers: Array<(store: TokenStore) => void> = [];
export const subscribeAuth = (fn: (store: TokenStore) => void) => {
    authSubscribers.push(fn); // return unsubscribe
    return () => {
        const idx = authSubscribers.indexOf(fn);
        if (idx >= 0) authSubscribers.splice(idx, 1);
    };
};

function notifyAuthChange() {
    authSubscribers.forEach((s) => {
        try {
            s(tokenStore);
        } catch (e) {
            console.error("auth subscriber error", e);
        }
    });
}

function loadTokenStore(): TokenStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return {
                accessToken: null,
                refreshToken: null,
                opaqueToken: null,
                sessionId: null,
            };
        return JSON.parse(raw) as TokenStore;
    } catch (e) {
        console.warn("Failed to parse token store", e);
        return {
            accessToken: null,
            refreshToken: null,
            opaqueToken: null,
            sessionId: null,
        };
    }
}

function persistTokenStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenStore));
    notifyAuthChange();
}

export function clearAuth() {
    tokenStore = {
        accessToken: null,
        refreshToken: null,
        opaqueToken: null,
        sessionId: null,
    };
    localStorage.removeItem(RETURN_URL_KEY);
    persistTokenStore();
}

export function setTokens(tokens: Partial<TokenStore>) {
    tokenStore = { ...tokenStore, ...tokens };
    persistTokenStore();
}

export function getTokens(): TokenStore {
    return { ...tokenStore };
}

export function handleLoginRedirect() {
    const returnUrl = localStorage.getItem(RETURN_URL_KEY) || "/";
    localStorage.removeItem(RETURN_URL_KEY);
    window.location.href = returnUrl;
}

export function loginAsDemo(returnUrl: string = "/") {
    const demoTokens = {
        accessToken: import.meta.env.VITE_ACCESS_TOKEN as string,
        refreshToken: import.meta.env.VITE_REFRESH_TOKEN as string,
        opaqueToken: import.meta.env.VITE_OPAQUE_TOKEN as string,
        sessionId: import.meta.env.VITE_SESSION_ID as string,
    };
    setTokens(demoTokens);
    handleLoginRedirect();
}

// ------------- Request helpers ---------------

function timeoutSignal(ms: number) {
    // AbortSignal.timeout exists in modern browsers but for portability we implement fallback
    try {
        // @ts-ignore
        return AbortSignal.timeout(ms);
    } catch (e) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), ms);
        return controller.signal;
    }
}

function normalizeErrorResponse(err: any, status?: number): NormalizedError {
    if (err && err.error) {
        return { ok: false, error: err.error, status, details: err };
    }
    if (err && typeof err === "string")
        return { ok: false, error: err, status };
    return { ok: false, error: "Unknown error", status, details: err };
}

// Low-level fetch wrapper - does not attempt refresh
async function rawRequest(
    path: string,
    opts: RequestInit = {},
    timeoutMs = 10000
) {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const init = { ...opts };
    if (!init.headers) init.headers = {}; // ensure JSON content type for bodies
    if (init.body && !(init.headers as any)["Content-Type"]) {
        (init.headers as any)["Content-Type"] = "application/json";
    }
    try {
        const resp = await fetch(url, {
            ...init,
            signal: timeoutSignal(timeoutMs),
        });
        const text = await resp.text();
        const data = text ? JSON.parse(text) : null;
        if (!resp.ok) return { ok: false as const, status: resp.status, data };
        return { ok: true as const, status: resp.status, data };
    } catch (e: any) {
        if (e.name === "AbortError")
            return {
                ok: false as const,
                status: 0,
                data: { error: "timeout" },
            };
        return {
            ok: false as const,
            status: 0,
            data: { error: e.message || "network_error" },
        };
    }
}

// ------------- Token refresh queue/mutex --------------
let refreshInProgress: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (refreshInProgress) return refreshInProgress;

    refreshInProgress = (async () => {
        try {
            if (!tokenStore.refreshToken || !tokenStore.opaqueToken) {
                clearAuth();
                return false;
            }

            const body = JSON.stringify({
                refreshToken: tokenStore.refreshToken,
                opaqueToken: tokenStore.opaqueToken,
            });
            const r = await rawRequest(
                "/auth/refresh",
                { method: "POST", body },
                10000
            );
            if (!r.ok) {
                clearAuth();
                return false;
            }
            const newAccess = (r.data && r.data.accessToken) || null;
            if (!newAccess) {
                clearAuth();
                return false;
            }
            setTokens({ accessToken: newAccess });
            return true;
        } catch (e) {
            console.error("refreshAccessToken error", e);
            clearAuth();
            return false;
        } finally {
            // reset after slight delay to allow queued promises to pick up the updated token
            setTimeout(() => (refreshInProgress = null), 0);
        }
    })();

    return refreshInProgress;
}

// Auth-aware request that will try to refresh on 401
async function authRequest<T>(
    path: string,
    opts: RequestInit = {},
    timeoutMs = 10000
): ApiResult<T> {
    // If the user is a demo user, do not make an API call.
    if (isDemoUser()) {
        return { ok: false, error: "Demo mode, skipping API call" };
    } // attach Authorization if we have an accessToken

    const headers: HeadersInit = { ...(opts.headers || {}) };
    if (tokenStore.accessToken)
        headers["Authorization"] = `Bearer ${tokenStore.accessToken}`;

    const res = await rawRequest(path, { ...opts, headers }, timeoutMs);
    if (res.ok) return { ok: true, data: res.data as T }; // if 401 -> try refresh once

    if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed)
            return normalizeErrorResponse(
                { error: "Unauthorized - refresh failed" },
                401
            ); // retry the request with new token
        const headers2: HeadersInit = { ...(opts.headers || {}) };
        if (tokenStore.accessToken)
            headers2["Authorization"] = `Bearer ${tokenStore.accessToken}`;
        const res2 = await rawRequest(
            path,
            { ...opts, headers: headers2 },
            timeoutMs
        );
        if (res2.ok) return { ok: true, data: res2.data as T };
        return normalizeErrorResponse(res2.data, res2.status);
    }

    return normalizeErrorResponse(res.data, res.status);
}

// ----------------- Auth API functions -----------------

export async function register(
    email: string,
    password: string
): ApiResult<{ message: string }> {
    const body = JSON.stringify({ email, password });
    const r = await rawRequest("/auth/register", { method: "POST", body });
    if (!r.ok) return normalizeErrorResponse(r.data, r.status);
    return { ok: true, data: r.data };
}

export async function verifyEmail(
    email: string,
    otp: string
): ApiResult<{ message: string }> {
    const r = await rawRequest("/auth/verifyemail", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });
    if (!r.ok) return normalizeErrorResponse(r.data, r.status);
    return { ok: true, data: r.data };
}

export async function resendEmailOTP(
    email: string
): ApiResult<{ message: string }> {
    const r = await rawRequest("/auth/resendemailotp", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    if (!r.ok) return normalizeErrorResponse(r.data, r.status);
    return { ok: true, data: r.data };
}

export async function login(payload: {
    email: string;
    password: string;
    token?: string;
    backupCode?: string;
}): ApiResult<{
    accessToken: string;
    refreshToken: string;
    opaqueToken: string;
    sessionId: string;
}> {
    const r = await rawRequest(
        "/auth/login",
        { method: "POST", body: JSON.stringify(payload) },
        15000
    );
    if (!r.ok) return normalizeErrorResponse(r.data, r.status);
    const { accessToken, refreshToken, opaqueToken, sessionId } = r.data || {};
    setTokens({ accessToken, refreshToken, opaqueToken, sessionId });
    return {
        ok: true,
        data: { accessToken, refreshToken, opaqueToken, sessionId },
    };
}

export async function logout(): ApiResult<{ message: string }> {
    // call logout endpoint with sessionId to revoke on server
    const sid = tokenStore.sessionId;
    if (!sid) {
        clearAuth();
        return { ok: false, error: "No active session" };
    }
    const r = await rawRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ sessionId: sid }),
    });
    clearAuth();
    if (!r.ok) return normalizeErrorResponse(r.data, r.status);
    return { ok: true, data: r.data };
}

export async function refresh2faBackup(
    password: string,
    token?: string,
    backupCode?: string
) {
    const payload: any = { password };
    if (token) payload.token = token;
    if (backupCode) payload.backupCode = backupCode;
    const r = await authRequest("/auth/refresh2fabackup", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return r;
}

export async function enable2fa(): ApiResult<{
    message: string; // Updated type to reflect the backend change
    otpauthUrl?: string;
}> {
    const r = await authRequest<{ message: string; otpauthUrl?: string }>(
        "/auth/enable2fa",
        { method: "POST" }
    );
    return r;
}

export async function confirm2fa(
    token: string
): ApiResult<{ message: string; backupCodes?: string[] }> {
    const r = await authRequest<{ message: string; backupCodes?: string[] }>(
        "/auth/confirm2fa",
        { method: "POST", body: JSON.stringify({ token }) }
    );
    return r;
}

export async function disable2fa(payload: {
    password: string;
    token?: string;
    backupCode?: string;
}): ApiResult<{ message: string }> {
    const r = await authRequest<{ message: string }>("/auth/disable2fa", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return r;
}

// fetch profile
export async function fetchProfile(): ApiResult<{ user: UserProfile }> {
    const r = await authRequest<{ user: UserProfile }>("/auth/profile", {
        method: "POST",
    });
    return r;
}

export interface StockData {
    symbol: string;
    companyName: string;
    currency: string;
    overview?: {
        price: number;
        change: number;
        changePercent: number;
        volume: string;
        marketCap: string;
        peRatio: number;
        dayRange: string;
    };
    historicalPerformance?: {
        dailyData: Array<{ date: string; price: number; volume: number }>;
        performance: {
            "1d": number;
            "1w": number;
            "1m": number;
            "3m": number;
            "1y": number;
        };
    };
    riskAnalysis?: {
        riskScore: number;
        volatility: number;
        beta: number;
        sharpeRatio: number;
        maxDrawdown: number;
        var95?: number;
    };
    technicalLevels?: {
        currentPrice: number;
        dailyLevels: {
            support: number[];
            resistance: number[];
        };
        weeklyLevels: {
            support: number[];
            resistance: number[];
        };
        indicators: {
            rsi: number;
            macd: string;
            trend: string;
        };
    };
    aiPredictions?: {
        monthlyPredictions: Array<{
            date: string;
            predictedPrice: number;
            confidence: number;
            direction?: string;
        }>;
        summary: {
            nextDayPrediction: {
                direction: string;
                confidence: number;
                targetPrice: number;
                reasoning: string;
            };
            weeklyOutlook: {
                direction: string;
                confidence: number;
                targetRange: string;
                keyFactors: string[];
            };
            riskFactors: string[];
        };
    };
    news?: Array<{
        id: number;
        title: string;
        summary: string;
        time: string;
        source: string;
        sentiment: string;
    }>;
    financialDocuments?: {
        keyMetrics: Array<{
            label: string;
            value: string;
            change: string;
        }>;
        documents: Array<{
            id: number;
            title: string;
            type: string;
            date: string;
            size: string;
            category: string;
        }>;
    };
}

// --------------- Stock API wrappers -----------------
export async function fetchStockSummary(symbol: string): ApiResult<StockData> {
    return authRequest<StockData>(`/stocks/${symbol}/summary`, {
        method: "GET",
    });
}

export async function fetchStockOverview(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/overview`, {
        method: "GET",
    });
}

export async function fetchStockHistorical(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/historical`, {
        method: "GET",
    });
}

export async function fetchStockRisk(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/risk`, {
        method: "GET",
    });
}

export async function fetchStockTechnical(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/technical`, {
        method: "GET",
    });
}

export async function fetchStockPredictions(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/predictions`, {
        method: "GET",
    });
}

export async function fetchStockNews(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/news`, {
        method: "GET",
    });
}

export async function fetchStockFinanceDocs(symbol: string) {
    return authRequest(`/stocks/${encodeURIComponent(symbol)}/financedocs`, {
        method: "GET",
    });
}

// --------------- Utilities / Validators ----------------
export function isAuthenticated() {
    const currentToken = getTokens().accessToken;
    return Boolean(currentToken);
}

export function isDemoUser() {
    return getTokens().accessToken === "demo-access-token";
}

// Optional: programmatic way to set base url (useful in tests)
export function setApiBaseUrl(url: string) {
    (window as any).__API_BASE_URL__ = url;
}

// small helper to wrap results and extract typed data
export async function callAndUnwrap<T>(
    p: Promise<NormalizedResult<T> | NormalizedError>
): Promise<T> {
    const res = await p;
    if (res.ok) {
        return res.data;
    } else {
        // Type guard: res is NormalizedError here
        throw new Error((res as NormalizedError).error);
    }
}

// --------------- Export summary ---------------
// Exports: register, verifyEmail, resendEmailOTP, login, logout, enable2fa, confirm2fa, refresh2faBackup, disable2fa,
// fetchProfile, fetchStockSummary, fetchStockOverview, fetchStockHistorical, fetchStockRisk, fetchStockTechnical,
// fetchStockPredictions, fetchStockNews, fetchStockFinanceDocs, isAuthenticated, subscribeAuth, setTokens, clearAuth
