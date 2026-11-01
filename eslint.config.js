import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/coverage/**", "**/generated/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["client/src/**/*.{ts,tsx}", "server/{src,tests}/**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
);
