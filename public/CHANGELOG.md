# CHANGELOG

All notable changes to the Solo Leveling System will be documented in this file.

## [1.23.0] - 2025-01-05

### Added
- **Discord Bot Auto-Sync**: Bot now automatically syncs XP and class changes to the web app in real-time
  - XP syncs after message rewards, voice rewards, daily claims, and admin addxp commands
  - Class selection syncs immediately when users pick their class

## [1.22.0] - 2025-12-12

### Added
- **New Achievements**: Gate rank achievements (E, D, C-Rank Hunter) and level milestones (5, 75, 150)
- **Analytics Achievements**: New achievements tied to Analytics page stats and progress tracking

### Fixed
- **Achievement Badge Click**: Badges on the flippable card now open the detail modal instead of flipping

## [1.21.0] - 2025-12-11

### Added
- **Sidebar Navigation**: Replaced cluttered top navigation with a clean sidebar menu
  - All pages accessible from sidebar (Awakening, Quests, Habits, Gates, Rewards, Customize, Hall of Fame)
  - "What's New" button to manually view changelog anytime
  - Current page indicator in header

### Changed
- Simplified Customize page header (removed redundant back button)

## [1.20.21] - 2025-12-11

### Fixed
- **Stats Card Download (v15)**: Fixed stat progress bars appearing empty
  - Preserved gradient backgrounds on stat bar fills during html2canvas capture
  - Only removes decorative gradients, not functional stat bar gradients

## [1.20.20] - 2025-12-11

### Fixed
- **Stats Card Download (v14)**: Fine-grained per-element text offsets
  - Stat names (STR, AGI, INT, VIT, SEN): 1px down (-7px)
  - Stat values & emojis: 1px up (-9px)
  - Footer quote: 1px up (-9px)
  - Name, LVL, Power: unchanged (-8px)
  - Rank badge: excluded (uses padding fix)

## [1.20.16] - 2025-12-11

### Fixed
- **Stats Card Download (v10)**: Refined text offset correction
  - Text elements shifted up by 16px (reduced from 24px which was too high, 12px was too low)
  - Rank badge padding unchanged at 16px (already correct)

## [1.20.15] - 2025-12-11

### Fixed
- **Stats Card Download (v9)**: Aggressive text offset correction
  - Text elements shifted up by 24px (increased from 12px)
  - Rank badge uses padding adjustment to push text up within border

## [1.20.14] - 2025-12-11

### Fixed
- **Stats Card Download (v7)**: Fixed text content shifting down in exported images
  - Removed extra style overrides that were causing vertical shift
  - Added explicit width/height and windowWidth/windowHeight for consistent rendering
  - Only remove problematic elements (canvas, gradients) without modifying positioning

## [1.20.13] - 2025-12-11

### Fixed
- **Stats Card Download (v6)**: Fixed text content shifting down in downloaded images
  - Preserve explicit line-height, padding, and margin styles when cloning DOM
  - Fix vertical alignment in flex containers for consistent rendering
  - Maintain computed styles to prevent html2canvas rendering differences
  - Works correctly for both framed and frameless cards

## [1.20.12] - 2025-12-11

### Fixed
- **Stats Card Download (v5)**: Fixed createPattern error for both framed and frameless cards
  - Remove ALL gradient backgroundImage styles from cloned elements before capture
  - Use computedStyle to detect gradients that inline style selectors miss
  - The repeating-linear-gradient pattern was causing html2canvas to fail

## [1.20.11] - 2025-12-11

### Fixed
- **Stats Card Download with Frames (v4)**: Completely reworked capture approach
  - Use html2canvas `onclone` callback to modify cloned DOM before rendering
  - Remove canvas elements, animation overlays, and problematic CSS from clone
  - Set mixBlendMode to 'normal' on frame images to avoid html2canvas issues
  - Remove repeating-linear-gradient patterns that cause createPattern errors
  - Set solid black background instead of transparent
  - Increased delay to 500ms

## [1.20.10] - 2025-12-11

### Fixed
- **Stats Card Download with Frames (v3)**: Fixed "createPattern" error caused by particle animation canvases
  - Ignore dynamically created canvas elements during html2canvas capture
  - Hide particle animation canvases before capture and restore after
  - Added ignoreElements option to html2canvas to skip canvas elements

## [1.20.9] - 2025-12-11

### Fixed
- **Stats Card Download with Frames (v2)**: Further fix for "createPattern" error when downloading stats card with frames
  - Convert frame images to base64 data URLs before html2canvas capture to avoid CORS and rendering issues
  - Increased delay to 300ms to ensure images are fully rendered after conversion
  - Properly handle images with 0 width/height by checking naturalWidth/naturalHeight

## [1.20.8] - 2025-12-11

### Fixed
- **Stats Card Download with Frames**: Fixed "createPattern" error when downloading stats card with frames equipped
  - Added image preloading function to ensure frame images are fully loaded before html2canvas capture
  - Added small delay after image load to ensure rendering is complete
  - Cards with any frame (including supporter-exclusive frames) can now be downloaded properly

## [1.20.7] - 2025-12-11

### Fixed
- **Stats Card Download Issue**: Completely redesigned StatsCardFrame for proper image export
  - Removed oversized character image area that was causing clipping
  - Made card compact with name/level/rank header + stats directly below
  - Removed fixed aspect ratio to allow content-based height
  - Reduced max-width from 420px to 320px for better proportions
  - Stats section now properly contained within card boundaries
  - Footer quote repositioned correctly

