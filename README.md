# Pareido: Seeing the Unseen

> Pareidolia: the perception of apparently significant patterns or recognizable images, especially faces, in random or accidental arrangements of shapes and lines ([Wikipedia](https://en.wikipedia.org/wiki/Pareidolia)).

**Pareido** is an AI-powered game where you hunt for visual images in the real world. Unlike Pokémon GO, which ties invisible creatures to GPS coordinates, Pareido encourages observation and a creative view of your surroundings. 

---

## Core Mechanics

### 📷 Scan & Transform
Point your camera at any everyday object—a crumpled can, a weird stain, an interesting shadow. The AI analyzes it and transforms it into a unique character card with its own name and artwork.

### ⚡ Creativity Score
Each scan gets rated on creativity (how interesting/unusual the subject is). Higher scores mean rarer, more valuable cards. Hunt for the weird stuff.

### 🧪 Materials System
Every card contains raw materials: **Metal**, **Synthetic**, **Stone**, **Organic**, and **Fabric**. These are extracted based on what the AI detects in your original photo.

### 🔨 Deconstruct or Stabilize
After scanning, choose your path:
- **Stabilize** → Save the card to your collection
- **Deconstruct** → Break it down for materials (instead of card you get resources)

### 🔮 Merge Cards
Combine two cards from your collection to create a hybrid entity. The merged card inherits traits from both parents, gets boosted stats, and generates completely new artwork. Experiment freely.

### 🏆 Climb the Ranks
Earn XP from scans and level up. Check the global leaderboard to see where you stand among other hunters.

### 🌠 Gallery
Gather your cards into a sharable gallery, track your charecters and increase your score on leaderboard.

### 🌟 Use Resources to upgrade your cards (coming soon)
Use collected resources to augment your cards, add some visual improvements, add abilities.
Our main goal --> convert this into a game, where users can compete with their charecters and climb the leaderboard.

---

## Summary of the Flow

1.  **Exploration**: Find interesting objects in the real world.
2.  **Interaction**: Scan it.
3.  **Strategy**:
    *   Is it cool? -> **Keep it.**
    *   Is it boring? -> **Deconstruct it** for materials.
4.  **Creativity**: Use materials to **customize/upgrade** your best characters.
5.  **Leaderboard**: Post your masterpiece to the **Gallery**. Gain "Visionary Rank" as people admire your work. Prove you have the best artistic eye.

---

## Examples

The scanning and transformation process in action. Left column shows raw input photos of everyday objects; right column shows the AI-generated "Character" character cards.

| Input (Raw Scan) | AI-Generated Card (Character) |
|---|---|
| <img src="tests/assets/photo_2025-11-29%2012.45.24.jpeg" width="400"/> | <img src="tests/output/generated_image_1.jpg" width="400"/> |
| <img src="tests/assets/photo_2025-11-29%2012.45.31.jpeg" width="400"/> | <img src="tests/output/generated_image_3.jpg" width="400"/> |
| <img src="tests/assets/photo_2025-11-29%2012.45.37.jpeg" width="400"/> | <img src="tests/output/generated_image_4.jpg" width="400"/> |
| <img src="tests/assets/photo_2025-11-29%2012.45.43.jpeg" width="400"/> | <img src="tests/output/generated_image_5.jpg" width="400"/> |

---

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

