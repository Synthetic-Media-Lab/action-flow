# LLM Concatenation Script

This script concatenates files and outputs them in a format suitable for large language models (LLMs). It includes project structure and optionally `package.json`.

## How to Use

1. **Copy the Script:**

    - Move the `llm-concat-script` directory to the root of your project.

2. **Run the Script:**

    - Run the script manually from the terminal:
        ```bash
        ./llm-concat-script/concat_files_for_llm.sh \
          -d <directory> \
          -t "tree -a -I 'node_modules|dist|coverage|storybook-static|sanity|.git' -L 5" \
          -o <output_file> \
          -e "e2e,spec" \
          -p
        ```

3. **VSCode Task Integration:**

    - Add a task in `.vscode/tasks.json`:
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
                        "src/public/actions/action-a",
                        "-t",
                        "tree -a -I 'node_modules|dist|coverage|storybook-static|sanity|.git' -L 5 | grep -v './public'",
                        "-o",
                        "llm_output.txt",
                        "-e",
                        "e2e,spec",
                        "-p"
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

-   `-d, --directory`: The directory to search files in (required).
-   `-t, --tree`: The tree command to show the project structure (optional).
-   `-o, --output`: The file to write the output to (optional, default is stdout).
-   `-p, --include-package-json`: Include `package.json` from the root directory in the output (optional).
-   `-e, --exclude`: Exclude files containing any of these comma-separated patterns in their name (optional).
-   `--debug`: Enable debug mode for additional logging.
-   `-h, --help`: Display the help message.

## Example

```bash
./llm-concat-script/concat_files_for_llm.sh \
  -d src/public/actions/action-a \
  -t "tree -I 'node_modules|dist|coverage|sanity' -L 5" \
  -o llm_output.txt \
  -e "e2e,spec" \
  -p
```
