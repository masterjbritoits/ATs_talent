module.exports = [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "storage/**", "prisma/migrations/**"]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  }
];
