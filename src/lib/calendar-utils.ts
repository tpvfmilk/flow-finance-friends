
import { addDays, addWeeks, addMonths, format, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Deposit, Expense, Goal } from './types';

export interface CalendarEvent {
  id: string;
  date: Date;
  type: 'deposit' | 'expense' | 'goal' | 'recurring-deposit';
  title: string;
  amount?: number;
  description?: string;
  color: string;
  priority?: 'low' | 'medium' | 'high';
}

// Calculate next recurring deposit dates
export function calculateRecurringDeposits(deposits: Deposit[], endDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = startOfDay(new Date());

  deposits.forEach(deposit => {
    if (deposit.type === 'recurring' && deposit.frequency) {
      const startDate = startOfDay(new Date(deposit.date));
      let currentDate = isAfter(startDate, today) ? startDate : today;
      
      // Generate up to 6 months of future recurring events
      while (isBefore(currentDate, endDate)) {
        events.push({
          id: `${deposit.id}-${format(currentDate, 'yyyy-MM-dd')}`,
          date: currentDate,
          type: 'recurring-deposit',
          title: `${deposit.contributor_name} Deposit`,
          amount: deposit.amount,
          description: deposit.description || 'Recurring deposit',
          color: '#10B981' // green
        });

        // Calculate next occurrence
        if (deposit.frequency === 'weekly') {
          currentDate = addWeeks(currentDate, 1);
        } else if (deposit.frequency === 'biweekly') {
          currentDate = addWeeks(currentDate, 2);
        } else if (deposit.frequency === 'monthly') {
          currentDate = addMonths(currentDate, 1);
        } else {
          break; // Unknown frequency
        }
      }
    }
  });

  return events;
}

// Convert expenses to calendar events
export function expensesToCalendarEvents(expenses: Expense[]): CalendarEvent[] {
  return expenses.map(expense => ({
    id: expense.id,
    date: startOfDay(new Date(expense.date)),
    type: 'expense',
    title: expense.description,
    amount: expense.amount,
    description: expense.merchant || expense.description,
    color: '#EF4444' // red
  }));
}

// Convert one-time deposits to calendar events
export function depositsToCalendarEvents(deposits: Deposit[]): CalendarEvent[] {
  return deposits
    .filter(deposit => deposit.type === 'one-off')
    .map(deposit => ({
      id: deposit.id,
      date: startOfDay(new Date(deposit.date)),
      type: 'deposit',
      title: `${deposit.contributor_name} Deposit`,
      amount: deposit.amount,
      description: deposit.description || 'One-time deposit',
      color: '#3B82F6' // blue
    }));
}

// Convert goals to calendar events
export function goalsToCalendarEvents(goals: Goal[]): CalendarEvent[] {
  return goals
    .filter(goal => goal.target_date)
    .map(goal => ({
      id: goal.id,
      date: startOfDay(new Date(goal.target_date!)),
      type: 'goal',
      title: goal.name,
      amount: goal.target_amount,
      description: `Goal deadline - ${goal.priority} priority`,
      color: goal.priority === 'high' ? '#DC2626' : goal.priority === 'medium' ? '#F59E0B' : '#6B7280',
      priority: goal.priority
    }));
}

// Group events by date
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const dateKey = format(event.date, 'yyyy-MM-dd');
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });

  return grouped;
}
