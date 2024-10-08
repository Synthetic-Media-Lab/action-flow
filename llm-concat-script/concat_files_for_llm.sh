#!/bin/bash

# Function to show usage instructions
show_help() { 
  echo "Usage: $0 -d <directory> [-t <tree_command>] [-o <output_file>] [-p <path_to_package_json>] [--package-json-path <path_to_package_json>] [--exclude <pattern1,pattern2,...>] [--debug]"
  echo
  echo "Options:"
  echo "  -d, --directory              The directory or comma-separated list of directories to search files in (required)"
  echo "  -t, --tree                   The tree command to show the project structure (optional)"
  echo "  -o, --output                 The file to write the output to (optional, default is stdout)"
  echo "  -p, --package-json-path      Specify the path to package.json to include in the output (optional)"
  echo "  -e, --exclude                Exclude files containing any of these comma-separated patterns in their name (optional)"
  echo "  --debug                      Enable debug mode for additional logging"
  echo "  -h, --help                   Display this help message"
}

# Initialize variables
output=""
package_json_path=""
exclude_patterns=()
debug_mode="false"
directories=()

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
        -d)
            # Split comma-separated list into an array
            IFS=',' read -ra directories <<< "$2"
            echo "Directories set to: ${directories[*]}"
            shift 2 ;;
        -t)
            tree_command="$2"
            echo "Tree command set to: $tree_command"
            shift 2 ;;
        -o)
            output="$2"
            echo "Output file set to: $output"
            shift 2 ;;
        -p|--package-json-path)
            package_json_path="$2"
            echo "Package.json path set to: $package_json_path"
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

# Check if at least one directory is provided
if [ "${#directories[@]}" -eq 0 ]; then
  echo "Error: Directory is required."
  show_help
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

# Include package.json contents if the path is specified
if [ -n "$package_json_path" ]; then
  debug "Looking for package.json at: $package_json_path"
  if [ -f "$package_json_path" ]; then
    write_output "package.json:"
    write_output '"""'
    package_content=$(cat "$package_json_path")
    write_output "$package_content"
    write_output '"""'
    write_output "\n"
  else
    echo "Warning: package.json not found at the specified path: $package_json_path"
  fi
fi

# Process each directory
for directory in "${directories[@]}"; do
  debug "Processing directory: $directory"
  
  # Check if the directory exists
  if [ ! -d "$directory" ]; then
    echo "Error: Directory '$directory' does not exist."
    exit 1
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
done
