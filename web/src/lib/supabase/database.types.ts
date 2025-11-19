export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type RoleType = "ADMIN" | "ODONTOLOGO" | "ASISTENTE";
export type AppointmentStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "ATENDIDA"
  | "NO_ASISTIO"
  | "CANCELADA";
export type AppointmentOrigin = "ODONTOLOGO" | "PACIENTE" | "ASISTENTE";
export type PaymentStatus = "PENDIENTE" | "PARCIAL" | "PAGADO";
export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTROS";

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          cancelada_at: string | null;
          cancelada_por: string | null;
          created_at: string;
          created_by: string | null;
          duration_minutes: number | null;
          end_at: string;
          estado_pago: PaymentStatus;
          honorario_estimado: number | null;
          honorario_final: number | null;
          id: string;
          metodo_pago_preferido: PaymentMethod | null;
          motivo_cancelacion: string | null;
          motivo_detalle: string | null;
          motivo_id: string | null;
          odontologo_id: string;
          origin: AppointmentOrigin;
          paciente_id: string;
          reprogramada_desde_id: string | null;
          sillon_id: string;
          start_at: string;
          status: AppointmentStatus;
          ultima_reprogramacion_at: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          cancelada_at?: string | null;
          cancelada_por?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_at: string;
          estado_pago?: PaymentStatus;
          honorario_estimado?: number | null;
          honorario_final?: number | null;
          id?: string;
          metodo_pago_preferido?: PaymentMethod | null;
          motivo_cancelacion?: string | null;
          motivo_detalle?: string | null;
          motivo_id?: string | null;
          odontologo_id: string;
          origin?: AppointmentOrigin;
          paciente_id: string;
          reprogramada_desde_id?: string | null;
          sillon_id: string;
          start_at: string;
          status?: AppointmentStatus;
          ultima_reprogramacion_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          cancelada_at?: string | null;
          cancelada_por?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_at?: string;
          estado_pago?: PaymentStatus;
          honorario_estimado?: number | null;
          honorario_final?: number | null;
          id?: string;
          metodo_pago_preferido?: PaymentMethod | null;
          motivo_cancelacion?: string | null;
          motivo_detalle?: string | null;
          motivo_id?: string | null;
          odontologo_id?: string;
          origin?: AppointmentOrigin;
          paciente_id?: string;
          reprogramada_desde_id?: string | null;
          sillon_id?: string;
          start_at?: string;
          status?: AppointmentStatus;
          ultima_reprogramacion_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      cita_eventos: {
        Row: {
          appointment_id: string;
          created_at: string;
          description: string | null;
          event_type: string;
          id: string;
          new_data: Json | null;
          previous_data: Json | null;
          triggered_by: string | null;
        };
        Insert: {
          appointment_id: string;
          created_at?: string;
          description?: string | null;
          event_type: string;
          id?: string;
          new_data?: Json | null;
          previous_data?: Json | null;
          triggered_by?: string | null;
        };
        Update: {
          appointment_id?: string;
          created_at?: string;
          description?: string | null;
          event_type?: string;
          id?: string;
          new_data?: Json | null;
          previous_data?: Json | null;
          triggered_by?: string | null;
        };
      };
      cita_notas: {
        Row: {
          appointment_id: string;
          created_at: string;
          created_by: string | null;
          extra_notes: string | null;
          id: string;
          motivo_id: string | null;
        };
        Insert: {
          appointment_id: string;
          created_at?: string;
          created_by?: string | null;
          extra_notes?: string | null;
          id?: string;
          motivo_id?: string | null;
        };
        Update: {
          appointment_id?: string;
          created_at?: string;
          created_by?: string | null;
          extra_notes?: string | null;
          id?: string;
          motivo_id?: string | null;
        };
      };
      metodos_pago_catalogo: {
        Row: {
          active: boolean;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          active?: boolean;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          active?: boolean;
          description?: string | null;
          id?: string;
          name?: string;
        };
      };
      motivos_cita: {
        Row: {
          active: boolean;
          description: string | null;
          id: string;
          name: string;
          position: number;
        };
        Insert: {
          active?: boolean;
          description?: string | null;
          id?: string;
          name: string;
          position?: number;
        };
        Update: {
          active?: boolean;
          description?: string | null;
          id?: string;
          name?: string;
          position?: number;
        };
      };
      odontologo_sillon: {
        Row: {
          active: boolean;
          id: string;
          odontologo_id: string;
          priority: number;
          sillon_id: string;
          valid_from: string | null;
          valid_to: string | null;
        };
        Insert: {
          active?: boolean;
          id?: string;
          odontologo_id: string;
          priority?: number;
          sillon_id: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Update: {
          active?: boolean;
          id?: string;
          odontologo_id?: string;
          priority?: number;
          sillon_id?: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
      };
      pagos: {
        Row: {
          amount: number;
          appointment_id: string;
          currency: string;
          id: string;
          method: PaymentMethod;
          notes: string | null;
          paid_at: string;
          recorded_by: string | null;
        };
        Insert: {
          amount: number;
          appointment_id: string;
          currency?: string;
          id?: string;
          method: PaymentMethod;
          notes?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
        };
        Update: {
          amount?: number;
          appointment_id?: string;
          currency?: string;
          id?: string;
          method?: PaymentMethod;
          notes?: string | null;
          paid_at?: string;
          recorded_by?: string | null;
        };
      };
      patients: {
        Row: {
          address: string | null;
          allergies: string | null;
          ci: string | null;
          created_at: string;
          created_by: string | null;
          date_of_birth: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          first_name: string;
          id: string;
          last_name: string;
          notes: string | null;
          phone: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          allergies?: string | null;
          ci?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          notes?: string | null;
          phone: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          allergies?: string | null;
          ci?: string | null;
          created_at?: string;
          created_by?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          notes?: string | null;
          phone?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          active: boolean;
          created_at: string;
          full_name: string | null;
          id: string;
          preferences: Json;
          role: RoleType;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          full_name?: string | null;
          id: string;
          preferences?: Json;
          role?: RoleType;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          preferences?: Json;
          role?: RoleType;
          updated_at?: string;
        };
      };
      sillones: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          location: string | null;
          name: string;
          notes: string | null;
          priority: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          location?: string | null;
          name: string;
          notes?: string | null;
          priority?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          location?: string | null;
          name?: string;
          notes?: string | null;
          priority?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      appointment_origin: AppointmentOrigin;
      appointment_status: AppointmentStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      role_type: RoleType;
    };
  };
};

