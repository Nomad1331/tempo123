import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-secret',
};

// Bot secret for authentication (set this in Supabase Edge Function secrets)
const BOT_SECRET = Deno.env.get('BOT_SYNC_SECRET');

interface BotSyncRequest {
  discord_id: string;
  action: 
    | 'add_xp' 
    | 'sync_stats' 
    | 'get_stats' 
    | 'link_class' 
    | 'verify_link'
    | 'get_quests'
    | 'add_quest'
    | 'complete_quest'
    | 'get_habits'
    | 'complete_habit'
    | 'get_streak'
    | 'get_gates'
    | 'get_challenges'
    | 'get_card_data';
  data?: {
    xp?: number;
    source?: string;
    class_id?: string;
    quest_title?: string;
    quest_index?: number;
    habit_id?: string;
    stats?: {
      strength?: number;
      agility?: number;
      intelligence?: number;
      vitality?: number;
      sense?: number;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify bot authentication
    const botSecret = req.headers.get('x-bot-secret');
    if (!BOT_SECRET || botSecret !== BOT_SECRET) {
      console.error('Invalid or missing bot secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid bot secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BotSyncRequest = await req.json();
    const { discord_id, action, data } = body;

    console.log(`Bot sync request: action=${action}, discord_id=${discord_id}`);

    if (!discord_id) {
      return new Response(
        JSON.stringify({ error: 'Missing discord_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user by Discord ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, hunter_name, avatar, title')
      .eq('discord_id', discord_id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Database error fetching profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle verify_link action (doesn't require existing link)
    if (action === 'verify_link') {
      return new Response(
        JSON.stringify({ 
          linked: !!profile,
          hunter_name: profile?.hunter_name || null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ 
          error: 'User not linked',
          message: 'This Discord account is not linked to a web app account. Please log in to the web app with Discord to link your accounts.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get player stats
    const { data: playerStats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', profile.user_id)
      .single();

    if (statsError || !playerStats) {
      console.error('Error fetching player stats:', statsError);
      return new Response(
        JSON.stringify({ error: 'Player stats not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'get_stats': {
        // Return current stats
        result = {
          success: true,
          profile: {
            hunter_name: profile.hunter_name,
            avatar: profile.avatar,
            title: profile.title,
          },
          stats: {
            level: playerStats.level,
            total_xp: playerStats.total_xp,
            weekly_xp: playerStats.weekly_xp,
            rank: playerStats.rank,
            strength: playerStats.strength,
            agility: playerStats.agility,
            intelligence: playerStats.intelligence,
            vitality: playerStats.vitality,
            sense: playerStats.sense,
            gold: playerStats.gold,
            gems: playerStats.gems,
            credits: playerStats.credits,
            unlocked_classes: playerStats.unlocked_classes,
            selected_card_frame: playerStats.selected_card_frame,
          }
        };
        break;
      }

      case 'add_xp': {
        const xpAmount = data?.xp || 0;
        const source = data?.source || 'discord_bot';

        if (xpAmount <= 0) {
          return new Response(
            JSON.stringify({ error: 'XP amount must be positive' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Rate limit: max 1000 XP per call
        const cappedXP = Math.min(xpAmount, 1000);

        // Calculate new level
        const newTotalXP = playerStats.total_xp + cappedXP;
        const newWeeklyXP = playerStats.weekly_xp + cappedXP;
        
        // Level calculation: XP needed for level L = L * 100
        // Total XP for level L = 100 * (L-1) * L / 2
        let newLevel = playerStats.level;
        while (100 * newLevel * (newLevel + 1) / 2 <= newTotalXP) {
          newLevel += 1;
        }

        // Determine rank
        let newRank = 'E-Rank';
        if (newLevel >= 100) newRank = 'S-Rank';
        else if (newLevel >= 75) newRank = 'A-Rank';
        else if (newLevel >= 50) newRank = 'B-Rank';
        else if (newLevel >= 25) newRank = 'C-Rank';
        else if (newLevel >= 6) newRank = 'D-Rank';

        const levelsGained = newLevel - playerStats.level;
        const abilityPointsGained = levelsGained * 5;

        // Update stats
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            total_xp: newTotalXP,
            weekly_xp: newWeeklyXP,
            level: newLevel,
            rank: newRank,
            available_points: playerStats.available_points + abilityPointsGained,
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error('Error updating stats:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Added ${cappedXP} XP to ${profile.hunter_name} (${discord_id}). Level: ${playerStats.level} -> ${newLevel}`);

        result = {
          success: true,
          xp_added: cappedXP,
          source,
          old_level: playerStats.level,
          new_level: newLevel,
          old_rank: playerStats.rank,
          new_rank: newRank,
          levels_gained: levelsGained,
          ability_points_gained: abilityPointsGained,
          total_xp: newTotalXP,
          weekly_xp: newWeeklyXP,
        };
        break;
      }

      case 'link_class': {
        const classId = data?.class_id;
        if (!classId) {
          return new Response(
            JSON.stringify({ error: 'Missing class_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const currentClasses = playerStats.unlocked_classes || [];
        if (currentClasses.includes(classId)) {
          result = {
            success: true,
            message: 'Class already unlocked',
            unlocked_classes: currentClasses,
          };
        } else {
          const newClasses = [...currentClasses, classId];
          
          const { error: updateError } = await supabase
            .from('player_stats')
            .update({ unlocked_classes: newClasses })
            .eq('user_id', profile.user_id);

          if (updateError) {
            console.error('Error updating classes:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update classes' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log(`Unlocked class ${classId} for ${profile.hunter_name}`);

          result = {
            success: true,
            message: `Class ${classId} unlocked`,
            unlocked_classes: newClasses,
          };
        }
        break;
      }

      case 'sync_stats': {
        // Sync specific stats from Discord bot
        const statsUpdate = data?.stats || {};
        const updateFields: Record<string, number> = {};

        if (statsUpdate.strength !== undefined) {
          updateFields.strength = Math.max(10, statsUpdate.strength);
        }
        if (statsUpdate.agility !== undefined) {
          updateFields.agility = Math.max(10, statsUpdate.agility);
        }
        if (statsUpdate.intelligence !== undefined) {
          updateFields.intelligence = Math.max(10, statsUpdate.intelligence);
        }
        if (statsUpdate.vitality !== undefined) {
          updateFields.vitality = Math.max(10, statsUpdate.vitality);
        }
        if (statsUpdate.sense !== undefined) {
          updateFields.sense = Math.max(10, statsUpdate.sense);
        }

        if (Object.keys(updateFields).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No stats to update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabase
          .from('player_stats')
          .update(updateFields)
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error('Error syncing stats:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to sync stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Synced stats for ${profile.hunter_name}:`, updateFields);

        result = {
          success: true,
          updated_stats: updateFields,
        };
        break;
      }

      // =====================
      // NEW: QUESTS
      // =====================
      case 'get_quests': {
        const { data: questData, error: questError } = await supabase
          .from('user_quests')
          .select('quests, last_reset_date')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (questError) {
          console.error('Error fetching quests:', questError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch quests' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const quests = questData?.quests || [];
        // Filter to today's active quests (not completed)
        const activeQuests = Array.isArray(quests) 
          ? quests.filter((q: { completed?: boolean }) => !q.completed)
          : [];

        result = {
          success: true,
          quests: activeQuests,
          total: Array.isArray(quests) ? quests.length : 0,
          completed: Array.isArray(quests) ? quests.filter((q: { completed?: boolean }) => q.completed).length : 0,
        };
        break;
      }

      case 'add_quest': {
        const questTitle = data?.quest_title;
        if (!questTitle) {
          return new Response(
            JSON.stringify({ error: 'Missing quest_title' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current quests
        const { data: questData, error: questError } = await supabase
          .from('user_quests')
          .select('quests')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        const currentQuests = Array.isArray(questData?.quests) ? questData.quests : [];
        
        // Create new quest with structure matching web app's DailyQuest interface
        const xpReward = Math.floor(Math.random() * 30) + 20; // 20-50 XP
        const statOptions = ['strength', 'agility', 'intelligence', 'vitality', 'sense'];
        const randomStat = statOptions[Math.floor(Math.random() * statOptions.length)];
        
        const newQuest = {
          id: crypto.randomUUID(),
          name: questTitle, // Web app uses 'name' not 'title'
          xpReward: xpReward, // Web app uses 'xpReward' not 'xp'
          statBoost: { stat: randomStat, amount: 1 }, // Required by web app
          completed: false,
          createdAt: new Date().toISOString(),
          source: 'discord',
        };

        const updatedQuests = [...currentQuests, newQuest];

        // Upsert quests
        const { error: updateError } = await supabase
          .from('user_quests')
          .upsert({
            user_id: profile.user_id,
            quests: updatedQuests,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (updateError) {
          console.error('Error adding quest:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to add quest' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Added quest for ${profile.hunter_name}: ${questTitle}`);

        result = {
          success: true,
          quest: newQuest,
          xp: xpReward,
          stat: randomStat,
          message: `Quest "${questTitle}" added!`,
        };
        break;
      }

      case 'complete_quest': {
        const questIndex = data?.quest_index;
        if (questIndex === undefined || questIndex < 0) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid quest_index' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current quests
        const { data: questData, error: questError } = await supabase
          .from('user_quests')
          .select('quests')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        const currentQuests = Array.isArray(questData?.quests) ? questData.quests : [];
        const activeQuests = currentQuests.filter((q: { completed?: boolean }) => !q.completed);

        if (questIndex >= activeQuests.length) {
          return new Response(
            JSON.stringify({ error: `Quest #${questIndex + 1} not found. You have ${activeQuests.length} active quests.` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const questToComplete = activeQuests[questIndex];
        // Support both old (xp/gold) and new (xpReward) formats
        const xpReward = questToComplete.xpReward || questToComplete.xp || 25;
        const goldReward = questToComplete.gold || 10;

        // Mark quest as completed
        const questId = questToComplete.id;
        const updatedQuests = currentQuests.map((q: { id: string; completed?: boolean }) => 
          q.id === questId ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
        );

        // Update quests
        const { error: updateQuestError } = await supabase
          .from('user_quests')
          .update({ quests: updatedQuests, updated_at: new Date().toISOString() })
          .eq('user_id', profile.user_id);

        if (updateQuestError) {
          console.error('Error completing quest:', updateQuestError);
          return new Response(
            JSON.stringify({ error: 'Failed to complete quest' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award XP and gold
        const newTotalXP = playerStats.total_xp + xpReward;
        const newWeeklyXP = playerStats.weekly_xp + xpReward;
        const newGold = playerStats.gold + goldReward;

        let newLevel = playerStats.level;
        while (100 * newLevel * (newLevel + 1) / 2 <= newTotalXP) {
          newLevel += 1;
        }

        const { error: updateStatsError } = await supabase
          .from('player_stats')
          .update({
            total_xp: newTotalXP,
            weekly_xp: newWeeklyXP,
            level: newLevel,
            gold: newGold,
          })
          .eq('user_id', profile.user_id);

        if (updateStatsError) {
          console.error('Error updating stats after quest:', updateStatsError);
        }

        console.log(`Completed quest for ${profile.hunter_name}: ${questToComplete.title}`);

        result = {
          success: true,
          quest: questToComplete,
          xp_earned: xpReward,
          gold_earned: goldReward,
          new_level: newLevel,
          leveled_up: newLevel > playerStats.level,
        };
        break;
      }

      // =====================
      // NEW: HABITS
      // =====================
      case 'get_habits': {
        const { data: habitData, error: habitError } = await supabase
          .from('user_habits')
          .select('habits')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (habitError) {
          console.error('Error fetching habits:', habitError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch habits' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const habits = habitData?.habits || [];
        const today = new Date().toISOString().split('T')[0];
        
        // Process habits to show today's status
        const processedHabits = Array.isArray(habits) ? habits.map((h: { 
          id: string; 
          name: string; 
          completedDates?: string[];
          xpReward?: number;
        }) => ({
          id: h.id,
          name: h.name,
          completed_today: h.completedDates?.includes(today) || false,
          xp: h.xpReward || 15,
        })) : [];

        result = {
          success: true,
          habits: processedHabits,
          total: processedHabits.length,
          completed_today: processedHabits.filter((h: { completed_today: boolean }) => h.completed_today).length,
        };
        break;
      }

      case 'complete_habit': {
        const habitId = data?.habit_id;
        if (!habitId) {
          return new Response(
            JSON.stringify({ error: 'Missing habit_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: habitData, error: habitError } = await supabase
          .from('user_habits')
          .select('habits')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        const habits = Array.isArray(habitData?.habits) ? habitData.habits : [];
        const today = new Date().toISOString().split('T')[0];
        
        const habitIndex = habits.findIndex((h: { id: string }) => h.id === habitId);
        if (habitIndex === -1) {
          return new Response(
            JSON.stringify({ error: 'Habit not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const habit = habits[habitIndex];
        const alreadyCompleted = habit.completedDates?.includes(today);
        
        if (alreadyCompleted) {
          return new Response(
            JSON.stringify({ error: 'Habit already completed today', habit_name: habit.name }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark habit as completed for today
        const updatedHabits = [...habits];
        updatedHabits[habitIndex] = {
          ...habit,
          completedDates: [...(habit.completedDates || []), today],
        };

        const { error: updateError } = await supabase
          .from('user_habits')
          .update({ habits: updatedHabits, updated_at: new Date().toISOString() })
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error('Error completing habit:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to complete habit' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award XP
        const xpReward = habit.xpReward || 15;
        const newTotalXP = playerStats.total_xp + xpReward;
        const newWeeklyXP = playerStats.weekly_xp + xpReward;

        let newLevel = playerStats.level;
        while (100 * newLevel * (newLevel + 1) / 2 <= newTotalXP) {
          newLevel += 1;
        }

        await supabase
          .from('player_stats')
          .update({ total_xp: newTotalXP, weekly_xp: newWeeklyXP, level: newLevel })
          .eq('user_id', profile.user_id);

        console.log(`Completed habit for ${profile.hunter_name}: ${habit.name}`);

        result = {
          success: true,
          habit_name: habit.name,
          xp_earned: xpReward,
          new_level: newLevel,
          leveled_up: newLevel > playerStats.level,
        };
        break;
      }

      // =====================
      // NEW: STREAK
      // =====================
      case 'get_streak': {
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('current_streak, longest_streak, last_completion_date, total_rewards')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (streakError) {
          console.error('Error fetching streak:', streakError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch streak' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastCompletion = streakData?.last_completion_date?.split('T')[0];
        
        let streakStatus = 'at_risk';
        if (lastCompletion === today) {
          streakStatus = 'safe';
        } else if (lastCompletion === yesterday) {
          streakStatus = 'pending';
        }

        result = {
          success: true,
          current_streak: streakData?.current_streak || 0,
          longest_streak: streakData?.longest_streak || 0,
          last_completion: lastCompletion || null,
          status: streakStatus,
          total_rewards: streakData?.total_rewards || 0,
        };
        break;
      }

      // =====================
      // NEW: GATES
      // =====================
      case 'get_gates': {
        const { data: gateData, error: gateError } = await supabase
          .from('user_gates')
          .select('gates')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (gateError) {
          console.error('Error fetching gates:', gateError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch gates' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const gates = gateData?.gates || [];
        const activeGates = Array.isArray(gates) 
          ? gates.filter((g: { completed?: boolean }) => !g.completed)
          : [];

        result = {
          success: true,
          gates: activeGates,
          total: Array.isArray(gates) ? gates.length : 0,
          completed: Array.isArray(gates) ? gates.filter((g: { completed?: boolean }) => g.completed).length : 0,
        };
        break;
      }

      // =====================
      // NEW: CHALLENGES
      // =====================
      case 'get_challenges': {
        const { data: challengeData, error: challengeError } = await supabase
          .from('user_challenges')
          .select('challenges, claimed_challenges')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (challengeError) {
          console.error('Error fetching challenges:', challengeError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch challenges' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const challenges = challengeData?.challenges || [];
        const claimed = challengeData?.claimed_challenges || [];
        
        // Separate daily and weekly
        const daily = Array.isArray(challenges) 
          ? challenges.filter((c: { type?: string }) => c.type === 'daily' || !c.type)
          : [];
        const weekly = Array.isArray(challenges) 
          ? challenges.filter((c: { type?: string }) => c.type === 'weekly')
          : [];

        result = {
          success: true,
          daily: daily,
          weekly: weekly,
          claimed_count: Array.isArray(claimed) ? claimed.length : 0,
        };
        break;
      }

      // =====================
      // NEW: CARD DATA (for /card command)
      // =====================
      case 'get_card_data': {
        const totalPower = playerStats.strength + playerStats.agility + 
                          playerStats.intelligence + playerStats.vitality + playerStats.sense;

        result = {
          success: true,
          hunter_name: profile.hunter_name,
          title: profile.title || 'Awakened Hunter',
          avatar: profile.avatar,
          level: playerStats.level,
          rank: playerStats.rank,
          total_xp: playerStats.total_xp,
          weekly_xp: playerStats.weekly_xp,
          power: totalPower,
          stats: {
            strength: playerStats.strength,
            agility: playerStats.agility,
            intelligence: playerStats.intelligence,
            vitality: playerStats.vitality,
            sense: playerStats.sense,
          },
          gold: playerStats.gold,
          gems: playerStats.gems,
          credits: playerStats.credits,
          selected_frame: playerStats.selected_card_frame || 'default',
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Bot sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});