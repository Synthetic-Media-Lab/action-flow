module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        // Enforce type to be always lowercase
        "type-case": [2, "always", "lower-case"],

        // Allow scope to be optional, but if present, it must be lowercase
        "scope-case": [2, "always", "lower-case"],
        "scope-empty": [0], // Scope is optional

        // Enforce subject to start with a lowercase letter and disallow full stops at the end
        "subject-case": [2, "always", ["lower-case"]],
        "subject-full-stop": [2, "never", "."], // Disallow period at the end of the subject

        // Enforce that "revert" commits follow the same rules
        "header-case": [2, "always", "lower-case"]
    }
}
