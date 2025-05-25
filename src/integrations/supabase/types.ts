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
      apps: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          route: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          allocation_percentage: number
          budget_amount: number
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number
          budget_amount?: number
          color?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number
          budget_amount?: number
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultants: {
        Row: {
          created_at: string | null
          firm_name: string
          id: string
          project_id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          firm_name: string
          id?: string
          project_id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          firm_name?: string
          id?: string
          project_id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          consultant_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          consultant_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          consultant_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_profile_loans: {
        Row: {
          balance: number
          created_at: string
          custom_payment: number
          debt_profile_id: string
          id: string
          interest_rate: number
          loan_type: string
          minimum_payment: number
          name: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          custom_payment?: number
          debt_profile_id: string
          id?: string
          interest_rate?: number
          loan_type?: string
          minimum_payment?: number
          name: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          custom_payment?: number
          debt_profile_id?: string
          id?: string
          interest_rate?: number
          loan_type?: string
          minimum_payment?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_profile_loans_debt_profile_id_fkey"
            columns: ["debt_profile_id"]
            isOneToOne: false
            referencedRelation: "debt_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          optimization_strategy: string
          total_monthly_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          optimization_strategy?: string
          total_monthly_budget?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          optimization_strategy?: string
          total_monthly_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          contributor_name: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          contributor_name: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contributor_name?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          merchant: string | null
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          merchant?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          merchant?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_accounts: {
        Row: {
          account_number_last4: string | null
          balance: number
          created_at: string
          id: string
          institution: string | null
          is_joint: boolean | null
          name: string
          owner_id: string | null
          partnership_id: string
          type: string
          updated_at: string
        }
        Insert: {
          account_number_last4?: string | null
          balance?: number
          created_at?: string
          id?: string
          institution?: string | null
          is_joint?: boolean | null
          name: string
          owner_id?: string | null
          partnership_id: string
          type: string
          updated_at?: string
        }
        Update: {
          account_number_last4?: string | null
          balance?: number
          created_at?: string
          id?: string
          institution?: string | null
          is_joint?: boolean | null
          name?: string
          owner_id?: string | null
          partnership_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_accounts_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_budgets: {
        Row: {
          budgeted_amount: number
          category_id: string
          created_at: string
          id: string
          month_year: string
          partnership_id: string
          updated_at: string
        }
        Insert: {
          budgeted_amount: number
          category_id: string
          created_at?: string
          id?: string
          month_year: string
          partnership_id: string
          updated_at?: string
        }
        Update: {
          budgeted_amount?: number
          category_id?: string
          created_at?: string
          id?: string
          month_year?: string
          partnership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_budgets_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          allocation_percentage: number | null
          color_code: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          partnership_id: string
          type: string
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          color_code?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          partnership_id: string
          type: string
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          color_code?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          partnership_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_category_allocations: {
        Row: {
          amount: number
          category_id: string
          contribution_id: string
          created_at: string
          id: string
          percentage: number
        }
        Insert: {
          amount: number
          category_id: string
          contribution_id: string
          created_at?: string
          id?: string
          percentage: number
        }
        Update: {
          amount?: number
          category_id?: string
          contribution_id?: string
          created_at?: string
          id?: string
          percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_category_allocations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_category_allocations_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "finance_contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_contribution_settings: {
        Row: {
          account_id: string
          amount: number
          biweekly_schedule: string | null
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean
          notes: string | null
          partnership_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          biweekly_schedule?: string | null
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean
          notes?: string | null
          partnership_id: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          biweekly_schedule?: string | null
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          partnership_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_contribution_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_contribution_settings_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_contribution_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_contributions: {
        Row: {
          account_id: string
          amount: number
          contribution_date: string
          created_at: string
          id: string
          notes: string | null
          partnership_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          contribution_date: string
          created_at?: string
          id?: string
          notes?: string | null
          partnership_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          contribution_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          partnership_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_contributions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_contributions_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_deposits: {
        Row: {
          account_id: string
          amount: number
          contributor_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          partnership_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          contributor_id: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          partnership_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          contributor_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          partnership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_deposits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_deposits_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_deposits_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_goal_categories: {
        Row: {
          color_code: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          partnership_id: string
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          partnership_id: string
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          partnership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_goal_categories_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_goal_category_assignments: {
        Row: {
          category_id: string
          created_at: string
          goal_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          goal_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_goal_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_goal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_goal_category_assignments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "finance_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "finance_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_goal_milestones: {
        Row: {
          created_at: string
          description: string | null
          goal_id: string
          id: string
          is_percentage: boolean
          is_reached: boolean
          percentage_value: number | null
          reached_date: string | null
          reward: string | null
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          is_percentage?: boolean
          is_reached?: boolean
          percentage_value?: number | null
          reached_date?: string | null
          reward?: string | null
          target_amount: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          is_percentage?: boolean
          is_reached?: boolean
          percentage_value?: number | null
          reached_date?: string | null
          reward?: string | null
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "finance_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_goals: {
        Row: {
          completion_date: string | null
          created_at: string
          creator_id: string | null
          current_amount: number
          description: string | null
          display_order: number | null
          goal_type: string
          id: string
          image_url: string | null
          is_completed: boolean | null
          monthly_contribution: number | null
          name: string
          partnership_id: string
          target_amount: number
          target_date: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          creator_id?: string | null
          current_amount?: number
          description?: string | null
          display_order?: number | null
          goal_type?: string
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          monthly_contribution?: number | null
          name: string
          partnership_id: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          creator_id?: string | null
          current_amount?: number
          description?: string | null
          display_order?: number | null
          goal_type?: string
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          monthly_contribution?: number | null
          name?: string
          partnership_id?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_goals_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_partnerships: {
        Row: {
          created_at: string
          id: string
          name: string
          partner_a_id: string
          partner_b_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          partner_a_id: string
          partner_b_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          partner_a_id?: string
          partner_b_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_partnerships_partner_a_id_fkey"
            columns: ["partner_a_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_partnerships_partner_b_id_fkey"
            columns: ["partner_b_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_recurring_expense_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_by: string | null
          paid_date: string | null
          recurring_expense_id: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_by?: string | null
          paid_date?: string | null
          recurring_expense_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_by?: string | null
          paid_date?: string | null
          recurring_expense_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_recurring_expense_payments_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_recurring_expense_payments_recurring_expense_id_fkey"
            columns: ["recurring_expense_id"]
            isOneToOne: false
            referencedRelation: "finance_recurring_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_recurring_expense_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_recurring_expenses: {
        Row: {
          amount: number
          amount_type: string
          category_id: string | null
          created_at: string
          due_day: number | null
          due_days: Json | null
          end_date: string | null
          frequency: string
          frequency_interval: number | null
          id: string
          is_autopay: boolean | null
          merchant: string
          notes: string | null
          notification_days: number | null
          partnership_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_type?: string
          category_id?: string | null
          created_at?: string
          due_day?: number | null
          due_days?: Json | null
          end_date?: string | null
          frequency: string
          frequency_interval?: number | null
          id?: string
          is_autopay?: boolean | null
          merchant: string
          notes?: string | null
          notification_days?: number | null
          partnership_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_type?: string
          category_id?: string | null
          created_at?: string
          due_day?: number | null
          due_days?: Json | null
          end_date?: string | null
          frequency?: string
          frequency_interval?: number | null
          id?: string
          is_autopay?: boolean | null
          merchant?: string
          notes?: string | null
          notification_days?: number | null
          partnership_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_recurring_expenses_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_recurring_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          end_date: string | null
          frequency: string
          id: string
          merchant: string
          partnership_id: string
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          frequency: string
          id?: string
          merchant: string
          partnership_id: string
          start_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          merchant?: string
          partnership_id?: string
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_recurring_transactions_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          partnership_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          partnership_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          partnership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_tags_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transaction_splits: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          notes: string | null
          percentage: number
          transaction_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          percentage: number
          transaction_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          percentage?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transaction_splits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transaction_splits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transaction_tags: {
        Row: {
          tag_id: string
          transaction_id: string
        }
        Insert: {
          tag_id: string
          transaction_id: string
        }
        Update: {
          tag_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transaction_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "finance_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          created_by_id: string | null
          date: string
          id: string
          is_split: boolean | null
          merchant: string
          needs_review: boolean | null
          notes: string | null
          partnership_id: string
          receipt_url: string | null
          recurring_expense_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          created_by_id?: string | null
          date?: string
          id?: string
          is_split?: boolean | null
          merchant: string
          needs_review?: boolean | null
          notes?: string | null
          partnership_id: string
          receipt_url?: string | null
          recurring_expense_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          created_by_id?: string | null
          date?: string
          id?: string
          is_split?: boolean | null
          merchant?: string
          needs_review?: boolean | null
          notes?: string | null
          partnership_id?: string
          receipt_url?: string | null
          recurring_expense_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "finance_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "finance_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_recurring_expense_id_fkey"
            columns: ["recurring_expense_id"]
            isOneToOne: false
            referencedRelation: "finance_recurring_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category_id: string | null
          created_at: string
          current_amount: number
          id: string
          name: string
          priority: string
          target_amount: number
          target_date: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          priority?: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          priority?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          order_index: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          organization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          organization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          location: string | null
          name: string
          owner_id: string
          project_number: string | null
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          name: string
          owner_id: string
          project_number?: string | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          name?: string
          owner_id?: string
          project_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          app_id: string
          created_at: string
          features: Json | null
          id: string
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          app_id: string
          created_at?: string
          features?: Json | null
          id?: string
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          features?: Json | null
          id?: string
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tiers_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          app_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      task_boards: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order: number | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order?: number | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order?: number | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_boards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived: boolean
          archived_at: string | null
          assigned_to: string | null
          color: string | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          order: number | null
          project_id: string
          start_date: string
          status: string | null
          task_board_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean
          archived_at?: string | null
          assigned_to?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          order?: number | null
          project_id: string
          start_date: string
          status?: string | null
          task_board_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean
          archived_at?: string | null
          assigned_to?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          order?: number | null
          project_id?: string
          start_date?: string
          status?: string | null
          task_board_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_task_board_id_fkey"
            columns: ["task_board_id"]
            isOneToOne: false
            referencedRelation: "task_boards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_update_task_board_orders: {
        Args: { board_ids: string[]; board_orders: number[] }
        Returns: undefined
      }
      batch_update_task_orders: {
        Args: { task_ids: string[]; task_orders: number[] }
        Returns: undefined
      }
      calculate_next_deposit_date: {
        Args: {
          p_frequency: string
          p_day_of_week: number
          p_day_of_month: number
          p_biweekly_schedule: string
          p_start_date: string
        }
        Returns: string
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_owns_consultant_project: {
        Args: { consultant_id: string }
        Returns: boolean
      }
      user_owns_note_project: {
        Args: { note_id: string }
        Returns: boolean
      }
      user_owns_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      user_owns_task_project: {
        Args: { task_id: string }
        Returns: boolean
      }
      user_owns_taskboard_project: {
        Args: { board_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
