# WarrenGami SEL Toolkit - URL Structure

## Overview
The toolkit now uses clean, user-friendly URLs that abstract the file-based navigation from users. Instead of seeing file names like `Page 2 - Welcome to Your Interactive SEL Toolkit.html`, users now see clean URLs like `toolkit.html?view=guide&page=2`.

## URL Structure

### Main Dashboard
- **URL**: `dashboard.html` (renamed from `(Table of Contents).html`)
- **Description**: The central hub for all toolkit resources

### Guide Pages
- **URL Pattern**: `toolkit.html?view=guide&page=X`
- **Examples**:
  - `toolkit.html?view=guide&page=1` → Page 1: Cover
  - `toolkit.html?view=guide&page=2` → Page 2: Welcome
  - `toolkit.html?view=guide&page=3` → Page 3: How Dice Work
  - `toolkit.html?view=guide&page=4` → Page 4: Emotion Exploration
  - `toolkit.html?view=guide&page=5` → Page 5: Social Scenarios
  - `toolkit.html?view=guide&page=6` → Page 6: Family Connection
  - `toolkit.html?view=guide&page=7` → Page 7: Assessment & Reflection
  - `toolkit.html?view=guide&page=8` → Page 8: Advanced Concepts
  - `toolkit.html?view=guide&page=9` → Page 9: Curriculum Integration
  - `toolkit.html?view=guide&page=10` → Page 10: Digital Resources
  - `toolkit.html?view=guide&page=11` → Page 11: Glossary & Index

### Dice Printables
- **URL Pattern**: `toolkit.html?view=dice&type=X`
- **Examples**:
  - `toolkit.html?view=dice&type=emotions` → Emotions & Feelings Dice
  - `toolkit.html?view=dice&type=empathy` → Empathy & Kindness Dice
  - `toolkit.html?view=dice&type=friendship` → Friendship & Social Skills Dice
  - `toolkit.html?view=dice&type=coping` → Coping Strategies Dice
  - `toolkit.html?view=dice&type=problem-solving` → Problem Solving Dice
  - `toolkit.html?view=dice&type=self-awareness` → Self-Awareness Dice
  - `toolkit.html?view=dice&type=blank` → Blank Dice Template

### Scenario Cards
- **URL Pattern**: `toolkit.html?view=scenarios&page=X`
- **Examples**:
  - `toolkit.html?view=scenarios` → Scenario Card Instructions
  - `toolkit.html?view=scenarios&page=1` → Scenario Cards (1-6)
  - `toolkit.html?view=scenarios&page=2` → Scenario Cards (7-12)
  - `toolkit.html?view=scenarios&page=3` → Scenario Cards (13-18)
  - `toolkit.html?view=scenarios&page=4` → Scenario Cards (19-24)
  - `toolkit.html?view=scenarios&page=5` → Scenario Cards (25-30)
  - `toolkit.html?view=scenarios-blank` → Blank Scenario Cards

### Other Resources
- **URL Pattern**: `toolkit.html?view=classroom`
- **Examples**:
  - `toolkit.html?view=classroom` → Classroom Management Tools

## Benefits

1. **User-Friendly**: URLs are descriptive and meaningful instead of showing file names
2. **Professional**: The application feels more like a cohesive web app rather than a folder of files
3. **Maintainable**: Easy to reorganize content without breaking URLs
4. **SEO-Friendly**: Clean URLs are better for search engines
5. **Consistent**: All navigation goes through the same routing system

## Implementation

The routing is handled by `toolkit.html`, which:
1. Parses URL parameters
2. Maps them to the appropriate file
3. Redirects to the actual page
4. Maintains the global navigation header across all pages

## Backward Compatibility

All existing file-based links continue to work, but new navigation uses the clean URL structure. The global header ensures consistent navigation regardless of how users arrive at pages. 