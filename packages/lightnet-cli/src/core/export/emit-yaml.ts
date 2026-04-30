import YAML from "yaml"

export const emitYaml = (entries: [string, string][]) =>
  entries
    .map(([key, value]) => YAML.stringify({ [key]: value }).trimEnd())
    .join("\n")
