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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      game_masters: {
        Row: {
          available: boolean | null
          avatar: string | null
          created_at: string
          id: string
          name: string
          profile_id: string
        }
        Insert: {
          available?: boolean | null
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          profile_id: string
        }
        Update: {
          available?: boolean | null
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_requests: {
        Row: {
          company: string
          created_at: string
          id: string
          name: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          name: string
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          name?: string
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_key: string | null
          city: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          owner_name: string | null
          panel_password: string | null
          panel_username: string | null
          plan_status: string | null
          plan_type: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
        }
        Insert: {
          access_key?: string | null
          city?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id: string
          owner_name?: string | null
          panel_password?: string | null
          panel_username?: string | null
          plan_status?: string | null
          plan_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
        }
        Update: {
          access_key?: string | null
          city?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          owner_name?: string | null
          panel_password?: string | null
          panel_username?: string | null
          plan_status?: string | null
          plan_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          client_name: string
          created_at: string
          date: string
          game_master_id: string | null
          id: string
          players: number | null
          profile_id: string
          sala_id: string
          status: string
          time: string
        }
        Insert: {
          client_name: string
          created_at?: string
          date: string
          game_master_id?: string | null
          id?: string
          players?: number | null
          profile_id: string
          sala_id: string
          status?: string
          time: string
        }
        Update: {
          client_name?: string
          created_at?: string
          date?: string
          game_master_id?: string | null
          id?: string
          players?: number | null
          profile_id?: string
          sala_id?: string
          status?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_game_master_id_fkey"
            columns: ["game_master_id"]
            isOneToOne: false
            referencedRelation: "game_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          active: boolean | null
          capacity: number | null
          created_at: string
          difficulty: number | null
          id: string
          name: string
          profile_id: string
          theme: string | null
        }
        Insert: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          name: string
          profile_id: string
          theme?: string | null
        }
        Update: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string
          difficulty?: number | null
          id?: string
          name?: string
          profile_id?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          id: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      validation_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_user_stats: { Args: never; Returns: Json }
      admin_list_users: {
        Args: never
        Returns: {
          access_key: string | null
          city: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          owner_name: string | null
          panel_password: string | null
          panel_username: string | null
          plan_status: string | null
          plan_type: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_update_plan: {
        Args: { new_plan: string; target_user_id: string }
        Returns: undefined
      }
      cleanup_old_validation_attempts: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
