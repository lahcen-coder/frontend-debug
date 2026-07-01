// Default runtime config for local development.
// In production this file is overwritten by docker/entrypoint.sh using the
// container's environment variables, so no rebuild is needed to change the API URL.
window.__APP_CONFIG__ = {
  VITE_API_URL: "",
};