### Changed
- **Simplified Stats Card Layout**: Cleaner, more compact design
  - Header: Name, Level, Power, Rank badge all in one row
  - Stats: All 5 stat bars in compact rounded container
  - Footer: Quote text at bottom

## [1.20.6] - 2025-12-11

### Added
- **What's New Popup**: Shows changelog after app version updates
  - Beautiful modal displaying recent changes with icons for Added/Fixed/Changed
  - Automatically appears after version update (once per version)
  - Scrollable changelog with version history

### Fixed
- **Stats Card Name Clipping**: Fixed name getting clipped when saving/sharing stats card image
  - Increased top padding to prevent clipping from frame overlap
  - Name text now fully visible in saved images
- **Rank Badge Centering**: Rank badge now properly vertically centered in its container
  - Changed from `items-start` to `items-center` alignment
  - Added explicit `flex items-center justify-center` to badge

### Technical
- Created `src/components/WhatsNewModal.tsx` for changelog display
- Updated `src/hooks/useVersionCheck.ts` with `showWhatsNew` logic and `markVersionAsSeen()`
- Updated `src/components/StatsCardFrame.tsx` - improved top bar padding and alignment
- Updated `src/App.tsx` - integrated WhatsNewModal component

## [1.20.5] - 2025-12-11

### Added
- **Tier-based cascading frame unlock system**: Supporters now automatically unlock ALL frames at or below their tier level
  - S-Rank: Unlocks all 4 supporter frames (Monarch, Sovereign, National Hunter, Guild Master)
  - A-Rank: Unlocks Sovereign, National Hunter, Guild Master
  - B-Rank: Unlocks Guild Master only
- Added `unlockedFrames` array to SupporterBenefits for tracking multiple unlocked frames
- Added `getUnlockedFramesForTier()` utility function
- Migration support for existing supporters to populate unlockedFrames

### Fixed
- **Fine-tuned supporter frame insets**:
  - National Level Hunter: Reduced bottom inset from -12 to -8, top from -12 to -10 (fixes transparent gap)
  - Shadow Monarch's Throne: Reduced top/bottom from -14 to -10 (less overflow)

## [1.20.3] - 2025-12-11

### Changed
- **Increased supporter frame sizes**: Enlarged all 4 supporter-exclusive frames to not obscure card content
  - Guild Master's Crest: frameInset from -14/-16 to -18/-20
  - National Level Hunter: frameInset from -6/-8 to -12/-14
  - Sovereign's Authority: frameInset from -8/-10 to -14/-16
  - Shadow Monarch's Throne: frameInset from -8/-10 to -14/-16
- **Reduced stats card name/rank size**: Made the top bar less cramped
  - Username: text-xl → text-base with truncate for long names
  - Level/Power text: text-sm → text-xs
  - Rank badge: text-lg with px-3 py-1.5 → text-sm with px-2 py-1
  - Added flex-1 min-w-0 and shrink-0 for proper flex layout

### Technical
- Updated `src/lib/cardFrames.ts` - increased frameInset values for supporter frames
- Updated `src/components/StatsCardFrame.tsx` - reduced typography sizes in top info bar

## [1.20.2] - 2025-12-11

### Changed
- **Replaced Sovereign's Authority and Shadow Monarch's Throne frames**: Used user-edited versions with transparent centers
  - Both frames now have custom transparent centers that don't overlay card content
- **Increased Guild Master's Crest frame size**: Enlarged frame inset from -6/-8 to -14/-16 to better fit the stats card
- **Removed blur from locked supporter frames**: Locked frames are now clearly visible with only a dark overlay
  - Kept lock icon and "[X]-Rank+ Required" text for clarity

### Technical
- Updated `src/components/CardFrameShop.tsx` - removed `backdrop-blur-[2px]` from locked exclusive frames
- Updated `src/lib/cardFrames.ts` - Guild Master's Crest frameInset increased

## [1.20.1] - 2025-12-11

### Changed
- **Regenerated Supporter Frames**: Regenerated Shadow Monarch's Throne and Sovereign's Authority frames
  - Shadow Monarch's Throne: New rectangular purple/violet frame with elegant decorative elements
  - Sovereign's Authority: New rectangular dark gold/bronze frame with crimson gems and sharp corners (removed Age of Empires/curvy aesthetic)
- **Replaced Guild Master's Crest and National Level Hunter frames**: Used user-edited versions with transparent centers
  - Guild Master's Crest: Golden ornate frame with shield emblems and transparent center
  - National Level Hunter: Blue frame with purple ribbons, star motif, and transparent center
- **Supporter Frames Order**: Reordered SUPPORTER_EXCLUSIVE_FRAMES from B-Rank to S-Rank
  - B-Rank: Guild Master's Crest, National Level Hunter
  - A-Rank: Sovereign's Authority
  - S-Rank: Shadow Monarch's Throne

### Technical
- Updated frame styles in `src/lib/cardFrames.ts` - cornerStyle changed to "sharp" for Sovereign's Authority

## [1.20.0] - 2025-12-10

### Added
- **Supabase Integration**: Connected personal Supabase project for cloud features
  - Database tables: `supporters`, `redemption_codes`, `custom_frames`
  - RLS policies for secure public access
  
