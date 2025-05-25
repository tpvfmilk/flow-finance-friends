
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-25

### Added
- Complete financial management system with database integration
- **Expenses Page** (`src/pages/Expenses.tsx`)
  - Add, edit, and delete expenses with category assignment
  - Expense summary and listing with real-time updates
  - Form validation and error handling
  - Integration with Supabase database
- **Categories Page** (`src/pages/Categories.tsx`)
  - Create and manage expense categories
  - Budget allocation and color customization
  - Category performance tracking
  - Validation for budget totals and allocation percentages
- **Deposits Page** (`src/pages/Deposits.tsx`)
  - Track financial contributions from multiple sources
  - Support for different deposit types (one-time, recurring, bonus, salary)
  - Contributor management and deposit history
- **Goals Page** (`src/pages/Goals.tsx`)
  - Financial goal creation and tracking
  - Progress visualization with progress bars
  - Priority management and category linking
  - Target date and completion tracking
- **Settings Page** (`src/pages/Settings.tsx`)
  - Partner name customization
  - Display preferences (currency, date format)
  - Notification and theme settings
  - Data management tools (export/import/clear)
- **Database Schema** (Supabase)
  - `categories` table with budget allocation and color management
  - `expenses` table with category relationships and receipt support
  - `deposits` table with contributor tracking and type classification
  - `goals` table with progress tracking and priority management
  - Row Level Security (RLS) policies for all tables
  - Foreign key relationships between tables
- **Navigation System**
  - Updated `src/nav-items.tsx` with all new pages
  - Updated `src/App.tsx` with complete routing structure
  - Integrated navigation with existing AppLayout

### Updated
- Enhanced routing system to support all financial management pages
- Improved navigation structure with dedicated icons for each section
- Updated application layout to accommodate new functionality

### Technical Details
- Used React Query for efficient data fetching and caching
- Implemented optimistic updates with proper error handling
- Added form validation and user feedback with toast notifications
- Responsive design that works on desktop and mobile devices
- Type-safe database operations with TypeScript

### Database Structure
- Categories: Name, color, allocation percentage, budget amount
- Expenses: Amount, description, merchant, date, category reference
- Deposits: Amount, contributor, date, type, description
- Goals: Name, target/current amounts, target date, priority, category reference

This update transforms the application from a visualization tool into a complete financial management system while maintaining the Sankey chart as the central dashboard feature.

## [1.0.0] - 2025-01-24

### Added
- Initial project setup with Vite, React, TypeScript, and Tailwind CSS
- Supabase integration for backend functionality
- Dashboard with Sankey chart visualization using D3.js
- Financial flow visualization showing income, expenses, and savings
- Responsive design with modern UI components
- Google Maps integration for location-based features
- Basic project structure with components, pages, and utilities
