module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint/eslint-plugin",
        "prettier",
        "jest",
        "unused-imports",
        "neverthrow"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    root: true,
    env: {
        node: true,
        "jest/globals": true
    },
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": 2,
        "@typescript-eslint/no-empty-object-type": "off",
        "no-console": 1,
        "prettier/prettier": 2,
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "neverthrow/must-use-result": "error",
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "pratica",
                        importNames: ["Result"],
                        message:
                            "Please use neverthrow's Result instead of Pratica's Result."
                    }
                ]
            }
        ]
    },
    overrides: [
        {
            files: ["*.spec.ts", "*.e2e-spec.ts"],
            rules: {
                "neverthrow/must-use-result": "off"
            }
        }
    ]
}