- **Hall of Hunters Page** (`/supporters`): New page showcasing supporters
  - Hunter Cards Gallery design with tier-based styling
  - Supporters grouped by tier (S-Rank to E-Rank)
  - Each card shows hunter name, custom title, tier badge
  - Responsive grid layout
  - Crown navigation icon added to navbar
  
- **Supporter Tier System**: Six tiers with unique benefits
  - E-Rank ($2): Badge of appreciation
  - D-Rank ($3): Supporter badge
  - C-Rank ($5): Badge + Hall of Fame listing
  - B-Rank ($7): Badge + Exclusive "Supporter" frame
  - A-Rank ($10): All above + Custom title
  - S-Rank ($20-25): All above + Custom frame designed for them
  
- **Code Redemption System**: Unlock supporter benefits via codes
  - Modal component for entering redemption codes
  - Validates codes against Supabase database
  - Stores unlocked benefits in localStorage
  - Supports: badges, exclusive frames, custom titles
  
- **Supporter Badge Display**: Badges show on PlayerProfileCard
  - Tier-colored badge next to player name
  - Custom supporter titles override default title
  
- **Hall of Hunters Link**: Added to Awakening page statistics section

### Technical
- Created `src/lib/supporters.ts` for supporter types and utilities
- Created `src/hooks/useSupporters.ts` for fetching supporters from Supabase
- Created `src/hooks/useCodeRedemption.ts` for code validation logic
- Created `src/components/SupporterCard.tsx` for individual supporter display
- Created `src/components/CodeRedemptionModal.tsx` for code entry UI
- Created `src/pages/Supporters.tsx` for Hall of Hunters page
- Added `@supabase/supabase-js` dependency

## [1.19.1] - 2025-12-09

### Fixed
- **Tutorial Loop Bug**: Fixed issue where completing the tutorial would loop back to the first-time setup screen
  - The problem was that `handleTutorialComplete` used stale React state instead of reading fresh data from localStorage
  - Now reads current stats from storage before updating `hasSeenTutorial` flag
  - Removed unnecessary page reload after tutorial completion

### Added
- **Ko-Fi Donation Button**: Added "Support the Hunter" button to Rewards page header
  - Links to creator's Ko-Fi page (https://ko-fi.com/nomad1331)
  - Styled to match Solo Leveling theme with heart icon

## [1.19.0] - 2025-12-09

### Added
- **Onboarding Tutorial System**: Comprehensive 7-step tutorial for new players
  - Automatically shows after first-time setup completes
  - Covers: Welcome, Daily Quests, Habits, Gates, Leveling Up, Rewards, Quick Start Tips
  - Beautiful animated UI matching Solo Leveling aesthetic
  - Progress dots to navigate between steps
  - Skip button for returning players
  - "View Tutorial" button added to Customize page for replaying anytime
- **TutorialModal Component**: New reusable component at `src/components/TutorialModal.tsx`

### Technical
- Added `hasSeenTutorial` property to player stats for tracking tutorial completion
- Tutorial shows automatically once, then accessible from Customize page

## [1.18.3] - 2025-12-09

### Added
- **XP Boosts Level Gate**: XP Boost Shop now requires Level 10 to access
  - Shows lock icon on tab when below level 10
  - Displays locked state with progress bar showing current level vs required level
  - Prevents new players from accessing powerful boosts too early

## [1.18.2] - 2025-12-09

### Fixed
- **XP Boost Shop Crash**: Fixed "Cannot read properties of null (reading 'expiresAt')" error that caused blank screen
  - Added null check for parsed boost object before accessing expiresAt property
  - Added try-catch wrapper for JSON.parse to handle malformed localStorage data
  - Cleans up invalid localStorage entries automatically

## [1.18.1] - 2025-12-09

### Fixed
- **Vercel Direct URL/Refresh 404 Error**: Added `vercel.json` with rewrites configuration to properly handle client-side routing. Previously, directly accessing any route other than `/` (e.g., `/customize`, `/gates`) or refreshing a page would show a 404 error because Vercel's server couldn't find the path. Now all routes are redirected to the SPA's index.html, allowing React Router to handle them.
- **Import Data Black Screen Bug (Complete Fix)**: Extended the `hasMounted` pattern to Gates.tsx, ChallengesPanel.tsx, and Customize.tsx. These components were overwriting freshly imported localStorage data with stale React state on initial render. Now all components wait until after mount before persisting state changes.

## [1.18.0] - 2025-12-09

### Fixed
- **Import Data Black Screen Bug**: Fixed an issue where importing backup data would cause a black/blank screen. The problem was that the `usePlayerStats` hook was immediately saving the old React state back to localStorage on component mount, overwriting the freshly imported data before it could be read. Added `hasMounted` state tracking to prevent this overwrite on initial render.

### Changed
- **Gates Page Dynamic Day Text**: Updated all hardcoded "7-day" references to use dynamic text based on each gate's actual `requiredDays` property:
  - Gate entry toast now shows the correct number of days (e.g., "Your 10-day challenge has begun!")
  - Header description changed from "7-day commitment challenges" to "Multi-day commitment challenges"
  - System notice updated from "7 consecutive days" to "required consecutive days"
  - This properly reflects that different gates have different duration requirements (7, 10, 12, or 14 days)

## [1.17.0] - 2025-12-09

