import sveltiaAdminConfig from "virtual:lightnet/sveltiaAdminConfig"

const basePath: string = sveltiaAdminConfig.siteRootInRepo

export const projectPath = (path: string) =>
  `${basePath}${basePath.endsWith("/") || path.startsWith("/") ? "" : "/"}${path}`
