
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addMonths, format, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateRecurringDeposits, 
  expensesToCalendarEvents, 
  depositsToCalendarEvents, 
  goalsToCalendarEvents, 
  groupEventsByDate,
  type CalendarEvent 
} from '@/lib/calendar-utils';
import type { Deposit, Expense, Goal } from '@/lib/types';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventsByDate, setEventsByDate] = useState<Map<string, CalendarEvent[]>>(new Map());

  // Fetch deposits
  const { data: deposits = [] } = useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Deposit[];
    }
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    }
  });

  // Fetch goals
  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as Goal[];
    }
  });

  useEffect(() => {
    // Calculate 6 months ahead for recurring events
    const endDate = addMonths(new Date(), 6);
    
    // Generate all calendar events
    const allEvents: CalendarEvent[] = [
      ...calculateRecurringDeposits(deposits, endDate),
      ...expensesToCalendarEvents(expenses),
      ...depositsToCalendarEvents(deposits),
      ...goalsToCalendarEvents(goals)
    ];

    setEventsByDate(groupEventsByDate(allEvents));
  }, [deposits, expenses, goals]);

  const getDayEvents = (date: Date): CalendarEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const hasEvents = (date: Date): boolean => {
    return getDayEvents(date).length > 0;
  };

  const getEventDots = (date: Date) => {
    const events = getDayEvents(date);
    if (events.length === 0) return null;

    return (
      <div className="flex gap-1 justify-center mt-1">
        {events.slice(0, 3).map((event, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: event.color }}
          />
        ))}
        {events.length > 3 && (
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        )}
      </div>
    );
  };

  const selectedDateEvents = selectedDate ? getDayEvents(selectedDate) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendar</h1>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Recurring Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">One-time Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Goal Deadlines</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                components={{
                  Day: ({ date, ...props }) => {
                    const events = getDayEvents(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div
                            className={`
                              relative p-2 text-center cursor-pointer rounded-md
                              ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                              ${hasEvents(date) ? 'font-semibold' : ''}
                            `}
                            {...props}
                          >
                            <span>{format(date, 'd')}</span>
                            {getEventDots(date)}
                          </div>
                        </PopoverTrigger>
                        {events.length > 0 && (
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Events for {format(date, 'MMMM d, yyyy')}
                              </h4>
                              {events.map((event, index) => (
                                <div key={index} className="p-2 border rounded-md">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: event.color }}
                                    />
                                    <span className="font-medium">{event.title}</span>
                                  </div>
                                  {event.amount && (
                                    <p className="text-sm text-gray-600">
                                      ${event.amount.toLocaleString()}
                                    </p>
                                  )}
                                  {event.description && (
                                    <p className="text-sm text-gray-500">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        )}
                      </Popover>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                      {event.amount && (
                        <p className="text-sm font-semibold text-green-600">
                          ${event.amount.toLocaleString()}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.priority && (
                        <Badge 
                          variant={event.priority === 'high' ? 'destructive' : 'secondary'}
                          className="mt-2"
                        >
                          {event.priority} priority
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No events for this date
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