### Changed
- **Gates Redesign**: Each gate rank now has distinct difficulty mechanics
  - **E-Rank**: 7 days, 0 habits required (all quests only)
  - **D-Rank**: 7 days, 1 habit required daily
  - **C-Rank**: 10 days, 2 habits required daily
  - **B-Rank**: 10 days, 3 habits required daily
  - **A-Rank**: 12 days, 4 habits required daily
  - **S-Rank**: 14 days, 5 habits required daily
  - Duration and habit requirements now clearly displayed on each gate card
  - Simplified challenge logic - uses unified requiredHabits system instead of per-gate checks

## [1.16.0] - 2025-12-09

### Added
- **Quest Auto-Sort**: Completed quests now automatically move to the bottom of the list
  - Pending quests stay at the top for easier access
  - Smooth fade animation when quests reorder
  - Completed quests appear slightly faded to visually distinguish them
- **Quest Drag & Drop Reordering**: Manually prioritize quests by dragging
  - Grip handle on each quest card for intuitive drag interaction
  - Works with touch and mouse
  - Order persists in localStorage
  - Visual feedback during drag (scale and shadow effects)

### Added
- **Data Import/Export System**: Full backup and restore functionality in Customize page
  - Export all data (stats, quests, habits, gates, rewards, challenges, streaks, XP history) to JSON file
  - Import data from backup file to restore progress
  - Includes version tracking for future compatibility
  - Located in new "Data Management" section in Customize page

### Fixed
- **Necromancer Hard Mode Penalty**: No longer deletes custom quests and rewards
  - Previously wiped all quests completely, now only resets completion status
  - Preserves user-created quests, rewards, and habits structure
  - Resets streak data as intended but keeps data configurations
- **Necromancer Confirmation Text**: Removed confusing full-stop from confirmation phrase
  - Changed from "I accept this contract." to "I accept this contract"
  - Users no longer get stuck trying to match the exact punctuation

## [1.15.1] - 2025-12-04

### Fixed
- **Social Media Preview Image**: Regenerated OG image to accurately represent the actual app UI
  - Previous AI-generated image looked nothing like the app
  - New image shows: SYSTEM branding, Hunter profile, Status Window, Level, E-Rank, stat bars, currency displays
  - Proper Solo Leveling dark theme with cyan/magenta accents

## [1.15.0] - 2025-12-04

### Added
- **Custom Favicon**: Generated AI favicon with crossed katanas in purple-black shadow aura (Sung Jinwoo inspired)
- **Web App Manifest**: Added manifest.json for Android home screen icon support
- **Custom Social Media Preview**: Generated OG image showing Solo Leveling System UI for link previews

### Changed
- **FirstTimeSetup Text**: Updated "cannot be changed later" to "you can change it later in Customize Profile"
- **PlayerProfileCard Avatar Display**: Now shows custom profile picture if set, otherwise shows class emoji
  - Fixed emoji mapping to match class IDs (fighter, tanker, mage, assassin, ranger, healer, necromancer)
  - Custom uploaded images (base64 data URLs) now properly display in the avatar circle

### Fixed
- **Profile Picture Not Showing**: Fixed bug where custom profile pictures from Customize weren't displaying in Awakening page
- **Browser Tab Icon**: Replaced Lovable favicon with custom Solo Leveling favicon
- **Android Home Screen Icon**: Added web manifest for proper PWA icon display

### Technical
- Updated index.html with new favicon, apple-touch-icon, manifest, and theme-color meta tags
- Created public/manifest.json for PWA support
- Generated public/favicon.png (512x512) and public/og-image.png (1200x630)
- Updated PlayerProfileCard to use AvatarImage component for custom images

## [1.14.0] - 2025-12-04

### Changed
- **Renamed "Stat Points" to "Ability Points"**: Updated terminology throughout the app
  - LevelUpAnimation: Shows "Ability Points Earned" instead of "Stat Points Earned"
  - usePlayerStats: Level up toast says "Ability Points" instead of "Stat Points"
  - Awakening page: Shows "Ability Points Available" instead of "Stat Points Available"

### Fixed
- **Necromancer Mode Modal Overflow**: Modal is now scrollable with max-height of 90vh
  - Previously the modal was too large and cut off on smaller screens
  - Users can now scroll to see all content and access buttons

### Added
- **Separate Analyze/Accept Quest Buttons**: Quest creation now has two distinct actions
  - "Analyze Quest" button appears first for users to analyze their quest description
  - "Accept Quest" button appears only after analysis is complete
  - Removed auto-analyze on blur behavior for better user control
  - Clearer workflow: type description → analyze → accept

## [1.13.0] - 2025-12-04

### Fixed
- **Challenge Reward Exploit**: Fixed bug allowing users to claim challenge rewards multiple times by reloading the page
  - Implemented claim tracking system using localStorage with period-based keys (daily/weekly)
  - Challenges now check if already claimed for current period before allowing claim
  - New challenges only generate if no active/completed challenge exists AND not already claimed for period
  - Prevents duplicate reward farming through page reloads

## [1.12.0] - 2025-12-03

### Added
- **Necromancer Streak Failure Detection**: Automatic penalty system when streak breaks during active challenge
  - Normal Mode: 5% loss of all major stats (XP, Gold, Credits, Gems, STR, AGI, INT, VIT, SEN)
  - Hard Mode: Complete account reset (all stats, XP, currencies, titles, classes wiped)
  - Challenge automatically resets to pending state for reattempt
  - Toast notifications inform user of penalties applied
- **Hard Mode Reattempt**: Added "May reattempt the challenge anytime" text to Hard Mode description

