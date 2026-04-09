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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          item_id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          item_id: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          item_id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          color_tag: string
          created_at: string
          description: string
          documentation: string
          id: string
          name: string
          prompts: string
          status: Database["public"]["Enums"]["app_status"]
          priority_tier: string | null
          category: string | null
          product_status: string | null
          owner: string | null
          repo_url: string | null
          hosting_url: string | null
        }
        Insert: {
          color_tag?: string
          created_at?: string
          description?: string
          documentation?: string
          id?: string
          name: string
          prompts?: string
          status?: Database["public"]["Enums"]["app_status"]
          priority_tier?: string | null
          category?: string | null
          product_status?: string | null
          owner?: string | null
          repo_url?: string | null
          hosting_url?: string | null
        }
        Update: {
          color_tag?: string
          created_at?: string
          description?: string
          documentation?: string
          id?: string
          name?: string
          prompts?: string
          status?: Database["public"]["Enums"]["app_status"]
          priority_tier?: string | null
          category?: string | null
          product_status?: string | null
          owner?: string | null
          repo_url?: string | null
          hosting_url?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          item_id: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          item_id: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          app_id: string
          assignee: string
          created_at: string
          created_by: string
          deployed_at: string | null
          description: string
          environment: Database["public"]["Enums"]["deploy_environment"] | null
          id: string
          priority: Database["public"]["Enums"]["item_priority"]
          status: Database["public"]["Enums"]["item_status"]
          title: string
          type: Database["public"]["Enums"]["item_type"]
          updated_at: string
          version: string | null
          roadmap_milestone: string | null
          security_severity: string | null
          target_date: string | null
          owner: string | null
          dependency: string | null
          is_blocker: boolean
        }
        Insert: {
          app_id: string
          assignee?: string
          created_at?: string
          created_by: string
          deployed_at?: string | null
          description?: string
          environment?: Database["public"]["Enums"]["deploy_environment"] | null
          id?: string
          priority?: Database["public"]["Enums"]["item_priority"]
          status?: Database["public"]["Enums"]["item_status"]
          title: string
          type?: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          version?: string | null
          roadmap_milestone?: string | null
          security_severity?: string | null
          target_date?: string | null
          owner?: string | null
          dependency?: string | null
          is_blocker?: boolean
        }
        Update: {
          app_id?: string
          assignee?: string
          created_at?: string
          created_by?: string
          deployed_at?: string | null
          description?: string
          environment?: Database["public"]["Enums"]["deploy_environment"] | null
          id?: string
          priority?: Database["public"]["Enums"]["item_priority"]
          status?: Database["public"]["Enums"]["item_status"]
          title?: string
          type?: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          version?: string | null
          roadmap_milestone?: string | null
          security_severity?: string | null
          target_date?: string | null
          owner?: string | null
          dependency?: string | null
          is_blocker?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "items_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          name?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          id: string
          name: string
          target_date: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          target_date: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          target_date?: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assignee: {
        Args: { _assignee: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      app_status: "Active" | "Paused" | "Archived"
      deploy_environment: "Dev" | "Staging" | "Production"
      item_priority: "Low" | "Medium" | "High" | "Critical"
      item_status:
        | "Idea"
        | "In Progress"
        | "In Review"
        | "Done"
        | "Deployed"
        | "Blocked"
      item_type: "Feature" | "Bug" | "Decision" | "Deployment" | "Security"
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
      app_role: ["admin", "member"],
      app_status: ["Active", "Paused", "Archived"],
      deploy_environment: ["Dev", "Staging", "Production"],
      item_priority: ["Low", "Medium", "High", "Critical"],
      item_status: [
        "Idea",
        "In Progress",
        "In Review",
        "Done",
        "Deployed",
        "Blocked",
      ],
      item_type: ["Feature", "Bug", "Decision", "Deployment", "Security"],
    },
  },
} as const
