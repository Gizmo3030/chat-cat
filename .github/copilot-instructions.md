- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

## Execution Guidelines

### Progress Tracking
- Use the manage_todo_list tool to mirror this checklist.
- Mark items complete as soon as the related work is finished.
- Review the current todo list status before starting a new step.

### Communication Rules
- Keep explanations concise and avoid dumping full command output.
- Mention when a step is skipped (e.g., "No extensions needed").
- Describe the project structure only when asked.

### Development Rules
- Use `.` as the working directory unless the user specifies otherwise.
- Avoid adding media or placeholders unless specifically requested.
- Prefer dedicated tools (apply_patch, create_file, etc.) over shell edits.
- Follow any extra rules returned by project setup helpers.

### Folder Creation Rules
- Treat the current directory as the project root.
- Use `.` when running CLI scaffolding commands.
- Only create new folders when explicitly required (besides `.vscode` for tasks).

### Extension Installation Rules
- Install only the extensions listed by `get_project_setup_info`.

### Project Content Rules
- Default to a "Hello World" project if the user gives no specs.
- Avoid adding unnecessary links or integrations.
- Ensure every generated component supports the requested workflow.
- Ask for clarification when a feature is assumed but unconfirmed.

### Task Completion Rules
- Finish when the project scaffolds and compiles without errors.
- Confirm that `.github/copilot-instructions.md` and `README.md` exist and are current.
- Provide launch/debug instructions to the user before handing off.

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
