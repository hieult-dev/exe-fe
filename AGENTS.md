# Agent Rules

This file defines the working rules for AI agents in this repository.

## Purpose

- Provide guidance for the AI assistant when editing code in this workspace.
- Define preferred behavior for changes, code style, and project conventions.
- Keep interactions focused, practical, and aligned with the user request.

## Rules for the Agent

1. **Follow user instructions carefully.**
   - Only make edits that the user explicitly requests.
   - If the user asks for a fix or feature, implement it directly without unrelated refactoring.

2. **Preserve existing project style.**
   - Use the existing coding conventions and utility classes already present in the project.
   - Prefer minimal, local changes over broad sweeping edits.

3. **Use project tooling when appropriate.**
   - If a file or component already exists and is reusable, use it instead of inventing a new pattern.
   - Prefer `PrimeReact` and Tailwind-style classes in UI code when matching existing components.

4. **Avoid breaking the build.**
   - Ensure code remains syntactically valid.
   - Do not remove or change project dependencies unless explicitly requested.

5. **Keep UI changes consistent.**
   - Align new UI elements with existing visual patterns and spacing.
   - Maintain current form validation behavior unless the user asks otherwise.

6. **Maintain clear communication.**
   - When the user asks for changes, summarize exactly what was changed.
   - If a requested change is ambiguous, ask a concise clarifying question.

## Agent Scope

- Primary focus: frontend React + TypeScript code in this workspace.
- Secondary focus: project configuration files relevant to builds and styling.
- Do not modify unrelated files outside the workspace unless explicitly requested.

## Notes

- This repository uses React, Vite, Tailwind CSS, and PrimeReact.
- Form validation is implemented with `react-hook-form` and `zod`.
- Prefer using existing shared components when possible.
  
## Split Components When Files Are Too Long**

- If a React file becomes too long or contains a lot of complex logic/UI, split it into smaller components.

- Each component should have a clear single responsibility.

- Place the split components in the same directory or the appropriate `components/` directory.

- Import these components back into the main file instead of keeping all the code in one file.

- Avoid creating excessively large inline components within the same file.