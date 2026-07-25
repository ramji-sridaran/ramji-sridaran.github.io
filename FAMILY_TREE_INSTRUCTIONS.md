# Family Tree Design Specification

> This document is the single source of truth for the design, layout, interaction, and data standards of the family tree. Any future implementation or modification should follow these guidelines unless this document is updated.

---

# Governance

- This document defines the expected behavior of the family tree.
- Future code or data changes should follow these standards.
- If implementation differs from this specification, update the implementation rather than introducing inconsistent behavior.
- Favor readability, consistency, and predictability over compact layouts or visual complexity.

---

# Overall Goal

Create a visually clean, intuitive, professional, and easy-to-navigate family tree that works well for both small and large families.

Primary objectives:

- Easy to understand at first glance.
- Minimal visual clutter.
- Consistent layout.
- Stable positioning.
- Responsive interaction.
- Accessible to all users.

---

# Layout Priority

When layout constraints conflict, resolve them in the following order:

1. Keep spouses together.
2. Keep children directly below their parents.
3. Keep generations aligned horizontally.
4. Avoid crossing relationship lines.
5. Preserve existing branch positions.
6. Minimize excessive whitespace.
7. Minimize unnecessary tree width or height.

---

# Data Integrity

The underlying data should always satisfy the following rules:

- Every person must have a unique identifier.
- Relationship links must reference valid people.
- Duplicate spouse relationships should not exist.
- Duplicate parent-child relationships should not exist.
- A person cannot be their own ancestor.
- Circular relationships must never be created.
- Missing optional information should never prevent rendering.

If invalid data is detected:

- Render all valid portions of the tree.
- Ignore invalid relationships.
- Log warnings where appropriate.
- Never allow rendering to fail completely.

---

# Layout Rules

- Keep spouses together at all times.
- Spouse tiles should always appear adjacent with a clear visual connection.
- Never separate couples across different rows unless absolutely unavoidable.
- Children should always appear directly beneath their parent(s).
- Maintain consistent generation levels.
- Members of the same generation should align horizontally whenever practical.
- Minimize crossing relationship lines.
- Maintain generous spacing between unrelated family groups.
- Prevent overlapping nodes or text.
- Keep the overall structure visually balanced.
- The tree should flow from ancestors at the top toward descendants at the bottom.

---

# Stability Rules

Adding new members should cause minimal movement of existing nodes.

Whenever possible:

- Preserve existing branch positions.
- Preserve generation alignment.
- Avoid unnecessary rearrangement.
- Insert new members with minimal disruption.

Users should not feel that the tree has been completely reorganized after small edits.

---

# Family Grouping

Each immediate family (parents and their children) should share a common visual identity.

Guidelines:

- Assign one primary color per nuclear family.
- Preserve the same family color throughout the tree.
- Adjacent families should never share identical colors whenever possible.
- Reuse colors only after maximizing visual separation.

Color should assist understanding, never replace it.

---

# Color Guidelines

Use soft, professional colors.

Preferred palette:

- Soft Blue
- Sage Green
- Dusty Purple
- Warm Beige
- Muted Teal
- Peach
- Lavender
- Light Olive
- Soft Coral
- Slate Blue

Avoid:

- Neon colors
- Highly saturated colors
- Excessive gradients
- Heavy shadows

Maintain sufficient contrast for readability.

---

# Visual Consistency

Maintain a consistent appearance throughout the tree.

All person tiles should have:

- Identical dimensions
- Consistent spacing
- Uniform typography
- One font family
- Subtle rounded corners
- Consistent connector thickness
- Minimal visual decoration

Favor simplicity over decoration.

---

# Information Display

Each person tile should display only essential information.

Recommended fields:

- Full name
- Birth year (if available)
- Death year (if applicable)
- Optional profile photo
- Optional gender indicator

Avoid overcrowding.

Additional information should appear in a details panel, tooltip, or popup rather than inside the tile.

If no profile photo exists:

- Display initials inside the avatar placeholder.

---

# Relationship Display

Relationship types should be visually distinguishable.

Supported relationships include:

- Marriage
- Parent-child
- Adoption
- Step relationships
- Unknown relationships
- Multiple marriages

Guidelines:

