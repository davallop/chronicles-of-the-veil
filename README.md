# Chronicles of the Veil

A single-player narrative role-playing game inspired by classic tabletop adventures. The interface keeps the clarity of a deckbuilding roguelike, but the game is structured around scenes, character decisions and consequences rather than a fixed path of combat nodes.

> **Vibe coded application:** this project was created through an iterative, AI-assisted vibe coding process focused on rapidly turning narrative and gameplay ideas into a playable experience.

## Highlights

- Connected quests with setup, investigation, complication, revelation, confrontation and epilogue.
- Decisions remembered by later scenes and subsequent quests.
- Visible d20 checks using classic tabletop ability scores.
- Six classes, settings and enemy themes.
- Turn-based combat as a consequence of role-playing decisions rather than the main structure.
- Unlimited stories by default, plus three explicitly defined campaign lengths.
- Custom character setup and fully randomized story mode.
- Automatic local saving, responsive design and complete offline support.
- Entire player-facing experience in English.

## Screens and progression

Each starting setting contains three connected quest lines. Evidence, allies, betrayals and secrets discovered in earlier chapters affect later descriptions, check difficulty and available outcomes. When one quest ends, the next begins by referencing the character's previous resolution and resulting reputation.

## Play

Open `index.html` in a modern browser. No installation, build process or Internet connection is required.

If your browser restricts local files, start a server from this folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then visit <http://127.0.0.1:8765/index.html>.

## How the story works

The story is organized into connected quests rather than unrelated random encounters. Each quest follows a continuous structure:

1. A patron introduces a conflict and objective.
2. The character follows a specific lead.
3. A complication introduces a witness, guardian or rival.
4. Evidence reveals the truth behind the conflict.
5. Earlier decisions alter the final confrontation and its difficulty.
6. An epilogue records the consequences before the next quest begins.

Every scene asks what your character does. Choices may:

- change how the scene unfolds;
- reveal information or create a persistent story flag;
- call for a visible d20 ability check;
- gain or lose health, gold, experience or equipment;
- begin a conversation, rest, market visit or combat;
- lead to a narrative conclusion.

There are three quest lines for each starting setting. In longer and unlimited stories, completed quests affect the character's reputation and the introduction to the next conflict.

Violence is one possible response, not the main structure. Combat uses the existing turn-based system with visible enemy intentions, class resources, conditions, equipment and companions.

### Story length

- **Unlimited** — the default. There is no fixed number of scenes. The story continues until the character dies or reaches a narrative ending.
- **Short Tale** — finale after 12 scenes.
- **Long Adventure** — finale after 24 scenes.
- **Epic Chronicle** — finale after 40 scenes.

## Character options

- 6 classes: Warrior, Mage, Ranger, Rogue, Cleric and Druid.
- Classic ability scores: Strength, Dexterity, Constitution, Intelligence, Wisdom and Charisma.
- 6 starting settings and 6 enemy themes.
- 4 difficulty levels.
- Companions, divine patrons, starting relics and optional curses.
- Custom story setup and fully random story mode.

## Combat controls

| Key | Action |
|---|---|
| `A` | Basic attack |
| `1`–`4` | Class abilities |
| `D` | Defend |
| `Q` | Open potions |
| `Esc` | Cancel targeting or close a window |

The entire game can also be played with a mouse or touch screen.

## Technology

- Semantic HTML5
- Responsive CSS
- Vanilla JavaScript
- Browser `localStorage`
- No frameworks, external packages, build tools or backend

## Privacy

The game does not collect or transmit personal information. Saves and historical statistics remain in the player's browser through `localStorage`.

## Project structure

```text
index.html             Application entry point
styles.css            Responsive layout and visual design
js/data.js            Original combat data and content
js/story-data.js      English content, scenes and d20 checks
js/engine.js          Core state, progression and saving
js/combat.js          Turn-based combat engine
js/story.js           Narrative progression and consequences
js/ui.js              Base interface and character creation
js/ui-screens.js      Combat and supporting encounter screens
js/story-ui.js        Narrative screens and English presentation
js/main.js            Application startup and error handling
```

Progress is saved automatically in the browser's `localStorage`.