### Changed
- **Necromancer Mode Modal Legibility**: Improved text readability throughout
  - Increased heading sizes from text-xl to text-2xl with tracking-wide
  - Increased body text from text-xs/text-sm to text-base
  - Larger icons (w-10 h-10) and padding (p-3) for mode indicators
  - Increased button height to h-12 with text-base font
  - Better spacing between list items (space-y-2)
  - Clearer visual hierarchy with font-medium and font-bold distinctions
  - Larger warning icons and improved emphasis on critical text

## [1.11.0] - 2025-12-03

### Added
- **Futuristic Sound Effects**: Comprehensive audio feedback system using Web Audio API
  - `playClick()`: Subtle futuristic click for all interactive elements
  - `playSuccess()`: Rewarding "ker-ching" sound for quest completion and purchases
  - `playError()`: Error feedback for failed actions
  - `playHover()`: Subtle hover effect sound
  - `playLevelUp()`: Achievement fanfare for level ups and major unlocks
- **Sound Integration**: Applied sounds throughout the application
  - All buttons emit click sounds on interaction
  - Quest completion triggers success sound
  - Reward Centre purchases play success/error sounds
  - XP Boost Shop purchases play success/error sounds
  - Card Frame Shop unlocks play success/error sounds
  - Level up animations trigger level up sound
  - Necromancer class unlock plays level up sound

### Added
- **Necromancer Unlock Popup**: Global popup notification when 90-day streak is achieved
  - Appears on every page (except /quests) when challenge is complete but unclaimed
  - "Claim Now" button navigates to Quests page
  - "Remind Me Later" dismisses popup temporarily
  - Purple-themed design matching Necromancer aesthetic

### Added
- **Path of the Necromancer Dual-Mode System**: Complete legendary challenge overhaul
  - Challenge is now pending by default - must be manually accepted
  - Side-by-side mode selection modal for comparing options
  
- **Normal Mode (Recommended)**:
  - Safe Attempt with moderate penalties on failure
  - Streak reset + 5% loss of major stats on failure
  - Keep all titles, classes, progress, frames
  - May reattempt anytime
  - Reward: Unlock Necromancer Class only
  
- **Hard Mode (Serious Users Only)**:
  - High-Risk Contract with severe penalties
  - ALL progress resets on failure (stats, XP, currencies, titles, classes)
  - Only card frames are preserved
  - Requires typed confirmation: "I accept this contract."
  - Rewards: Necromancer Class + 10 Levels + 20 all stats + 100 Credits + 5 Gold + 5 Gems

### Technical
- Created `NecromancerModeModal.tsx` component for mode selection
- Extended `LegendaryChallenge` interface with `mode` and `acceptedDate` fields
- Added `NecromancerMode` type ("normal" | "hard" | null)
- Added `NECROMANCER_REWARDS` constant for mode-specific rewards
- New penalty methods in `usePlayerStats`:
  - `applyNecromancerNormalPenalty()`: 5% stat reduction
  - `applyNecromancerHardPenalty()`: Complete reset
  - `applyHardModeRewards()`: Hard mode completion bonuses

## [1.10.2] - 2025-12-02

### Changed
- **Customize Page Auto-Save**: Changes now save automatically with 300ms debounce - no need to click save button
- Removed manual save button, replaced with "Changes are saved automatically" indicator

## [1.10.1] - 2025-12-02

### Fixed
- **Card Frame Shop Layout**: Removed nested scroll area to prevent scroll-within-scroll issue
- **Frame Preview Cards**: Adjusted card heights to fit frames properly without excessive empty space
- **Frame Preview Centering**: Changed previews to be vertically centered instead of top-aligned
- **Individual Frame Positioning**: Updated frameInset system to support per-side values (top, right, bottom, left)
  - Shadow Monarch: Fixed position offset, widened on top/left/right
  - Demon Lord: Added more space on top to show name
  - Storm Caller: Added more space on top
  - Inferno Blaze: Shortened bottom overflow
  - Frozen Fortress: Shortened top and bottom overflow
  - Blood Reaper: Shortened top and bottom overflow
  - Demon Lord: Shortened top and bottom overflow
  - Emerald Guardian: Shortened bottom overflow
  - Celestial Divine: Widened left and right sides
  - Storm Caller: Shortened all 4 sides

### Technical
- Changed `frameInset` from single number to object with `{ top, right, bottom, left }` properties
- Updated `StatsCardFrame.tsx` to apply individual inset values per side
- Removed `ScrollArea` wrapper from `CardFrameShop.tsx`

## [1.10.0] - 2025-11-29

### Changed - Immersive 3D Card Border Redesign
- **Complete overhaul of card edge effects** with thick, textured borders wrapping entire cards
- **Ice Theme (Frozen Fortress)**: 
  - Actual frozen ice texture with crystalline diamond patterns
  - Hanging icicles from all four sides (25 per top/bottom, 20 per left/right)
  - Frost particles floating in the border area
  - Shimmer animation for ice crystal effect
- **Shadow Theme (Shadow Monarch)**:
  - Purple flames/smoke engulfing all borders (inspired by reference images)
  - Multiple layered smoke effects with radial gradients
  - 30+ animated flame tendrils per side with varying heights
  - Shadow particles floating upward
  - Pulsing glow animation
- **Fire Theme (Inferno Blaze, Blood Reaper)**:
  - Raging fire texture with actual flame spikes
  - 20 animated flame spikes per top/bottom edge
  - 15 horizontal flame spikes per side
  - Multiple blur layers for depth
  - Dynamic flicker animation with scale variation
