#!/bin/bash

# Function to show usage instructions
show_help() { 
  echo "Usage: $0 -d <directory> [-t <tree_command>] [-o <output_file>] [--include-package-json] [--exclude <pattern1,pattern2,...>] [--debug]"
  echo
  echo "Options:"
  echo "  -d, --directory              The directory to search files in (required)"
  echo "  -t, --tree                   The tree command to show the project structure (optional)"
  echo "  -o, --output                 The file to write the output to (optional, default is stdout)"
  echo "  -p, --include-package-json   Include package.json from the root directory in the output (optional)"
  echo "  -e, --exclude                Exclude files containing any of these comma-separated patterns in their name (optional)"
  echo "  --debug                      Enable debug mode for additional logging"
  echo "  -h, --help                   Display this help message"
}

# Get the script's directory and navigate to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1  # Go one level up to the project root

# Initialize variables
output=""
include_package_json="false"
exclude_patterns=()
debug_mode="false"

# Function to handle debug output
debug() {
  if [ "$debug_mode" = "true" ]; then
    echo "[DEBUG] $1"
  fi
}

# Parse arguments using flags
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --debug)
            debug_mode="true"
            echo "Debug mode enabled"
            shift ;;
        -p)
            include_package_json="true"
            echo "Include package.json set"
            shift ;;
        -d)
            directory="$2"
            echo "Directory set to: $directory"
            shift 2 ;;
        -t)
            tree_command="$2"
            echo "Tree command set to: $tree_command"
            shift 2 ;;
        -o)
            output="$2"
            echo "Output file set to: $output"
            shift 2 ;;
        -e)
            IFS=',' read -ra exclude_patterns <<< "$2"
            echo "Exclude patterns set to: ${exclude_patterns[*]}"
            shift 2 ;;
        -h|--help)
            show_help
            exit 0 ;;
        *)
            echo "Unknown parameter passed: $1"
            show_help
            exit 1 ;;
    esac
done

# Check if the directory is provided
if [ -z "$directory" ]; then
  echo "Error: Directory is required."
  show_help
  exit 1
fi

# Check if the directory exists
if [ ! -d "$directory" ]; then
  echo "Error: Directory does not exist."
  exit 1
fi

# Function to write or echo output depending on whether output file is specified
write_output() {
  if [ -n "$output" ]; then
    echo "$1" >> "$output"
    debug "Writing to output file: $output"
  else
    echo "$1"
  fi
}

# If output file is specified, clear the file at the beginning
if [ -n "$output" ]; then
  > "$output"  # Clear the file if it exists, or create a new one
  debug "Cleared output file: $output"
fi

# Print the project structure from the tree command if provided
if [ -n "$tree_command" ]; then
  debug "About to execute tree command: $tree_command"
  
  if ! command -v tree > /dev/null; then
    echo "Error: 'tree' command not found. Please install 'tree' or provide a valid tree command."
    exit 1
  fi

  write_output "Project structure:"
  write_output '"""'
  
  # Use eval to run the command safely
  tree_output=$(eval "$tree_command" 2>/dev/null)

  # Check if the tree command failed
  if [ $? -ne 0 ]; then
    echo "Error: The tree command failed to execute."
    exit 1
  fi

  write_output "$tree_output"
  write_output '"""'
  write_output "\n"  # Add a newline after the tree structure
fi

# Include package.json contents if the flag is enabled
if [ "$include_package_json" = "true" ]; then
  package_file="$PWD/package.json"  # Look for package.json in the root of the project
  debug "Looking for package.json at: $package_file"
  if [ -f "$package_file" ]; then
    write_output "package.json:"
    write_output '"""'
    package_content=$(cat "$package_file")
    write_output "$package_content"
    write_output '"""'
    write_output "\n"
  else
    echo "Warning: package.json not found in the root directory."
  fi
fi

# Recursively find all files in the directory and concatenate the content
find "$directory" -type f -print0 | while IFS= read -r -d '' file; do
  debug "Processing file: $file"
  
  # Exclude files that match any of the exclude patterns
  for pattern in "${exclude_patterns[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      debug "Skipping file: $file (matched exclude pattern: $pattern)"
      continue 2  # Skip this file and move to the next one 
    fi
  done

  # Check if the file is readable (skip binary files)
  if file "$file" | grep -q text; then
    debug "Including file: $file"
    # Print the file name, the """ boundary, and then the content
    write_output "$file:"
    write_output '"""'
    file_content=$(cat "$file")
    write_output "$file_content"
    write_output '"""'
    write_output "\n"  # Add a newline between sections for better readability
  else
    debug "Skipping non-text file: $file"
  fi
done