- Marriage connectors should differ from parent-child connectors.
- Adopted children should use a distinct connector style.
- Step relationships should use a different visual style.
- Unknown relationships should be indicated subtly.
- Multiple spouses should remain aligned logically within the same generation.

Avoid labels such as "Unmarried" unless explicitly requested.

---

# Readability

The tree should remain understandable regardless of size.

Guidelines:

- Minimize long connector lines.
- Prevent overlapping elements.
- Maintain consistent spacing.
- Preserve balance across branches.
- Keep text readable when zoomed out.

---

# Navigation

Interactive trees should support:

- Smooth panning
- Smooth zooming
- Expand/collapse branches
- Search by name
- Auto-focus search results
- Center the selected member
- Highlight immediate relatives
- Preserve layout when expanding or collapsing branches

Selecting a person should:

- Highlight the selected tile.
- Highlight parents.
- Highlight spouse(s).
- Highlight children.
- Slightly dim unrelated branches.

Animations should feel smooth but subtle.

Recommended duration:

150–250 ms.

---

# Mobile Experience

On smaller screens:

- Preserve generation order.
- Allow horizontal scrolling.
- Maintain readable tile sizes.
- Never reduce font size below readable levels.
- Keep interactions consistent with desktop.

---

# Accessibility

The tree should be usable by everyone.

Requirements:

- Maintain sufficient text contrast.
- Use colorblind-friendly palettes.
- Never rely solely on color to communicate relationships.
- Support keyboard navigation.

Recommended shortcuts:

- Arrow Keys → Navigate
- Enter → Select
- Escape → Clear selection

---

# Empty & Edge Cases

The layout should render correctly for:

- Single individual
- Couple only
- Single parent
- Unknown parents
- No children
- Multiple spouses
- Large sibling groups
- Missing optional information

Unknown parents should not require placeholder nodes.

---

# Performance Goals

The tree should remain responsive for:

- Small families
- Medium families
- Large family trees (200+ members)

Avoid unnecessary full-tree recalculations when only one branch changes.

---

# URL Navigation

Support direct links to individuals.

Example:

```
/family?id=person-id
```

Opening a direct link should:

- Center the selected person.
- Apply an appropriate zoom level.
- Highlight the selected member.
- Open their details if applicable.

---

# Printing

When printed:

- Remove interactive controls.
- Preserve layout.
- Preserve colors.
- Use a white background.
- Fit the page where practical.

---

# Future Extensibility

The design should support future additions without requiring structural redesign.

Possible future fields include:

- Birth location
- Marriage date
- Occupation
- Biography
- Documents
- Additional photographs

---

# Root Person

Support one configurable focus person.

The initial view should preferably center on this individual rather than the geometric center of the tree.

---

# Aesthetic Principles

The family tree should always feel:

- Clean
- Modern
- Balanced
- Professional
- Spacious
- Symmetrical whenever practical

Prefer clarity over visual effects.

Every design decision should improve understanding rather than decoration.

---

# Quality Checklist

Before considering the tree complete, verify:

- Couples remain together.
- Children connect to the correct parents.
- Relationship lines do not cross unnecessarily.
- Family colors are consistent.
- Text is readable.
- Spacing is uniform.
- Layout is balanced.
- Accessibility requirements are met.
- Mobile experience remains usable.
- Existing branches remain stable after edits.
- Invalid data does not break rendering.
- The tree is immediately understandable to someone seeing it for the first time.

---

# Current Implementation Notes

Current supported features include:

## Branch Controls

- Select a person tile.
- Use **Collapse [Name]** to hide descendants.
- Use **Expand All** to restore all hidden branches.

## Relationship Hover

- Hover over a relationship connector to display a contextual description.
- Related person tiles are highlighted while hovering.

## Supported Optional Person Fields

The `people` model currently supports:

- `birthYear`
- `deathYear`
- `gender`

## Supported Relationship Variants

The `links` model currently supports:

- `variant: "adopted"`
- `variant: "step"`
- `variant: "unknown"`

## Multiple Marriages

Multiple spouse relationships are supported and remain aligned within the same generation whenever possible.

## Current Display Policy

Marital-status labels such as **"Unmarried"** are intentionally omitted unless explicitly requested.