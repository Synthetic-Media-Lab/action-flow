module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        // Enforce type to be always lowercase
        "type-case": [2, "always", "lower-case"],

        // Allow scope to be optional, but if present, it must be lowercase
        "scope-case": [2, "always", "lower-case"],
        "scope-empty": [0], // 0 means this rule is turned off, making the scope optional

        // Enforce subject to start with a lowercase letter
        "subject-case": [2, "always", ["lower-case"]],

        // Enforce that the subject does not end with a full stop
        "subject-full-stop": [2, "never", "."]
    }
}
