import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";

// Flat config: JS + TS recommended, Svelte 5 support, and `prettier` last so it
// disables any stylistic rule that would fight the formatter. Generated and built
// assets are never linted.
export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // `.svelte.ts` porte des runes : sans le parseur de Svelte il est lu comme
    // du JavaScript et chaque annotation de type devient une erreur de syntaxe.
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
  },
  {
    ignores: ["src/generated/", "public/", "dist/", "dist-ssr/"],
  },
);
