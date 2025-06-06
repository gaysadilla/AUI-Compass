# Mapping Gaps: Button → Action Component Migration

## Overview
This document summarizes the current state of property mapping between the deprecated **Button** component and the new **Action** component, based on the latest output from the component discovery tool. It highlights what can be mapped automatically, what gaps remain, and what would be needed for full automation.

---

## What the Tool Provides
- **All properties (including nested and variant-specific) are now extracted and flattened** into a single, path-prefixed map for each component.
- **Direct property comparison** is possible between Button and Action.
- **Variant context** is encoded in Action property keys (e.g., `Variants=Text and Icons..Action.Style`).

---

## What Can Be Mapped Automatically
- **Direct property matches** (e.g., `Size`, `State`, `Label` if names and types align).
- **Presence/absence of properties** (can detect missing or extra properties).
- **Default values** are available for fallback logic.

---

## Mapping Gaps & Challenges

### 1. Semantic/Intent Mapping
- Some properties have different names or are split/combined (e.g., Button's `Icon` vs. Action's `Show 'Left icon'` and `Show 'Right icon'`).
- The tool cannot infer intent or semantic equivalence (e.g., mapping `Icon=Left` to `Show 'Left icon'=true`).

### 2. Variant Logic
- Button's variants are encoded as separate properties, while Action's are often encoded in the path.
- Mapping logic must understand how Button's `Variant`, `Icon`, and `State` map to Action's variant-specific properties.

### 3. Theming/Styling Gaps
- Button's `Color` property (e.g., Black, White, Asurion Purple) is now handled by theming in Action.
- The tool cannot automatically infer that `Color=Black` should map to a theme token or be omitted.
- Other style properties (e.g., border radius, shadow) are not mapped unless exposed as properties.

### 4. Conditional/Nested Logic
- Some Action properties only exist for certain variants (e.g., icon-related properties only for `Icon Only` or `Text and Icons`).
- The tool does not generate conditional mapping logic (e.g., "if Button.Icon=Left, then set Action.Show 'Left icon'=true").

### 5. Default Values and Fallbacks
- The tool extracts default values, but does not reason about when to use them (e.g., if a Button property is missing, should the Action default be used?).
- If a Button property has no Action equivalent (besides color), the tool does not flag this for manual review.

### 6. No Human-Readable Mapping Suggestions
- The tool does not attempt to suggest or generate mapping rules (e.g., "Button.Icon=Left → Action.Show 'Left icon'=true").
- It only provides the raw data needed for you to write those rules.

---

## What Would Enable More Automation?
- A **mapping config or rules file** (e.g., JSON or JS) that encodes how Button properties map to Action properties, including:
  - Renames (e.g., `Icon` → `Show 'Left icon'`)
  - Value transforms (e.g., `Icon=Left` → `Show 'Left icon'=true`)
  - Omissions (e.g., `Color` is ignored)
  - Conditional logic (e.g., only set certain properties for certain variants)
- A **mapping engine** that uses this config to transform Button props to Action props.

---

## Summary Table

| What's Possible Automatically?         | What Needs Manual/Custom Logic?                |
|----------------------------------------|-----------------------------------------------|
| List all properties and variants       | Map semantically different properties         |
| Detect direct property matches         | Handle theming/styling changes (e.g., color) |
| Identify missing/extra properties      | Write conditional/variant mapping logic       |
| Extract default values                 | Propose human-readable mapping rules          |

---

## Next Steps
- Draft a sample mapping config for the most common property mappings.
- Build a mapping engine that uses this config.
- Highlight all Button properties that have no direct Action equivalent (besides color).

---

*This document is intended as a reference for LLMs and collaborators to discuss and design improved mapping solutions.* 