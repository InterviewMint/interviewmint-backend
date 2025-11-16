export default {
  env: { node: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "eslint-config-prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error"
  }
};
