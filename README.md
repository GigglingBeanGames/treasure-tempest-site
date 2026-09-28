# Treasure Tempest — browser edition

This is the upload-ready, static version. The game, all sixteen saved power bots,
images, music, and sound effects run in the browser. No Python installation,
backend service, npm installation, or build command is required to play.

## Open locally in VS Code

1. Extract `treasure-tempest-browser.zip`.
2. Open the extracted folder in VS Code. Its top level contains `index.html`.
3. Right-click that `index.html` and select **Open with Live Server**.
4. Start a voyage. The first game briefly loads the bundled engine.

Use Live Server or another static HTTP server; double-clicking the HTML file
(`file://`) does not support the worker and module loading the game needs.

## Replace the existing GitHub Pages site

1. Keep a copy of your existing repository before replacing its website files.
2. Copy the **contents** of this folder into the repository's publishing folder,
   replacing the old website files. `index.html` must be at the publishing root,
   not inside an extra `treasure-tempest-browser` folder.
3. Include `assets`, `runtime`, `engine.zip`, all JavaScript/CSS files, and
   `.nojekyll`. Upload the extracted files, not the outer ZIP archive.
4. Preserve your existing `CNAME` file and custom-domain configuration for
   `treasuretempest.com`.
5. Commit and push. In repository **Settings → Pages**, a simple setup is
   **Deploy from a branch**, your publishing branch, and **/(root)**.
   If your existing site publishes from `/docs`, put these files there instead.

GitHub Desktop is convenient for uploading the entire folder, including hidden
files. No hosting change has been made automatically.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Saved games and compatibility

A voyage saves after each choice in this browser's local storage. Use **Resume
voyage** on the home screen after refreshing or reopening the site. Saves are
specific to the browser and website address; localhost saves do not transfer to
your public domain. Clearing site data removes the save. One voyage is saved at
a time, and starting another replaces it. Existing Python-server sessions are
not imported. The rotating-start edition uses a separate save slot because older choice sequences follow a different starting-player rule. Old saves are left untouched.

Use a current browser supporting WebAssembly and module workers, such as Chrome,
Edge, Firefox, or Safari. All game runtime files are hosted alongside the site;
Google Fonts is used for typography, with local system-font fallbacks.

## What happened to the bots?

Their trained policies and game logic were preserved. The original Python engine
runs inside a background Web Worker using Pyodide 0.27.7 (Python 3.12.7).
`engine.zip` contains its readable Python source, trained policy JSONs, and the
browser adapter. `engine-manifest.json` records the bundled file hashes.

To pause for human choices without a Python server, the adapter reconstructs the
same seeded game from its saved choices. This does not retrain bots or change
their decisions. The page stays responsive while the worker computes.

Expansion verification completed:

- 1,407 interactive snapshots matched the native expansion engine with the new rotating-start rule across all
  16 human powers and games with 3–6 players.
- All 16 complete games matched between native Python and the actual WebAssembly
  runtime, including scores, events, logs, and public state.
- Full-game replay measured approximately 41–240 ms in the local runtime test.
- Live browser checks covered setup, expansion drawing, round skipping, restored
  endings, full portrait framing, mobile victory layout, and all seven new audio files.
- 18 automated tests cover replay restoration, deck changes, power rewards,
  human choice, private Spyglass information, rotating starts, eliminated-player skipping, fixed neighbors, and complete-game parity.

## Round order and presentation

Seats are shuffled once per game. The first captain in that randomized order starts round one; each subsequent round passes the starting turn left, skipping eliminated captains. The open Captain’s log shows only the current round and scrolls to its newest event.

Victory art fills the screen. The illustrated harbor, wave sprites, and silent one-second Whirlpool clip are bundled locally. Every play card includes its lore. Lost Fortune has a dedicated reveal in both storm and safe waters.

## Expansion deck

