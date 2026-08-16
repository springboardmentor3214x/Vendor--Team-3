// This file is replaced at build time by the Angular build system.
// The value of BACKEND_URL will be injected via --build-arg or nginx env substitution.
// For Docker/AWS deployment, set BACKEND_URL to your EC2 public IP or domain.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000'
};