- **Nature Theme (Forest Warden)**:
  - Organic vine borders wrapping all sides
  - SVG vine paths with flowing curves
  - 20+ leaf elements with rotation and pulse animations
  - Green glow effects matching forest theme
- **Cosmic Theme (Cosmic Voyager)**:
  - Nebula effects with multi-color gradients (purple, blue, pink)
  - 40+ twinkling stars per border
  - 3 shooting stars with trail effects
  - Cosmic pulse animation for depth
- **Demon Theme (Demon Lord)**:
  - Dark fire and smoke with red glow
  - 35+ dark flame tendrils with black smoke
  - Ember particles rising from borders
  - Mix-blend-mode screen for authentic demon fire effect
- **Electric Theme (Storm Caller)**:
  - Lightning bolts wrapping all edges
  - 12 animated SVG lightning paths per top/bottom
  - 60 electric particles along borders
  - Rapid spark animation
- **Enhanced Animations**: Updated CSS keyframes for more realistic effects
  - flameFlicker now includes scaleX variation for wavering flames
  - shadowPulse includes scale transform for breathing effect
  - shootingStar has diagonal trajectory
  - demonSmoke includes rotation for swirling effect

### Technical
- Complete rewrite of `src/components/CardEdges.tsx`
- Removed decorative SVG shapes, replaced with thick textured border overlays
- Uses CSS gradients, blur filters, and animations for realistic textures
- Multiple layered div elements for depth and realism
- Optimized animation delays for staggered effects
- Updated `src/index.css` keyframe animations

## [1.9.0] - 2025-11-28

### Added
- **Anime-Style Card Edges**: Custom SVG-based edge decorations matching each frame theme
  - Sharp geometric edges for common/default frames
  - Flame-like edges for fire/inferno themes (Inferno Blaze, Blood Reaper)
  - Ice shard edges for frozen themes (Frozen Fortress)
  - Shadow wispy tendrils for dark themes (Shadow Monarch)
  - Ornate decorative borders for celestial themes (Celestial Divine)
  - Electric lightning bolt edges for storm themes (Storm Caller)
- **Thematic Visual Elements**: Dynamic decorative effects based on card frame
  - Animated flames with pulse effects for fire frames
  - Floating ice crystals with shimmer animation for ice frames
  - Wispy shadow tendrils with float animation for shadow frames
  - Lightning streaks with pulse for electric frames
  - Twinkling stars for celestial frames
  - Energy pulses for emerald/energy frames
- **Share Animation Effects**: Sparkle and glow animations when sharing cards
  - 30 sparkle particles with random colors and positions
  - Radial glow wave effect
  - Smooth animation triggers before card capture
  - Visual feedback for share/download actions
- **4K Download Quality**: Ultra high-resolution card exports
  - 4x scale factor for crystal-clear image quality
  - Maximum PNG quality (1.0) for best results
  - Optimized file naming with "4K" suffix
  - Better for printing and high-resolution displays
- **Custom Profile Picture Support**: Upload your own character images
  - File upload with 2MB size limit and image type validation
  - Support for custom images alongside emoji avatars
  - Preview functionality before applying
  - Remove uploaded image option
  - Images stored as data URLs in localStorage
- **Pokemon-Style Card Redesign**: Complete visual overhaul of stats cards
  - Large character image area (like Pokemon/trading cards) occupying top 60% of card
  - Character images with holographic gradient overlays and glow effects
  - Stat bars with icons, progress bars, and animated fills
  - Cleaner, more professional card layout with better visual hierarchy
  - Character backgrounds with gradient effects matching avatar type
  - Title overlay at bottom of character area
  - Rounded corners (rounded-2xl) for authentic card feel

### Changed
- **Card Frame Definitions**: Extended interface with new style properties
  - Added `edgeStyle` property for custom edge rendering
  - Added `themeElements` for decorative element configuration
  - Each frame now has unique edge styling matching its theme
- **StatsCardFrame Component**: Integrated custom edges and theme elements
  - Renders appropriate SVG edges based on frame style
  - Dynamically generates theme-specific decorative elements
  - Better visual depth and anime-style presentation
- **ShareableStatsCard Component**: Enhanced with animations and quality
  - Animation overlay system with sparkles and glows
  - 4K capture functionality (scale: 4)
  - Disabled state during animation/capture
  - Better error handling and user feedback
  - Updated button labels to reflect 4K quality
- **Design System**: Added 4 new animation keyframes
  - `sparkle`: Scale and fade animation for sparkle particles
  - `wave`: Radial expanding glow wave effect
  - `float`: Smooth floating motion for atmospheric elements
  - `twinkle`: Star-like twinkling effect

### Technical
- Created `src/components/CardEdges.tsx` with SVG edge generation functions
- Added `renderThemeElements()` method in StatsCardFrame for dynamic decorations
- Updated `src/lib/cardFrames.ts` interface with edge and theme properties
- Enhanced `src/index.css` with new animation keyframes
- Improved html2canvas capture with higher scale and quality settings
- Added animation state management in ShareableStatsCard

## [1.8.0] - 2025-11-28

### Added
- **Pokemon-Style Card Frame System**: Collectible card designs for shareable stats
  - 8 unique card frame designs with 5 rarity tiers (Common, Rare, Epic, Legendary, Mythic)
  - Each frame features unique border gradients, glow effects, and corner styles
  - Card frames unlock from Reward Centre using credits (150-1000 credits)
  - Frame rarities: Common (free), Rare (150-200), Epic (300), Legendary (500), Mythic (1000)
