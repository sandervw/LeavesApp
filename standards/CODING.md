# Coding Guide

## General Principle

Write code like you're explaining to a smart but literal colleague. Popular languages, explicit types, descriptive names, standard patterns, and helpful documentation all dramatically improve LLM effectiveness. Keep files under ~300–400 lines and functions under ~30–40 lines.

## 1. Syntax Preferences

- Use **clean, conventional syntax**.
- Use **popular patterns** (like standard library usage) over exotic approaches.
- Prefer **small, single-purpose functions**. One clear responsibility per function.
- Prefer **explicit structure**: small modules, clear imports, and clear entry points.

## 2. Paradigms & Patterns

- Use **Standard patterns** (MVC, Repository, Factory).
- Use **Explicit structure** over clever abstractions.
- Use **Composition over deep inheritance** (easier to trace).

## 3. Types

- Use **Explicit types** over inferred/implicit.

## 4. Variable Names

- Use **Full descriptive names** over abbreviations or acronyms.
- `userAuthentication` beats `usrAuth` or `ua`.
- **Exception:** universally understood abbreviations (`id`, `url`, `api`).
- **JavaScript/TypeScript/Java**: camelCase
- **Constants, enums, config values**: SCREAMING_SNAKE_CASE

## 6. Documentation & Comments

- Always use **JSDoc/docstrings** or equivalent.
- Provide **machine-readable artifacts** alongside code (OpenAPI/Swagger, JSON Schema, SQL DDL).
- Comment Strategy:
  - **Why, not what**: Good comments explain intent/decisions
  - **Complex logic**: Deserves explanation
  - **Type hints/JSDoc**: Always beneficial

## 7. Languages & Stacks by Area

- **Frontend**: React
- **Backend**: Node.js + TypeScript
- **Database/Infra**: MongoDB
