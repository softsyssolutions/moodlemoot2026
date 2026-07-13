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
      chatbot_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message_count: number | null
          name: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message_count?: number | null
          name: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message_count?: number | null
          name?: string
          source?: string | null
        }
        Relationships: []
      }
      check_in_events: {
        Row: {
          category: string
          checked_in_at: string
          checked_in_by: string | null
          event_id: string | null
          id: string
          registration_id: string
        }
        Insert: {
          category: string
          checked_in_at?: string
          checked_in_by?: string | null
          event_id?: string | null
          id?: string
          registration_id: string
        }
        Update: {
          category?: string
          checked_in_at?: string
          checked_in_by?: string | null
          event_id?: string | null
          id?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_events_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          max_uses: number | null
          requires_id_card: boolean
          updated_at: string
          uses_count: number
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          created_at?: string
          discount_percent: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          requires_id_card?: boolean
          updated_at?: string
          uses_count?: number
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          requires_id_card?: boolean
          updated_at?: string
          uses_count?: number
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          amount_paid: number
          attendance_type: string
          category: string
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          city: string
          consent: boolean
          country: string
          coupon_code: string | null
          created_at: string
          currency: string
          email: string
          event_id: string | null
          full_name: string
          id: string
          id_card_status: string
          id_card_url: string | null
          institution: string
          institution_type: string
          internal_notes: string | null
          is_manual: boolean
          last_edited_at: string | null
          last_edited_by: string | null
          paid_at: string | null
          payment_method: string
          payment_status: string
          registered_by: string | null
          role_title: string
          ticket_id: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          amount_paid?: number
          attendance_type: string
          category?: string
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          city: string
          consent?: boolean
          country: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          email: string
          event_id?: string | null
          full_name: string
          id?: string
          id_card_status?: string
          id_card_url?: string | null
          institution: string
          institution_type: string
          internal_notes?: string | null
          is_manual?: boolean
          last_edited_at?: string | null
          last_edited_by?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          registered_by?: string | null
          role_title: string
          ticket_id: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          amount_paid?: number
          attendance_type?: string
          category?: string
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          city?: string
          consent?: boolean
          country?: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          email?: string
          event_id?: string | null
          full_name?: string
          id?: string
          id_card_status?: string
          id_card_url?: string | null
          institution?: string
          institution_type?: string
          internal_notes?: string | null
          is_manual?: boolean
          last_edited_at?: string | null
          last_edited_by?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          registered_by?: string | null
          role_title?: string
          ticket_id?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_requirements: {
        Row: {
          active: boolean
          allow_delegate: boolean
          config: Json
          created_at: string
          entity: Database["public"]["Enums"]["portal_entity"]
          event_id: string
          help: string | null
          id: string
          is_global: boolean
          is_required: boolean
          key: string
          label: string
          order_index: number
          publishes_to_web: boolean
          type: Database["public"]["Enums"]["requirement_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_delegate?: boolean
          config?: Json
          created_at?: string
          entity: Database["public"]["Enums"]["portal_entity"]
          event_id: string
          help?: string | null
          id?: string
          is_global?: boolean
          is_required?: boolean
          key: string
          label: string
          order_index?: number
          publishes_to_web?: boolean
          type?: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_delegate?: boolean
          config?: Json
          created_at?: string
          entity?: Database["public"]["Enums"]["portal_entity"]
          event_id?: string
          help?: string | null
          id?: string
          is_global?: boolean
          is_required?: boolean
          key?: string
          label?: string
          order_index?: number
          publishes_to_web?: boolean
          type?: Database["public"]["Enums"]["requirement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_requirements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sessions: {
        Row: {
          created_at: string
          day: string | null
          description: string | null
          end_time: string | null
          event_id: string
          id: string
          room: string | null
          speaker_id: string | null
          start_time: string | null
          title: string
          type: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          day?: string | null
          description?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          room?: string | null
          speaker_id?: string | null
          start_time?: string | null
          title: string
          type?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          day?: string | null
          description?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          room?: string | null
          speaker_id?: string | null
          start_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sessions_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "event_speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          bio: string | null
          created_at: string
          event_id: string
          id: string
          name: string
          order_index: number
          org: string | null
          photo_url: string | null
          socials: Json
          title: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          bio?: string | null
          created_at?: string
          event_id: string
          id?: string
          name: string
          order_index?: number
          org?: string | null
          photo_url?: string | null
          socials?: Json
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          bio?: string | null
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          order_index?: number
          org?: string | null
          photo_url?: string | null
          socials?: Json
          title?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          logo_url: string | null
          name: string
          order_index: number
          tier: string
          updated_at: string
          visible: boolean
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          logo_url?: string | null
          name: string
          order_index?: number
          tier?: string
          updated_at?: string
          visible?: boolean
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          logo_url?: string | null
          name?: string
          order_index?: number
          tier?: string
          updated_at?: string
          visible?: boolean
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          about_text: string | null
          brand_color: string | null
          brand_logo_url: string | null
          created_at: string
          edition: string | null
          end_date: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          location: string | null
          name: string
          slug: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          created_at?: string
          edition?: string | null
          end_date?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          location?: string | null
          name: string
          slug: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          created_at?: string
          edition?: string | null
          end_date?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          location?: string | null
          name?: string
          slug?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          provider: string
          provider_capture_id: string | null
          provider_order_id: string | null
          raw_payload: Json | null
          registration_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string
          provider_capture_id?: string | null
          provider_order_id?: string | null
          raw_payload?: Json | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          provider?: string
          provider_capture_id?: string | null
          provider_order_id?: string | null
          raw_payload?: Json | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      push_campaigns: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          event_id: string | null
          failed_count: number
          icon_url: string | null
          id: string
          sent_at: string | null
          sent_count: number
          status: string
          target: string
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          failed_count?: number
          icon_url?: string | null
          id?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          target?: string
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          failed_count?: number
          icon_url?: string | null
          id?: string
          sent_at?: string | null
          sent_count?: number
          status?: string
          target?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          endpoint: string
          event_id: string | null
          id: string
          last_seen_at: string
          locale: string | null
          p256dh: string
          revoked_at: string | null
          subscribed_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          endpoint: string
          event_id?: string | null
          id?: string
          last_seen_at?: string
          locale?: string | null
          p256dh: string
          revoked_at?: string | null
          subscribed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          endpoint?: string
          event_id?: string | null
          id?: string
          last_seen_at?: string
          locale?: string | null
          p256dh?: string
          revoked_at?: string | null
          subscribed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      registration_audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changes: Json
          id: string
          registration_id: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changes?: Json
          id?: string
          registration_id: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changes?: Json
          id?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_audit_log_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_overrides: {
        Row: {
          applies: boolean
          created_at: string
          custom_help: string | null
          custom_label: string | null
          custom_required: boolean | null
          custom_type: Database["public"]["Enums"]["requirement_type"] | null
          id: string
          order_index: number
          portal_id: string
          portal_type: Database["public"]["Enums"]["portal_entity"]
          requirement_id: string | null
        }
        Insert: {
          applies?: boolean
          created_at?: string
          custom_help?: string | null
          custom_label?: string | null
          custom_required?: boolean | null
          custom_type?: Database["public"]["Enums"]["requirement_type"] | null
          id?: string
          order_index?: number
          portal_id: string
          portal_type: Database["public"]["Enums"]["portal_entity"]
          requirement_id?: string | null
        }
        Update: {
          applies?: boolean
          created_at?: string
          custom_help?: string | null
          custom_label?: string | null
          custom_required?: boolean | null
          custom_type?: Database["public"]["Enums"]["requirement_type"] | null
          id?: string
          order_index?: number
          portal_id?: string
          portal_type?: Database["public"]["Enums"]["portal_entity"]
          requirement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_overrides_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "event_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_values: {
        Row: {
          completed: boolean
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_delegated: boolean
          portal_id: string
          portal_type: Database["public"]["Enums"]["portal_entity"]
          requirement_id: string
          updated_at: string
          value_text: string | null
          value_url: string | null
        }
        Insert: {
          completed?: boolean
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_delegated?: boolean
          portal_id: string
          portal_type: Database["public"]["Enums"]["portal_entity"]
          requirement_id: string
          updated_at?: string
          value_text?: string | null
          value_url?: string | null
        }
        Update: {
          completed?: boolean
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_delegated?: boolean
          portal_id?: string
          portal_type?: Database["public"]["Enums"]["portal_entity"]
          requirement_id?: string
          updated_at?: string
          value_text?: string | null
          value_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_values_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "event_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_portal: {
        Row: {
          admin_notified_at: string | null
          approved_at: string | null
          approved_by: string | null
          closed: boolean
          completed_at: string | null
          country_dial_code: string | null
          created_at: string
          created_by: string | null
          email: string
          event_id: string
          id: string
          invitation_count: number
          invitation_sent_at: string | null
          last_activity_at: string | null
          name: string
          order_index: number
          published_speaker_id: string | null
          status: Database["public"]["Enums"]["portal_status"]
          token: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notified_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          closed?: boolean
          completed_at?: string | null
          country_dial_code?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          event_id: string
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          last_activity_at?: string | null
          name: string
          order_index?: number
          published_speaker_id?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          token: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notified_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          closed?: boolean
          completed_at?: string | null
          country_dial_code?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          event_id?: string
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          last_activity_at?: string | null
          name?: string
          order_index?: number
          published_speaker_id?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          token?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speaker_portal_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaker_portal_published_speaker_id_fkey"
            columns: ["published_speaker_id"]
            isOneToOne: false
            referencedRelation: "event_speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_proposals: {
        Row: {
          cargo: string
          created_at: string
          eje_tematico: string
          email: string
          enlace_respaldo: string | null
          estado: string
          event_id: string | null
          id: string
          institucion_empresa: string
          modalidad: string
          nombre_completo: string
          pais: string
          published_speaker_id: string | null
          resumen_abstract: string
          titulo_ponencia: string
          whatsapp: string
        }
        Insert: {
          cargo: string
          created_at?: string
          eje_tematico: string
          email: string
          enlace_respaldo?: string | null
          estado?: string
          event_id?: string | null
          id?: string
          institucion_empresa: string
          modalidad: string
          nombre_completo: string
          pais: string
          published_speaker_id?: string | null
          resumen_abstract: string
          titulo_ponencia: string
          whatsapp: string
        }
        Update: {
          cargo?: string
          created_at?: string
          eje_tematico?: string
          email?: string
          enlace_respaldo?: string | null
          estado?: string
          event_id?: string | null
          id?: string
          institucion_empresa?: string
          modalidad?: string
          nombre_completo?: string
          pais?: string
          published_speaker_id?: string | null
          resumen_abstract?: string
          titulo_ponencia?: string
          whatsapp?: string
        }
        Relationships: []
      }
      sponsor_portal: {
        Row: {
          admin_notified_at: string | null
          approved_at: string | null
          approved_by: string | null
          closed: boolean
          completed_at: string | null
          country_dial_code: string | null
          created_at: string
          created_by: string | null
          email: string
          event_id: string
          id: string
          invitation_count: number
          invitation_sent_at: string | null
          last_activity_at: string | null
          name: string
          order_index: number
          published_sponsor_id: string | null
          status: Database["public"]["Enums"]["portal_status"]
          tier: string | null
          token: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notified_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          closed?: boolean
          completed_at?: string | null
          country_dial_code?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          event_id: string
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          last_activity_at?: string | null
          name: string
          order_index?: number
          published_sponsor_id?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          tier?: string | null
          token: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notified_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          closed?: boolean
          completed_at?: string | null
          country_dial_code?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          event_id?: string
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          last_activity_at?: string | null
          name?: string
          order_index?: number
          published_sponsor_id?: string | null
          status?: Database["public"]["Enums"]["portal_status"]
          tier?: string | null
          token?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_portal_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_portal_published_sponsor_id_fkey"
            columns: ["published_sponsor_id"]
            isOneToOne: false
            referencedRelation: "event_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_proposals: {
        Row: {
          company: string
          created_at: string
          email: string
          event_id: string | null
          id: string
          locale: string | null
          name: string
          phone: string
          position: string
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          locale?: string | null
          name: string
          phone: string
          position: string
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          locale?: string | null
          name?: string
          phone?: string
          position?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      claim_first_admin: { Args: never; Returns: boolean }
      claim_super_admin: { Args: never; Returns: boolean }
      generate_ticket_id: { Args: never; Returns: string }
      get_user_emails: {
        Args: { _ids: string[] }
        Returns: {
          email: string
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_use: { Args: { _code: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_staff_or_above: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_registration_paid: {
        Args: {
          _amount: number
          _category: string
          _coupon_code?: string
          _id: string
        }
        Returns: {
          amount_paid: number
          attendance_type: string
          category: string
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          city: string
          consent: boolean
          country: string
          coupon_code: string | null
          created_at: string
          currency: string
          email: string
          event_id: string | null
          full_name: string
          id: string
          id_card_status: string
          id_card_url: string | null
          institution: string
          institution_type: string
          internal_notes: string | null
          is_manual: boolean
          last_edited_at: string | null
          last_edited_by: string | null
          paid_at: string | null
          payment_method: string
          payment_status: string
          registered_by: string | null
          role_title: string
          ticket_id: string
          updated_at: string
          whatsapp: string
        }
        SetofOptions: {
          from: "*"
          to: "event_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      validate_coupon: {
        Args: { _code: string }
        Returns: {
          category: string
          discount_percent: number
          reason: string
          requires_id_card: boolean
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "staff" | "super_admin"
      hand_status: "raised" | "on_stage" | "dismissed"
      portal_entity: "speaker" | "sponsor"
      portal_status: "invited" | "in_progress" | "completed" | "approved"
      registration_status: "pending" | "confirmed" | "cancelled"
      requirement_type:
        | "short_text"
        | "long_text"
        | "file"
        | "url"
        | "country"
        | "acceptance"
      session_type: "magistral" | "paralela" | "social"
      speaker_role: "keynote" | "speaker" | "panelist"
      sponsor_tier: "oro" | "plata" | "bronce"
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
      app_role: ["admin", "editor", "staff", "super_admin"],
      hand_status: ["raised", "on_stage", "dismissed"],
      portal_entity: ["speaker", "sponsor"],
      portal_status: ["invited", "in_progress", "completed", "approved"],
      registration_status: ["pending", "confirmed", "cancelled"],
      requirement_type: [
        "short_text",
        "long_text",
        "file",
        "url",
        "country",
        "acceptance",
      ],
      session_type: ["magistral", "paralela", "social"],
      speaker_role: ["keynote", "speaker", "panelist"],
      sponsor_tier: ["oro", "plata", "bronce"],
    },
  },
} as const
