import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsEslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],
    languageOptions: {
      parser: tsParser, // Use @typescript-eslint/parser for TypeScript
      parserOptions: {
        ecmaVersion: "latest", // Support modern ECMAScript syntax
        sourceType: "module", // Use ES modules
        ecmaFeatures: { jsx: true }, // Enable JSX
      },
      globals: globals.browser, // Add browser globals
    },
    plugins: {
      "@typescript-eslint": tsEslint, // Add TypeScript plugin
      react: pluginReact, // Add React plugin
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tsEslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off", // Disable for React 17+
    },
  },
];