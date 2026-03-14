// routes.ts (Used by the proxy for matching)

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/unauthorized", "/not-found", "/logout"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to DEFAULT_LOGIN_REDIRECT
 * @type {string[]}
 */
export const authRoutes = ["/login", "/register", "/forgot-password"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * An array of routes that require admin role
 * @type {string[]}
 */
export const adminRoutes = ["/admin", "/patients"];

/**
 * An array of routes that require user role
 * @type {string[]}
 */
export const userRoutes = ["/user"];

/**
 * The default redirect paths after logging in, depending on role
 * @type {Record<string, string>}
 */
export const DEFAULT_LOGIN_REDIRECT: Record<string, string> = {
  admin: "/admin",
  user: "/user",
};
