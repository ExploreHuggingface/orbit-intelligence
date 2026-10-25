import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".orbit-local/**",
      "next-env.d.ts",
      "components/easyui/**",
      "supabase/migrations/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Vendored EasyUI components (github.com/Surajmaurya1/easyui): upstream
    // library code, kept close to source. Chart/table internals use `any`
    // deliberately; we lint our own code strictly instead.
    files: ["components/easyui/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "off",
    },
  },
  {
    // Codegen output for the Supabase seed — long literal lines are fine.
    files: ["supabase/**"],
    rules: {
      "max-len": "off",
    },
  },
];

export default eslintConfig;
