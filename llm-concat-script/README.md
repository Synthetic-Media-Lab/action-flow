# LLM Concatenation Script

This script concatenates files and outputs them in a format suitable for large language models (LLMs). It includes project structure and optionally `package.json`.

## How to Use

1. **Copy the Script:**

    - Move the `llm-concat-script` directory to the root of your project.

2. **Run the Script:**

    ### Example 1: Running From the Root Directory

    - Run the script from the root directory of your project:
        ```bash
        ./llm-concat-script/concat_files_for_llm.sh \
          -d "src/public/actions/action-a,src/private/google-sheet" \
          -t "tree -I 'node_modules|dist|coverage|storybook-static|sanity|.git' -L 5 | grep -v './public'" \
          -o llm_output.txt \
          -e "e2e,spec" \
          -p "package.json"
        ```

    ### Example 2: Running From the Script's Own Directory

    - If you are inside the `llm-concat-script` directory, run it like this:
        ```bash
        ./concat_files_for_llm.sh \
            -d "../src/public/actions/action-a,../src/private/google-sheet" \
            -t "tree -a ../ -I 'node_modules|dist|coverage|storybook-static|sanity|.git' -L 5 | grep -v './public'" \
            -o llm_output.txt \
            -e "e2e,spec" \
            -p "../package.json"
        ```

    **Important**: Ensure that paths are relative to where the script is run. If you are in the root directory, provide paths relative to the root; if you are in the script's directory, adjust the paths accordingly.

3. **VSCode Task Integration:**

    - Add a task in `.vscode/tasks.json` to run the script from VSCode:
        ```json
        {
            "version": "2.0.0",
            "tasks": [
                {
                    "label": "Run concat_files_for_llm",
                    "type": "shell",
                    "command": "./llm-concat-script/concat_files_for_llm.sh",
                    "args": [
                        "-d",
                        "src/public/actions/action-a,src/private/google-sheet",
                        "-t",
                        "bash -c \"tree -a . -I \\\"node_modules|dist|coverage|storybook-static|sanity|.git\\\" -L 5 | grep -v './public'\"",
                        "-o",
                        "llm_output.txt",
                        "-e",
                        "e2e",
                        "-p",
                        "package.json"
                    ],
                    "problemMatcher": [],
                    "group": {
                        "kind": "build",
                        "isDefault": true
                    },
                    "options": {
                        "shell": {
                            "executable": "/bin/zsh",
                            "args": ["-l", "-c"]
                        }
                    },
                    "presentation": {
                        "reveal": "silent",
                        "focus": false,
                        "panel": "dedicated"
                    }
                }
            ]
        }
        ```

4. **VSCode Extension for Automation:**

    - To automatically run the task on file save, use the [Trigger Task on Save](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave) extension.
    - Add the following configuration in `.vscode/settings.json`:

        ```json
        {
            "triggerTaskOnSave.tasks": {
                "Run concat_files_for_llm": ["*"]
            }
        }
        ```

    - This will trigger the task to run whenever you save any file.

## Options

-   `-d, --directory`: The directory or comma-separated list of directories to search files in (required).
-   `-t, --tree`: The tree command to show the project structure (optional).
-   `-o, --output`: The file to write the output to (optional, default is stdout).
-   `-p, --package-json-path`: Specify the path to `package.json` to include it in the output (optional).
-   `-e, --exclude`: Exclude files containing any of these comma-separated patterns in their name (optional).
-   `--debug`: Enable debug mode for additional logging.
-   `-h, --help`: Display the help message.

## Running Tests

### How to Install Bats (Bash Automated Testing System)

1. **Homebrew (MacOS/Linux):**

```bash
brew install bats-core
```

2. **Git Clone (Linux/Windows):**

```bash
git clone https://github.com/bats-core/bats-core.git
cd bats-core
./install.sh /usr/local
```

3. **Verify Installation:**

```bash
bats --version
```

### Run tests:

To run the tests, navigate to the `llm-concat-script` directory and use the following command:

```bash
bats tests/test_concat_files_for_llm.bats
```

**Example Output:**

```
test_concat_files_for_llm.bats
 ✓ Show help message
 ✓ Fails when no directory is provided
 ✓ Processes multiple directories from a comma-separated list
 ✓ Processes files in a directory
 ✓ Executes the tree command
 ✓ Includes package.json in the output
 ✓ Excludes files based on patterns
 ✓ Debug mode logs additional information

8 tests, 0 failures
```