- **Advanced Card Animations**: Multiple dynamic visual effects
  - Pulse, Shimmer, Glow, Particles, and Holographic animations
  - Canvas-based particle system with 30 floating particles for particle animation
  - Animated stat numbers with smooth scaling effects
  - Custom CSS keyframes for shimmer, glow, and holographic effects
- **Card Frame Shop**: New Reward Centre tab for frame purchasing
  - Browse all available card frames with preview functionality
  - Live preview dialog showing card with current player stats
  - Rarity badges with color-coded indicators
  - Purchase frames using credits earned from gameplay
  - Lock indicators for unavailable frames
- **Card Frame Customization**: Enhanced profile customization
  - Select from unlocked card frames in Customize page
  - Preview each frame with live player stats before applying
  - Frame selection persists across app
  - Visual indicators for locked/unlocked frames
- **Redesigned Stats Card**: Pokemon card-inspired layout
  - 2:3 aspect ratio card design (420px max width)
  - Dynamic styling based on selected frame
  - Corner decorations matching frame style (sharp/rounded/ornate/geometric)
  - Background overlays with frame-specific patterns and gradients
  - Compact stat display optimized for card format (3-letter abbreviations)
  - Glowing effects and shadows matching frame colors
  - Enhanced visual hierarchy with better spacing

### Changed
- **ShareableStatsCard Component**: Refactored to use new StatsCardFrame component
- **Rewards Page**: Added "Card Frames" tab between Rewards and XP Boosts (3 tabs total)
- **Customize Page**: Added card frame selection section with preview dialogs
- **Storage System**: Extended PlayerStats interface with `selectedCardFrame` and `unlockedCardFrames` properties
- **Design System**: Added custom animation keyframes (shimmer, glow, holographic, stat-number)

### Technical
- Created `src/lib/cardFrames.ts` with CARD_FRAMES definitions and getRarityColor utility
- Created `src/components/StatsCardFrame.tsx` for Pokemon-style card rendering with animations
- Created `src/components/CardFrameShop.tsx` for frame purchasing and preview interface
- Updated `src/index.css` with 4 new animation keyframes
- Storage migration automatically adds default frame to existing users
- Frame preview uses Dialog component for modal display

## [1.7.0] - 2025-11-27

### Fixed
- **Gate Failure Penalties**: Fixed bug where gate abandonment penalties weren't being applied to player stats
  - Penalties now properly deduct: -10% Credits, -10% XP, -5 all stats, -1 level
  - Applied with timeout to ensure proper state synchronization
- **Reward Centre Navigation**: Fixed button in Awakening page to properly navigate to Reward Centre tab
  - Now uses React Router navigation with automatic tab switching
  - User lands directly on Rewards tab instead of Daily Quests

### Changed
- **Credits Conversion Rate**: Updated from 2 XP = 1 credit to 10 XP = 1 credit
  - Makes credit economy more balanced and rewards more valuable
  - Quest completion now awards credits at 1/10th of XP value

### Added
- **Daily/Weekly Challenges System**: New separate challenge system with high-value rewards
  - Daily challenges: Complete X quests, achieve habits, perfect completion (200-300 XP rewards)
  - Weekly challenges: Complete 50 quests, maintain 7-day streak, clear gates, earn XP (1500-2500 XP rewards)
  - Auto-generates new challenges when previous ones expire or complete
  - Tracks progress automatically based on player activity
  - Rewards include XP, Gold, Gems, and Credits
  - New "Challenges" tab in Quests page
- **XP Boost Shop**: Purchase temporary XP multipliers with Gold and Gems
  - Minor Boost (1.5x): 200 Gold for 30 mins, 350 Gold + 5 Gems for 60 mins
  - Major Boost (2x): 400 Gold for 30 mins, 700 Gold + 10 Gems for 60 mins
  - Legendary Boost (3x): 25 Gems for 30 minutes
  - Active boost display with countdown timer
  - Only one boost can be active at a time
  - New "XP Boosts" tab in Quests page
- **Resource Earning Guide**: Added clear information on how to earn Gold and Gems
  - Gold: Earned from completing Gates (boss challenges)
  - Gems: Earned from completing Weekly Challenges
  - Info card displayed in XP Boost Shop

### Technical
- Added `challenges.ts` library for challenge generation and management
- Created `ChallengesPanel.tsx` component for challenge UI
- Created `XPBoostShop.tsx` component for boost purchasing system
- Extended Quests page with 4 tabs: Daily Quests, Challenges, XP Boosts, Rewards
- Challenge progress automatically tracked via storage monitoring
- Boost expiration tracked with localStorage persistence

## [1.6.0] - 2025-11-27

### Changed
- **Rank System**: E-Rank now persists until Level 5, D-Rank starts at Level 6 (previously Level 10)
- **Gate Restrictions**: Only one gate can be active at a time to prevent parallel challenges
- **Statistics Layout**: Moved Gold, Gems, and Credits from Status Window to Statistics section
- **Shadow Dungeon Gate**: Now unlocks at Level 6 instead of Level 5

