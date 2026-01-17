export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      custom_frames: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_supporter_exclusive: boolean | null
          name: string
          rarity: string | null
          supporter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url?: string | null
          is_supporter_exclusive?: boolean | null
          name: string
          rarity?: string | null
          supporter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_supporter_exclusive?: boolean | null
          name?: string
          rarity?: string | null
          supporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_frames_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "supporters"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      guild_challenge_contributions: {
        Row: {
          challenge_id: string
          contribution: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          contribution?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          contribution?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_challenge_contributions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "guild_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_challenges: {
        Row: {
          created_at: string
          current_value: number
          description: string | null
          ends_at: string
          guild_id: string
          id: string
          is_completed: boolean
          reward_gold: number
          reward_xp: number
          starts_at: string
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at?: string
          guild_id: string
          id?: string
          is_completed?: boolean
          reward_gold?: number
          reward_xp?: number
          starts_at?: string
          target_value?: number
          title: string
        }
        Update: {
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at?: string
          guild_id?: string
          id?: string
          is_completed?: boolean
          reward_gold?: number
          reward_xp?: number
          starts_at?: string
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_challenges_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_invites: {
        Row: {
          created_at: string
          expires_at: string
          guild_id: string
          id: string
          invitee_id: string
          inviter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          guild_id: string
          id?: string
          invitee_id: string
          inviter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          guild_id?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_invites_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          contribution_xp: number
          guild_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["guild_role"]
          user_id: string
        }
        Insert: {
          contribution_xp?: number
          guild_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["guild_role"]
          user_id: string
        }
        Update: {
          contribution_xp?: number
          guild_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["guild_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          access_type: Database["public"]["Enums"]["guild_access_type"]
          created_at: string
          description: string | null
          emblem: string | null
          id: string
          master_id: string
          max_members: number
          name: string
          total_power: number
          updated_at: string
          weekly_xp: number
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["guild_access_type"]
          created_at?: string
          description?: string | null
          emblem?: string | null
          id?: string
          master_id: string
          max_members?: number
          name: string
          total_power?: number
          updated_at?: string
          weekly_xp?: number
        }
        Update: {
          access_type?: Database["public"]["Enums"]["guild_access_type"]
          created_at?: string
          description?: string | null
          emblem?: string | null
          id?: string
          master_id?: string
          max_members?: number
          name?: string
          total_power?: number
          updated_at?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      pending_level_ups: {
        Row: {
          created_at: string
          discord_id: string
          hunter_name: string
          id: string
          is_rank_up: boolean
          new_level: number
          new_rank: string
          old_level: number
          old_rank: string
          processed: boolean
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          discord_id: string
          hunter_name: string
          id?: string
          is_rank_up?: boolean
          new_level: number
          new_rank: string
          old_level: number
          old_rank: string
          processed?: boolean
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          discord_id?: string
          hunter_name?: string
          id?: string
          is_rank_up?: boolean
          new_level?: number
          new_rank?: string
          old_level?: number
          old_rank?: string
          processed?: boolean
          processed_at?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          agility: number
          available_points: number
          created_at: string | null
          credits: number
          gems: number
          gold: number
          id: string
          intelligence: number
          level: number
          rank: string
          selected_card_frame: string | null
          sense: number
          strength: number
          total_xp: number
          unlocked_card_frames: string[] | null
          unlocked_classes: string[] | null
          updated_at: string | null
          user_id: string
          vitality: number
          week_start_date: string | null
          weekly_xp: number
        }
        Insert: {
          agility?: number
          available_points?: number
          created_at?: string | null
          credits?: number
          gems?: number
          gold?: number
          id?: string
          intelligence?: number
          level?: number
          rank?: string
          selected_card_frame?: string | null
          sense?: number
          strength?: number
          total_xp?: number
          unlocked_card_frames?: string[] | null
          unlocked_classes?: string[] | null
          updated_at?: string | null
          user_id: string
          vitality?: number
          week_start_date?: string | null
          weekly_xp?: number
        }
        Update: {
          agility?: number
          available_points?: number
          created_at?: string | null
          credits?: number
          gems?: number
          gold?: number
          id?: string
          intelligence?: number
          level?: number
          rank?: string
          selected_card_frame?: string | null
          sense?: number
          strength?: number
          total_xp?: number
          unlocked_card_frames?: string[] | null
          unlocked_classes?: string[] | null
          updated_at?: string | null
          user_id?: string
          vitality?: number
          week_start_date?: string | null
          weekly_xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          discord_id: string | null
          hunter_name: string
          id: string
          is_public: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          discord_id?: string | null
          hunter_name?: string
          id?: string
          is_public?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          discord_id?: string | null
          hunter_name?: string
          id?: string
          is_public?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      redemption_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          supporter_id: string | null
          tier: Database["public"]["Enums"]["supporter_tier"]
          unlocks_badge: boolean | null
          unlocks_frame: string | null
          unlocks_title: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          supporter_id?: string | null
          tier: Database["public"]["Enums"]["supporter_tier"]
          unlocks_badge?: boolean | null
          unlocks_frame?: string | null
          unlocks_title?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          supporter_id?: string | null
          tier?: Database["public"]["Enums"]["supporter_tier"]
          unlocks_badge?: boolean | null
          unlocks_frame?: string | null
          unlocks_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemption_codes_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "supporters"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_duels: {
        Row: {
          challenged_id: string
          challenged_streak: number
          challenger_id: string
          challenger_streak: number
          created_at: string
          ends_at: string
          id: string
          last_pool_update: string | null
          reward_pool: number
          starts_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          challenged_id: string
          challenged_streak?: number
          challenger_id: string
          challenger_streak?: number
          created_at?: string
          ends_at?: string
          id?: string
          last_pool_update?: string | null
          reward_pool?: number
          starts_at?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          challenged_id?: string
          challenged_streak?: number
          challenger_id?: string
          challenger_streak?: number
          created_at?: string
          ends_at?: string
          id?: string
          last_pool_update?: string | null
          reward_pool?: number
          starts_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      supporters: {
        Row: {
          created_at: string | null
          custom_frame_id: string | null
          custom_title: string | null
          discord_username: string | null
          display_order: number | null
          hunter_name: string
          id: string
          is_visible: boolean | null
          ko_fi_username: string | null
          tier: Database["public"]["Enums"]["supporter_tier"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_frame_id?: string | null
          custom_title?: string | null
          discord_username?: string | null
          display_order?: number | null
          hunter_name: string
          id?: string
          is_visible?: boolean | null
          ko_fi_username?: string | null
          tier?: Database["public"]["Enums"]["supporter_tier"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_frame_id?: string | null
          custom_title?: string | null
          discord_username?: string | null
          display_order?: number | null
          hunter_name?: string
          id?: string
          is_visible?: boolean | null
          ko_fi_username?: string | null
          tier?: Database["public"]["Enums"]["supporter_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          active_boost: Json | null
          challenges: Json
          claimed_challenges: Json
          created_at: string
          id: string
          necro_challenge: Json | null
          updated_at: string
          user_id: string
          user_settings: Json
          xp_history: Json
        }
        Insert: {
          active_boost?: Json | null
          challenges?: Json
          claimed_challenges?: Json
          created_at?: string
          id?: string
          necro_challenge?: Json | null
          updated_at?: string
          user_id: string
          user_settings?: Json
          xp_history?: Json
        }
        Update: {
          active_boost?: Json | null
          challenges?: Json
          claimed_challenges?: Json
          created_at?: string
          id?: string
          necro_challenge?: Json | null
          updated_at?: string
          user_id?: string
          user_settings?: Json
          xp_history?: Json
        }
        Relationships: []
      }
      user_gates: {
        Row: {
          created_at: string
          gates: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gates?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gates?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_habits: {
        Row: {
          created_at: string
          habits: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habits?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          habits?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          created_at: string
          id: string
          last_reset_date: string | null
          quests: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_date?: string | null
          quests?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_date?: string | null
          quests?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_completion_date: string | null
          longest_streak: number
          total_rewards: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          longest_streak?: number
          total_rewards?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          longest_streak?: number
          total_rewards?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_player_xp: {
        Args: { _user_id: string; _xp_amount: number }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guild_elite_or_higher: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_leader: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_member: {
        Args: { _guild_id: string; _user_id: string }
        Returns: boolean
      }
      is_guild_public: { Args: { _guild_id: string }; Returns: boolean }
      reset_weekly_xp: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      friendship_status: "pending" | "accepted" | "declined" | "blocked"
      guild_access_type: "public" | "private" | "invite_only"
      guild_role: "guild_master" | "vice_master" | "elite" | "member"
      supporter_tier:
        | "e_rank"
        | "d_rank"
        | "c_rank"
        | "b_rank"
        | "a_rank"
        | "s_rank"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      friendship_status: ["pending", "accepted", "declined", "blocked"],
      guild_access_type: ["public", "private", "invite_only"],
      guild_role: ["guild_master", "vice_master", "elite", "member"],
      supporter_tier: [
        "e_rank",
        "d_rank",
        "c_rank",
        "b_rank",
        "a_rank",
        "s_rank",
      ],
    },
  },
} as const
