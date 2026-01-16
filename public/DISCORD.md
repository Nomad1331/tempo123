# Solo Leveling System - Discord Server Guide

This document provides a comprehensive guide for setting up and managing the Solo Leveling System Discord server.

---

## Table of Contents
1. [Server Structure](#server-structure)
2. [Channel Recommendations](#channel-recommendations)
3. [Role System](#role-system)
4. [Onboarding Setup](#onboarding-setup)
5. [Bot Integration](#bot-integration)
6. [Moderation Guidelines](#moderation-guidelines)
7. [Server Guide Content](#server-guide-content)

---

## Server Structure

### Recommended Category Layout

Your current structure is solid! Here's my analysis:

#### ✅ KEEP (Essential)

**WELCOME CENTER**
- `#rules` - Essential for community guidelines
- `#server-guide` - Perfect for onboarding info
- `#link-account` - **ESSENTIAL** - Users need this to link their Discord to the app

**AWAKENING HQ**
- `#general-chat` - Main community discussion
- `#announcements` - Updates, patches, new features
- `#quest-discussions` - Share quest strategies
- `#achievements` - Celebrate unlocked achievements

**HUNTER ZONE**
- `#bot-commands` - Keep bot spam out of general chat
- `#leaderboards` - Weekly/monthly rankings
- `#level-ups` - Auto-post level ups (bot integration)
- `#reward-centre` - Code drops, giveaways

**GUILDS & SOCIAL**
- `#guild-hall` - Guild recruitment and announcements
- `#hunter-profiles` - Share stats cards
- `#duels` - Streak duel challenges

**SUPPORT**
- `#help` - General help questions
- `#bug-reports` - Report issues
- `#suggestions` - Feature requests

#### ⚠️ CONSIDER MERGING/REMOVING

**GATES & CHALLENGES** - Could be merged:
- `#active-gates` → Merge into `#quest-discussions`
- `#daily-challenges` → Merge into `#announcements` (as daily posts)
- `#progress-updates` → Merge into `#achievements` or use a bot channel

**Text Channels > bump** - Keep if using DISBOARD, otherwise remove

#### ➕ CONSIDER ADDING

- `#introductions` - New hunter introductions
- `#off-topic` - Non-game related chat
- `#media-showcase` - Screenshots, stats cards, creative content
- `#partnerships` - If you do cross-promotions

---

## Channel Recommendations

### Detailed Channel Purposes

| Channel | Purpose | Bot Access |
|---------|---------|------------|
| `#rules` | Server rules, ToS, code of conduct | Read-only |
| `#server-guide` | How to use the app/bot, FAQs | Read-only |
| `#link-account` | Instructions + `/link` command | FlaviBot |
| `#general-chat` | Main discussion | All |
| `#announcements` | Updates only (mod-only post) | Webhooks |
| `#bot-commands` | All bot commands | FlaviBot |
| `#leaderboards` | Weekly leaderboard posts | FlaviBot |
| `#level-ups` | Auto level-up notifications | FlaviBot |
| `#achievements` | Achievement unlock celebrations | FlaviBot |
| `#bug-reports` | Bug submission (forum style) | Webhook/Bot |
| `#suggestions` | Feature requests (forum style) | Webhook/Bot |

### Channel Permissions Matrix

```
Role                | General | Announcements | Bot-Commands | Level-ups
--------------------|---------|---------------|--------------|----------
@everyone           | Read    | Read          | Read         | Read
[E-RANK]+           | Write   | Read          | Write        | Read
Moderator           | Write   | Write         | Write        | Read
Admin               | All     | All           | All          | All
FlaviBot            | Write   | Write         | Write        | Write
```

---

## Role System

### Current Roles Analysis

Your current roles are well-structured! Here's the breakdown:

#### Bot/System Roles (Top of hierarchy)
| Role | Purpose | Color Suggestion |
|------|---------|------------------|
| FlaviBot | The Discord bot | `#5865F2` (Discord Blurple) |
| DISBOARD.org | Bump bot | Default |
| Bump Reminder | Bump notifications | Default |
| BOT x APP | Linked account indicator | `#00D9FF` (Cyan) |

#### Special Roles
| Role | Purpose | Color Suggestion |
|------|---------|------------------|
| 🏆 Season Champion 🏆 | Top weekly performer | `#FFD700` (Gold) |
| Announcement Pings | Opt-in for announcements | Muted color |
| Tester | Beta testers | `#9945FF` (Purple) |

#### Rank Roles (Auto-assigned by bot based on in-game rank)
| Role | In-Game Equivalent | Color |
|------|-------------------|-------|
| [S-RANK] | National-Level Hunter | `#FF0000` (Red) |
| [A-RANK] | A-Rank Hunter | `#FF6B00` (Orange) |
| [B-RANK] | B-Rank Hunter | `#9945FF` (Purple) |
| [C-RANK] | C-Rank Hunter | `#0099FF` (Blue) |
| [D-RANK] | D-Rank Hunter | `#00CC00` (Green) |
| [E-RANK] | E-Rank Hunter | `#808080` (Gray) |

#### Class Roles (Optional display)
| Role | Purpose |
|------|---------|
| [TANKER] | Tank class unlocked |
| [ASSASSIN] | Assassin class unlocked |
| [FIGHTER] | Fighter class unlocked |
| [RANGER] | Ranger class unlocked |
| [HEALER] | Healer class unlocked |
| [MAGE] | Mage class unlocked |

### Role Hierarchy Order (Top to Bottom)
1. Server Owner
2. Admin
3. Moderator
4. FlaviBot
5. BOT x APP (linked users)
6. 🏆 Season Champion 🏆
7. [S-RANK] through [E-RANK]
8. Class roles
9. Announcement Pings
10. @everyone

---

## Onboarding Setup

### Discord Onboarding Configuration

**Default Channels (shown to new members):**
1. `#rules` - Must acknowledge
2. `#server-guide` - How everything works
3. `#link-account` - Link their Discord ID
4. `#general-chat` - Start chatting

**Onboarding Questions:**

#### Question 1: "What brings you here?"
- 🎮 I want to track my habits and quests
- 👥 I'm joining with friends/guild
- 🔍 Just exploring the server
- 🤖 I want to use the Discord bot

#### Question 2: "Would you like update pings?"
- ✅ Yes, ping me for announcements → Assign `Announcement Pings` role
- ❌ No thanks, I'll check manually

#### Question 3: "Have you linked your account?"
- ✅ Yes, I've linked my Discord ID in the app
- ❓ No, but I want to (show #link-account)
- 🚫 I'm just browsing for now

### Welcome Message Template

```
# ⚔️ Welcome, Hunter! ⚔️

A new hunter has awakened in our ranks!

**Getting Started:**
1️⃣ Read the <#rules> channel
2️⃣ Link your account in <#link-account>
3️⃣ Use `/stats` in <#bot-commands> to see your progress
4️⃣ Introduce yourself in <#general-chat>

**Useful Commands:**
• `/rank` - View your rank card
• `/leaderboard` - See top hunters
• `/quests` - Check your daily quests
• `/help` - All available commands

*The System awaits your growth, Hunter.*
```

---

## Bot Integration

### FlaviBot Channels

| Channel | Bot Permissions | Purpose |
|---------|----------------|---------|
| `#bot-commands` | Full access | All user commands |
| `#level-ups` | Send messages | Auto-post level ups |
| `#achievements` | Send messages | Achievement unlocks |
| `#leaderboards` | Send/Edit messages | Weekly leaderboard updates |
| `#link-account` | Send messages | `/link` command only |

### Webhook Integrations

Consider adding webhooks for:
- **GitHub** → `#announcements` for app updates
- **Ko-fi** → `#announcements` for supporter shoutouts
- **Uptime** → Private mod channel for downtime alerts

---

## Moderation Guidelines

### Auto-Moderation Rules

Enable Discord AutoMod for:
- Spam prevention (duplicate messages)
- Mention spam (max 5 mentions per message)
- Link filtering (whitelist only app domains)
- Profanity filter (Discord's built-in)

### Mod Commands

If using FlaviBot for moderation:
- `/warn @user [reason]` - Issue warning
- `/mute @user [duration]` - Temporary mute
- `/kick @user [reason]` - Kick from server
- `/ban @user [reason]` - Permanent ban

### Escalation Policy

1. **First offense:** Warning
2. **Second offense:** 1-hour mute
3. **Third offense:** 24-hour mute
4. **Fourth offense:** Kick
5. **Continued issues:** Ban

---

## Server Guide Content

### Recommended `#server-guide` Post

```markdown
# 📖 Solo Leveling System - Server Guide

Welcome to the official Solo Leveling System Discord! This guide will help you get started.

---

## 🔗 Linking Your Account

To use the Discord bot and sync your progress:

1. Open the Solo Leveling System app
2. Click your avatar (top right) → "Link Discord"
3. Enter your Discord User ID
4. Use `/link` in <#bot-commands> to verify

**How to find your Discord User ID:**
1. Enable Developer Mode: User Settings → App Settings → Advanced → Developer Mode
2. Right-click your profile → Copy User ID

---

## 🤖 Slash Commands

Use these commands in <#bot-commands>:

| Command | Description |
|---------|-------------|
| `/xp` | View your rank card with level and XP progress |
| `/stats` | See your detailed hunter stats (STR, AGI, INT, etc.) |
| `/leaderboard` | View the server XP leaderboard |
| `/weekly` | Weekly leaderboard: top XP in last 7 days |
| `/daily` | Claim your daily XP reward |
| `/compare` | Compare your stats with another user |
| `/chooseclass` | Choose your hunter class (level 10+) |
| `/myclass` | View your current hunter class |
| `/rewards` | List rewards/role unlocks for ranks |
| `/voicetop` | View the voice activity leaderboard |
| `/link` | Check if your Discord is linked to web app |
| `/help_leveling` | Show all available commands |

---

## 📊 Rank System

Your Discord role updates automatically based on your in-game rank:

| Rank | Level Range | Color |
|------|-------------|-------|
| E-Rank | 1-10 | Gray |
| D-Rank | 11-25 | Green |
| C-Rank | 26-40 | Blue |
| B-Rank | 41-60 | Purple |
| A-Rank | 61-80 | Orange |
| S-Rank | 81+ | Red |

---

## 🏆 Weekly Challenges

Every week, compete for the **Season Champion** role!
- Top weekly XP earner gets the role
- Announced every Monday in <#announcements>

---

## 🆘 Need Help?

- **Technical Issues:** <#help> or <#bug-reports>
- **Feature Requests:** <#suggestions>
- **General Questions:** <#general-chat>

---

*The System uses me, and I use The System.*
```

---

## Channel Content Guide

### What to Post in Each Channel

#### 📢 #announcements
**Who can post:** Admins/Mods only

Post:
- New app features and updates
- Patch notes (from CHANGELOG.md)
- Server events and challenges
- Weekly Season Champion announcements
- Maintenance notices
- Partnership announcements

**Example Post:**
```
# ⚡ SYSTEM UPDATE v3.14.0

**New Features:**
• Discord page added to the app
• Auto level-up announcements now post here
• Improved sidebar navigation

**Bug Fixes:**
• Fixed modal popup issues
• Fixed XP calculation sync with bot

Check the full changelog: https://sololevelling-app.vercel.app/changelog
```

---

#### 🔗 #link-account
**Purpose:** Account linking instructions and verification

**Pinned Message:**
```
# 🔗 Link Your Discord Account

To sync your progress and use the bot:

## Method 1: From the App
1. Go to https://sololevelling-app.vercel.app
2. Log in or sign up
3. Click your avatar (top right)
4. Click "Link Discord"
5. Enter your Discord User ID

## Method 2: Get Your Discord ID
1. Go to User Settings → App Settings → Advanced
2. Enable "Developer Mode"
3. Right-click your profile picture → "Copy User ID"
4. Paste it in the app

## Verify Your Link
Type `/link` here to check if you're connected!

⚠️ **Note:** Your Discord ID is NOT your username. It's a long number like `123456789012345678`
```

---

#### 💬 #general-chat
**Purpose:** Main community hub

Encourage:
- Self-improvement discussions
- Quest and habit sharing
- Motivational posts
- Community bonding
- Celebrating milestones

Discourage:
- Bot command spam (use #bot-commands)
- Bug reports (use #bug-reports)
- Off-topic spam

---

#### 🤖 #bot-commands
**Purpose:** All FlaviBot commands

**Pinned Message:**
```
# 🤖 Bot Commands

Use slash commands here! Type `/` to see all available commands.

**Popular Commands:**
• `/xp` - Your rank card
• `/stats` - Your hunter stats
• `/leaderboard` - Top hunters
• `/daily` - Claim daily reward
• `/weekly` - Weekly leaderboard
• `/chooseclass` - Pick your class (level 10+)
• `/compare @user` - Compare with someone

**Tips:**
• Link your account first: `/link`
• Commands work only here and in DMs
• Don't spam - you may get rate limited
```

---

#### 📈 #level-ups
**Purpose:** Automatic level-up announcements from the bot

**Bot Auto-Posts:**
```
⚡ LEVEL UP!

🎮 [Hunter Name] has reached Level [X]!
⭐ Rank: [Current Rank]
📊 Total XP: [XP Amount]

Keep rising, Hunter! 🔥
```

**Settings:** Read-only for users, FlaviBot can post

---

#### 🏆 #leaderboards
**Purpose:** Weekly/monthly leaderboard posts

**Weekly Post (Monday):**
```
# 🏆 Weekly XP Leaderboard

## Week of January 15-22, 2026

| Rank | Hunter | XP Gained |
|------|--------|-----------|
| 🥇 | @Hunter1 | 5,420 XP |
| 🥈 | @Hunter2 | 4,890 XP |
| 🥉 | @Hunter3 | 4,210 XP |
| 4 | @Hunter4 | 3,980 XP |
| 5 | @Hunter5 | 3,650 XP |

👑 **Season Champion:** @Hunter1

Congratulations to all participants! The grind continues next week.
```

---

#### 🎯 #achievements
**Purpose:** Achievement unlock celebrations

**Bot Auto-Posts:**
```
🏅 ACHIEVEMENT UNLOCKED!

🎮 [Hunter Name] earned:
**[Achievement Name]**
[Achievement Description]

Rarity: ⭐ [Rarity]
```

---

#### 🏰 #guild-hall
**Purpose:** Guild recruitment and announcements

**Pinned Template:**
```
## 🏰 Guild Recruitment Template

**Guild Name:**
**Guild Master:**
**Members:** X/30
**Access Type:** Public / Private / Invite Only

**About Us:**
[Description]

**Requirements:**
- Minimum Rank: [Rank]
- Weekly XP Minimum: [Amount]

**How to Join:**
[Instructions]
```

---

#### 🆘 #help
**Purpose:** General questions and assistance

Encourage:
- "How do I..." questions
- Feature explanations
- Account help
- Bot usage help

Discourage:
- Bug reports → redirect to #bug-reports
- Feature requests → redirect to #suggestions

---

#### 🐛 #bug-reports
**Purpose:** Report issues (recommend Forum channel type)

**Post Template:**
```
**Bug Description:**
[What happened]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected Behavior:**
[What should happen]

**Screenshots:**
[If applicable]

**Device/Browser:**
[e.g., Chrome on Windows]
```

---

#### 💡 #suggestions
**Purpose:** Feature requests (recommend Forum channel type)

**Post Template:**
```
**Suggestion Title:**
[Brief title]

**Description:**
[What feature would you like]

**Why It Would Help:**
[Explain the benefit]

**Priority:**
🔥 High / ⚡ Medium / 💤 Low
```

---

## Quick Reference

### Essential Channels (Minimum Viable Server)
1. `#rules`
2. `#general-chat`
3. `#announcements`
4. `#bot-commands`
5. `#link-account`
6. `#help`

### Nice-to-Have Channels
1. `#leaderboards`
2. `#level-ups`
3. `#achievements`
4. `#guild-hall`
5. `#bug-reports`
6. `#suggestions`

### Channels You Can Remove/Merge
1. `#active-gates` → Merge with `#quest-discussions`
2. `#daily-challenges` → Use announcements instead
3. `#progress-updates` → Use `#level-ups` auto-posts
4. `bump` → Only if not using DISBOARD

---

## Server Settings Checklist

- [ ] Enable Community features
- [ ] Set up Server Insights
- [ ] Configure AutoMod
- [ ] Enable Onboarding
- [ ] Add server icon and banner
- [ ] Set up verification level (Medium recommended)
- [ ] Configure default notifications (Mentions only)
- [ ] Create invite link (never expires, limited uses for tracking)
- [ ] Set up welcome screen
- [ ] Add server rules (Community requirement)

---

*Last updated: January 16, 2026*

⚔️ Track your self-improvement journey RPG-style
🎮 Complete quests, build habits, clear gates
🏆 Compete on global leaderboards
🌐 https://sololevelling-app.vercel.app