The starting deck has 69 cards. Replace one Cursed Idol with Cursed Spoils,
replace one Escape Ship with Heart of the Sea, replace one Golden Crown with
Lost Fortune, and add Spyglass. Whirlpools are added on rounds 6 and 11.

## Artwork

All 24 play-card/back images use the supplied print files with 0.125-inch bleed
removed from every edge, displayed with rounded corners. All 16 captains use the
new portraits and distinct matching victory illustrations. Storm Warden is
female in both her victory illustration and laugh selection. Original print
files remain unchanged; replaced website artwork is excluded from this package.

## Attribution

Retain `THIRD_PARTY.md`, `runtime/LICENSE-*.txt`, and the audio attribution files
inside `assets/audio` when distributing this website.

### Pirate chart refresh (September 27)
The map and tracker use proportion-preserving artwork. Prophecy cards, ripples,
Wild Wave, rescue/heist rowboats and ship movement are browser animations.
The existing one-second Whirlpool clip loops twice; no new video was generated.
**Project preference: never use Runway without asking the owner for explicit
confirmation first, even when a request mentions Runway.**

Audio includes five treasure chime tiers, three curse tiers, a distinct licensed
Siren call, and a short male laugh played at its original pitch and speed.
See `assets/audio/CREDITS.md` for sources and modifications.

### Floating cargo update
Eight minimal treasure sprites drift and bob through the water with collision
handling and pointer dragging. Coins are more common; no wreckage spawns.
Populations are capped at 18 on desktop and 12 on small screens. Wild Wave
sweeps treasure away; nearby treasure spirals into Whirlpools. These objects are
decorative and never affect scores or deck odds.
Escape rowboats fill only on sinking and land at the main ship’s berth. Normal
harbor escorts remain empty, follow the captain to harbor, then continue to the
inner dock and immediately turn into gold. Tempest Trick collects two floating
treasures and docks on the inner side; its reward still comes from the shared pot.
One simple three-siren rock cluster appears during the Song and fades afterward.
The information bar has a fixed height, the desktop tracker ends at its bottom,
and small event announcements appear over the map. Three distinct one-second
curse sounds were generated through Runway with the user’s approval (3 credits).
The reveal uses the cards' native 9:14 aspect ratio.

### Captain refresh
All sixteen victory posters have been remade with simpler poses. The victory coin
shower uses evenly spaced 0.2-second intervals, and the new fanfare plays once.
Custom names receive a Captain prefix. Round buttons say Start game / Start round N.
The enlarged map and card panel align with the wider tracker on desktop.
Bots stay for a publicly announced Spyglass treasure until it is drawn or another
power rearranges the top; private treasure identity is not revealed. Forced exits
and the human captain’s voluntary choice remain legal.

### Choice and sinking fixes
Whirlpool visuals wait for the complete card resolution and animate every
sinking ship together, including ships resolved after repair/plunder choices.
Protected ships stay in the storm. Spyglass asks for the treasure first, then
provides a draggable, snapping ordering grid with one confirmation. It preserves
physical duplicate cards and saves the existing individual engine choices.
Undead Admiral's declined offers are grouped by draw and pot, including across
intervening choices; separate sinking events still offer plunder normally.
Profiles are green in the storm, black in harbor, and dark red when sunk.
Gold wording uses “collected.” Tide Watcher's card back explains the secret-card
power without exposing an opponent's private card.

Tide Watcher’s face-down secret card visibly travels from his profile to the top
of the draw pile. Placement finishes before the next draw control is unlocked.
The existing bot decision window runs after the preceding card resolves and
before the next Ready prompt; a confirmed draw cannot receive a late placement.

Navigator’s interactive Echo reveal stays silent until the copy is chosen; the
selected effect then plays its own sound once.

Parrot’s Prophecy has a short CC0 cockatoo squawk on reveal, including Calm Waters.
Collected Echo details identify the copied card, show its thumbnail and rules.
Inner-dock rowboat positions follow the map image’s cover crop and resize with
the map; Tempest Trick approaches from the water side before docking.
