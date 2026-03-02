// Tipi generati da Supabase — aggiornare con:
// npx supabase gen types typescript --project-id <project-ref> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      soci: {
        Row: {
          id: string
          auth_user_id: string | null
          nome: string
          cognome: string
          email: string
          ruolo: 'admin' | 'socio'
          data_iscrizione: string
          attivo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          nome: string
          cognome: string
          email: string
          ruolo?: 'admin' | 'socio'
          data_iscrizione?: string
          attivo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          nome?: string
          cognome?: string
          email?: string
          ruolo?: 'admin' | 'socio'
          data_iscrizione?: string
          attivo?: boolean
          created_at?: string
        }
      }
      eventi: {
        Row: {
          id: string
          titolo: string
          descrizione: string | null
          tipo: 'evento' | 'torneo'
          data_inizio: string
          data_fine: string | null
          luogo: string | null
          max_partecipanti: number | null
          creato_da: string | null
          created_at: string
        }
        Insert: {
          id?: string
          titolo: string
          descrizione?: string | null
          tipo: 'evento' | 'torneo'
          data_inizio: string
          data_fine?: string | null
          luogo?: string | null
          max_partecipanti?: number | null
          creato_da?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          titolo?: string
          descrizione?: string | null
          tipo?: 'evento' | 'torneo'
          data_inizio?: string
          data_fine?: string | null
          luogo?: string | null
          max_partecipanti?: number | null
          creato_da?: string | null
          created_at?: string
        }
      }
      partecipazioni: {
        Row: {
          id: string
          evento_id: string
          socio_id: string
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          socio_id: string
          created_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          socio_id?: string
          created_at?: string
        }
      }
    }
  }
}
