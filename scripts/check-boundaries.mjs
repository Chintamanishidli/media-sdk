// Fails the build if a package imports something its layer is not allowed to.
// Rules mirror the assignment: app -> wrappers -> core, app -> components.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const WORKSPACE = ["media-core", "media-react", "media-native", "media-ui-react", "media-ui-native"];
const RULES = {
  "media-core":      { allow: [],             ban: ["react", "react-dom", "react-native"] },
  "media-react":     { allow: ["media-core"], ban: ["react-native"] },
  "media-native":    { allow: ["media-core"], ban: ["react-dom"] },
  "media-ui-react":  { allow: [],             ban: ["react-native"] },
  "media-ui-native": { allow: [],             ban: ["react-dom"] },
  // The app wires wrappers to components. It must NOT reach into core directly.
  "app":             { allow: ["media-react", "media-ui-react"], ban: [] },
};
const dirOf = (pkg) => (pkg === "app" ? join("apps", "app", "src") : join("packages", pkg, "src"));
const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== "node_modules") walk(p, out); }
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(f)) out.push(p);
  }
  return out;
}
const root = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

let errors = 0;
for (const [pkg, rule] of Object.entries(RULES)) {
  for (const file of walk(dirOf(pkg))) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(IMPORT_RE)) {
      const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
      if (spec.startsWith(".")) continue;
      const r = root(spec);
      const illegalWorkspace = WORKSPACE.includes(r) && r !== pkg && !rule.allow.includes(r);
      if (illegalWorkspace || rule.ban.includes(r)) {
        errors++;
        console.error(`✖ ${file}: ${pkg} must not import "${spec}"`);
      }
    }
  }
}
if (errors) { console.error(`\n${errors} boundary violation(s)`); process.exit(1); }
console.log("✔ dependency boundaries OK");
