export function checkEnvVars(envVars: string[]) {
  for (let envVar of envVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Missing environment variable: ${envVar}. Please set it in backend/.env file.`
      );
    }
  }
}
