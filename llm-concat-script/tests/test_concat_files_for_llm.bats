#!/usr/bin/env bats

# Define the script path
SCRIPT_PATH="./concat_files_for_llm.sh"

# Test if help message is displayed
@test "Show help message" {
    run bash "$SCRIPT_PATH" --help
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Usage: ./concat_files_for_llm.sh" ]]
}

# Test if the script fails when no directory is provided
@test "Fails when no directory is provided" {
    run bash "$SCRIPT_PATH" -o output.txt
    [ "$status" -ne 0 ]
    [[ "$output" =~ "Error: Directory is required." ]]
}

# Test if the script processes multiple directories provided as a comma-separated list
@test "Processes multiple directories from a comma-separated list" {
    # Set up two test directories with a file in each
    mkdir -p temp_test_dir1
    mkdir -p temp_test_dir2
    echo "file in dir1" > temp_test_dir1/file1.txt
    echo "file in dir2" > temp_test_dir2/file2.txt
    
    # Run the script with both directories passed as a comma-separated list
    run bash "$SCRIPT_PATH" -d "temp_test_dir1,temp_test_dir2" -o output.txt
    [ "$status" -eq 0 ]
    
    # Check that both files were processed and written to the output
    [ -f output.txt ]
    grep "file in dir1" output.txt
    grep "file in dir2" output.txt
    
    # Clean up
    rm -r temp_test_dir1
    rm -r temp_test_dir2
    rm output.txt
}

# Test if the script processes files in a directory
@test "Processes files in a directory" {
    mkdir -p temp_test_dir
    echo "test file content" > temp_test_dir/test.txt
    run bash "$SCRIPT_PATH" -d temp_test_dir -o output.txt
    [ "$status" -eq 0 ]
    
    [ -f output.txt ]
    grep "test file content" output.txt
    
    rm -r temp_test_dir
    rm output.txt
}

# Test if the tree command is executed correctly
@test "Executes the tree command" {
    mkdir -p temp_test_dir
    run bash "$SCRIPT_PATH" -d temp_test_dir -t "tree -a ."
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Project structure" ]]
    
    rm -r temp_test_dir
}

# Test if package.json is included when -p option is used
@test "Includes package.json in the output" {
    mkdir -p temp_test_dir
    echo '{"name": "test-package"}' > temp_test_dir/package.json
    run bash "$SCRIPT_PATH" -d temp_test_dir -p temp_test_dir/package.json -o output.txt
    [ "$status" -eq 0 ]
    
    [ -f output.txt ]
    grep '"name": "test-package"' output.txt
    
    rm -r temp_test_dir
    rm output.txt
}

# Test if files matching exclude patterns are excluded
@test "Excludes files based on patterns" {
    mkdir -p temp_test_dir
    echo "test file content" > temp_test_dir/test.txt
    echo "spec file content" > temp_test_dir/test.spec.txt
    run bash "$SCRIPT_PATH" -d temp_test_dir -o output.txt -e "spec"
    [ "$status" -eq 0 ]
    
    [ -f output.txt ]
    grep "test file content" output.txt
    ! grep "spec file content" output.txt
    
    rm -r temp_test_dir
    rm output.txt
}

# Test if debug mode logs additional information
@test "Debug mode logs additional information" {
    mkdir -p temp_test_dir
    echo "test file content" > temp_test_dir/test.txt
    run bash "$SCRIPT_PATH" -d temp_test_dir -o output.txt --debug
    [ "$status" -eq 0 ]
    
    [[ "$output" =~ "Debug mode enabled" ]]
    [[ "$output" =~ "Processing file: temp_test_dir/test.txt" ]]
    
    rm -r temp_test_dir
    rm output.txt
}
