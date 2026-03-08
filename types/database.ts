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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      eventi: {
        Row: {
          created_at: string
          creato_da: string | null
          data_fine: string | null
          data_inizio: string
          descrizione: string | null
          id: string
          luogo: string | null
          max_partecipanti: number | null
          pubblico: boolean
          tipo: string
          titolo: string
        }
        Insert: {
          created_at?: string
          creato_da?: string | null
          data_fine?: string | null
          data_inizio: string
          descrizione?: string | null
          id?: string
          luogo?: string | null
          max_partecipanti?: number | null
          pubblico?: boolean
          tipo: string
          titolo: string
        }
        Update: {
          created_at?: string
          creato_da?: string | null
          data_fine?: string | null
          data_inizio?: string
          descrizione?: string | null
          id?: string
          luogo?: string | null
          max_partecipanti?: number | null
          pubblico?: boolean
          tipo?: string
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventi_creato_da_fkey"
            columns: ["creato_da"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      partecipazioni: {
        Row: {
          created_at: string
          evento_id: string
          id: string
          socio_id: string
        }
        Insert: {
          created_at?: string
          evento_id: string
          id?: string
          socio_id: string
        }
        Update: {
          created_at?: string
          evento_id?: string
          id?: string
          socio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partecipazioni_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partecipazioni_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      profili_pubblici: {
        Row: {
          abilitato: boolean
          created_at: string
          id: string
          slug: string
          socio_id: string
        }
        Insert: {
          abilitato?: boolean
          created_at?: string
          id?: string
          slug: string
          socio_id: string
        }
        Update: {
          abilitato?: boolean
          created_at?: string
          id?: string
          slug?: string
          socio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profili_pubblici_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: true
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      soci: {
        Row: {
          attivo: boolean
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          cognome: string
          created_at: string
          data_iscrizione: string
          data_nascita: string | null
          email: string
          giochi_preferiti: string[] | null
          id: string
          nickname: string | null
          nome: string
          pubblica_bio: boolean
          pubblica_data_nascita: boolean
          pubblica_email: boolean
          pubblica_giochi: boolean
          pubblica_nome_completo: boolean
          pubblica_telefono: boolean
          ruolo: string
          telefono: string | null
        }
        Insert: {
          attivo?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          cognome: string
          created_at?: string
          data_iscrizione?: string
          data_nascita?: string | null
          email: string
          giochi_preferiti?: string[] | null
          id?: string
          nickname?: string | null
          nome: string
          pubblica_bio?: boolean
          pubblica_data_nascita?: boolean
          pubblica_email?: boolean
          pubblica_giochi?: boolean
          pubblica_nome_completo?: boolean
          pubblica_telefono?: boolean
          ruolo?: string
          telefono?: string | null
        }
        Update: {
          attivo?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          cognome?: string
          created_at?: string
          data_iscrizione?: string
          data_nascita?: string | null
          email?: string
          giochi_preferiti?: string[] | null
          id?: string
          nickname?: string | null
          nome?: string
          pubblica_bio?: boolean
          pubblica_data_nascita?: boolean
          pubblica_email?: boolean
          pubblica_giochi?: boolean
          pubblica_nome_completo?: boolean
          pubblica_telefono?: boolean
          ruolo?: string
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vista_profili_pubblici: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cognome: string | null
          data_iscrizione: string
          data_nascita: string | null
          email: string | null
          giochi_preferiti: string[] | null
          nickname: string | null
          nome: string | null
          slug: string
          telefono: string | null
        }
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
