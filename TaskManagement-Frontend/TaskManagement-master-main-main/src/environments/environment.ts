export const environment = {
  production: false,
  // Requests to /api are forwarded by proxy.conf.json (see package.json "start" script)
  // to the ASP.NET Core backend at https://localhost:7287, so no CORS issues in dev.
  apiUrl: '/api'
};
