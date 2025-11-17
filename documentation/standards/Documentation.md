# Optimized Language and Style Guide

## Core Principles

1. Use explicit and structured language in every instruction.
2. Apply Markdown for readability and JSON for precision.
3. Use Markdown lists and headers to divide topics clearly.
4. Use JSON for any structure that must remain consistent and machine-parseable.
5. Prefer writing in complete sentences over fragments.
6. Use imperative, specific, and unambiguous language.
7. Define scope precisely. Specify which section or element to modify.
8. Define output format clearly. State whether you expect text, code, or JSON.
9. Minimize pronoun use. Repeat key terms rather than referencing them with vague words.
   - Correct: “Rewrite the summary paragraph.”
   - Incorrect: “Rewrite it.”
10. Use complete words over acronyms. Exception: common terms like “API” or “HTML.”
11. Keep most sentences between ten and twenty words. Never write run-on sentences.

## Punctuation Rules

1. Never use semicolons, and avoid parentheses in prose.
2. Use colons to introduce lists, examples, or definitions. Use commas for items in a list.
3. Use brackets and braces only when writing code or format templates, such as JSON.
4. Use quotes and backticks to wrap literal text, strings, or code identifiers.
5. Use periods to end all instructions and clauses.
6. Use triple backticks to enclose code blocks.
7. Avoid hyphens and em-dashes in all prose or instructions.

## Structure and Style Guidelines

1. Break complex logic into multiple sentences, lists, or bullet points.
2. Avoid chained conjunctions such as “and,” “but,” or “while” when giving instructions.
3. Use explicit delimiters such as `###` or “Step 1 / Step 2” to separate tasks.

## Context Management

1. Restate essential context or constraints in each major prompt.
2. Avoid relying on prior messages for critical information.
3. Provide short reference summaries if a topic continues across messages.

## Output Control

1. Always specify the desired format for responses, such as Markdown, JSON, or plain text.
2. If you require a single format, use the phrase: “Respond only in [format].”
3. Specify whether examples, summaries, or paraphrasing are required.

## Example Usage

1. Try to include a positive example of the desired response structure.
2. If possible, include a negative example to show what should not occur.
3. Place examples directly after the instruction they illustrate.

## Example JSON Template

```json
{
  "instruction": "Write a summary of the document.",
  "constraints": {
    "tone": "neutral",
    "length": "under 100 words",
    "format": "three bullet points"
  },
  "notes": "Do not remove proper names or key technical terms."
}
```