### Added
- **Automatic Gate Progress Tracking**: Gate daily challenges now auto-complete when requirements are met
  - E-Rank (Goblin Cave): Auto-marks when all daily quests are complete
  - D-Rank (Shadow Dungeon): Auto-marks when all quests + 1 habit complete
  - C-Rank (Temple of Chaos): Auto-marks when all quests complete + 7-day streak maintained
  - B-Rank (Frozen Citadel): Auto-marks when all quests + all active habits complete
  - A-Rank & S-Rank: Auto-marks on 100% completion
  - System automatically checks progress when stats update
  - Auto-completes gate when all 7 days are done
- **Gate Failure Penalties**: Failing or abandoning a gate now applies severe penalties:
  - -10% Credits (rounded)
  - -10% Total XP (rounded)
  - -5 to each stat (Strength, Agility, Intelligence, Vitality, Sense)
  - -1 Level demotion (additional to level loss from XP reduction)
  - Total power reduction of 25
  - Stats cannot go below 10 minimum
  - New `applyGatePenalty()` method in usePlayerStats hook
- **Reward Cost Minimum**: Custom rewards must cost at least 20 credits
  - Validation on reward creation
  - Input field enforces minimum value
  - Helper text shows minimum requirement
- **Habit Statistics Panel**: Comprehensive analytics view with visual charts
  - Active habits count
  - Win rate percentage across completed habits
  - Best streak across all habits (calculated from completion history)
  - Total days tracked across all habits
  - Win/Loss/In Progress progress bars with percentages
  - Completion rate by individual habit with colored progress bars
  - Average completion rate for active habits
  - New fourth tab "Stats" in Habits page
- **Reward Centre Access**: Direct button in Statistics section to open Reward Centre

### Fixed
- Gate auto-completion now properly triggers when all 7 days are marked complete
- Gate challenge descriptions now clarify auto-completion behavior
- System warning updated to mention one-gate-at-a-time restriction and penalties

### Technical
- Added HabitStatistics.tsx component for analytics visualization
- Extended usePlayerStats hook with applyGatePenalty method
- Gates.tsx now monitors quest and habit completion via storage for auto-marking
- Enhanced gate status checking with more robust logic
- Default reward creditCost changed from 50 to 50 with 20 minimum

## [1.5.0] - 2025-11-27

### Added
- **Gates System**: Complete boss challenge system
  - 6 gates from E-Rank to S-Rank with escalating difficulty
  - 7-day commitment challenges with daily completion tracking
  - Rank-based visual styling with glowing effects
  - Loss counter that tracks failures
  - Progressive unlock system based on player level (E-Rank at Lv1, S-Rank at Lv100)
  - Dramatic lore text and system warnings for each gate
  - Special rewards: massive XP, Gold, and exclusive titles
  - Boss names: Goblin Chieftain, Shadow Beast, Chaos Knight, Ice Monarch, Red Dragon, Shadow Monarch
  - Status tracking: locked, active, completed, failed
  - Rechallenge system after failure
  - Daily challenge requirements that scale with difficulty
  
### Changed
- **Typography Enhancement**: All major headings now use Cinzel font
  - Status Window, Statistics, Daily Quests, Reward Centre, Gates, Habits, XP History
  - Creates consistent imperial/authoritative aesthetic throughout app
  - Matches Solo Leveling manhwa theme
  
### Technical
- Added Gate interface to storage.ts with comprehensive data structure
- Implemented gate state management with localStorage persistence
- Auto-unlock system checks player level on mount and level changes
- Default gates preloaded on first visit

## [1.4.0] - 2025-11-27

### Added
- **Credits System**: New currency for Reward Centre
  - Quests now award Credits (50% of XP value)
  - Credits displayed in Awakening page alongside Gold and Gems
  - Credits migration for existing saves
- **Reward Centre**: Complete reward management system
  - Create custom rewards with Credit costs
  - Default rewards included (1 Hour Free Time, Game for 30 mins, etc.)
  - Claim rewards by spending Credits
  - Reset claimed rewards
  - Delete unwanted rewards
  - Integrated as second tab in Quests page
- **Timezone Selector Overhaul**: Continuous scrolling UTC offset list
  - All timezones from UTC-11:00 to UTC+14:00
  - Includes half-hour offsets (UTC+05:30, UTC+09:30, etc.)
  - Organized chronologically by offset for easy navigation
  - Scrollable list with offset labels

### Changed
- **Status → Awakening**: Renamed page to match Solo Leveling theme
  - Updated navigation label
  - Updated route in App.tsx
  - Updated tab label
- **Total XP Display**: Moved from Status Window to Statistics card
  - Now prominently displayed below radar chart
  - Better visibility and more logical placement

### Technical
- Added credits field to PlayerStats interface
- Credits stored in localStorage with migration support
- Rewards stored separately in localStorage

## [1.3.0] - 2025-11-26

### Added
- **Automatic Daily Quest Reset**: Quests now reset at midnight based on user's timezone
  - Prevents manual reset exploitation for stats/points farming
  - Next reset countdown displayed to users
  - Uses IANA timezone database (e.g., "America/New_York")
- **Timezone Selection**: Users can choose their preferred timezone
  - Located in Customize page
  - Affects daily quest reset timing
  - Defaults to system timezone

### Changed
- Removed manual "Reset Quests" button to prevent exploitation
- Quest reset is now fully automatic and timezone-aware

### Technical
- Added UserSettings interface in storage.ts for timezone preference
- Implemented timezone-aware date comparison in dateUtils.ts
- Quest reset logic moved to useEffect with interval checking
