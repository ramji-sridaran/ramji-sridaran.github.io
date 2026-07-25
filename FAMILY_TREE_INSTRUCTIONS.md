# Family Tree Instructions

This file is the permanent reference for maintaining the family tree.

## File locations

- Data file: `js/family-tree-data.js`
- Tree behavior: `js/family-tree.js`
- Page: `family-tree.html`
- Styles: `css/family-tree.css`
- Photos folder: `Resources/images/family/`

## How to add or update a person

1. Add a person object inside `people` in `js/family-tree-data.js`.
2. Use a unique `id` (kebab-case, no spaces).
3. Add/adjust `x` and `y` for placement.
4. Optional: add `photo`, `notes`, and `tags`.

Example:

```js
{
  id: "ananya",
  name: "Ananya",
  relation: "Daughter",
  photo: "Resources/images/family/ananya.jpg",
  x: 3200,
  y: 2600,
  notes: "Child of Ramji and Bhargavi",
  tags: ["daughter", "child"]
}
```

## How to link relationships

Add links in `links` array.

Supported `type` values:
- `parent`
- `spouse`
- `sibling`
- `twin`
- `cousin`

Examples:

```js
{ from: "ramji", to: "ananya", type: "parent" },
{ from: "bhargavi", to: "ananya", type: "parent" },
{ from: "ananya", to: "someone", type: "spouse" }
```

## Search behavior

Search matches against:
- `name`
- `relation`
- `notes`
- `tags`

So for better search, keep `relation/notes/tags` meaningful.

## Input format to share future changes

Use simple sentences like:

- `Name - relationship details`
- `A is spouse of B`
- `A is child of B and C`
- `A is sibling of B`
- `A is twin of B`

Example:

`Kavin - son of Ramji and Bhargavi; younger brother of Adhwith`

## Update checklist

1. Add/update person in `people`.
2. Add/update relationship links in `links`.
3. Add photo under `Resources/images/family/` and set `photo` path.
4. Use **Reorganise** in UI if needed and drag cards to improve layout.

## Latest lineage updates

- Santhi is spouse of `Sridaran` (and Sridaran is spouse of Santhi).
- Santhi's father: `Ranga Rao`
- Santhi's mother: `Sakku Bhai`
- Both are linked as parents of:
  - `Santhi`
  - `Murali` (`murali-santhi`)
  - `Anathapadmanabhan`
  - `Sudha`
