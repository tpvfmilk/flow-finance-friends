
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCategoryPercentages() {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const updateCategoryPercentage = async (categoryId: string, newPercentage: number) => {
    setIsUpdating(categoryId);
    
    try {
      // Update the category percentage
      const { error } = await supabase
        .from('categories')
        .update({ 
          allocation_percentage: newPercentage,
          percentage_updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Percentage Updated",
        description: `Category allocation updated to ${newPercentage}%`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating category percentage:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update category percentage",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(null);
    }
  };

  const validateTotalPercentage = async (categoryId: string, newPercentage: number) => {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, allocation_percentage')
        .neq('id', categoryId);

      if (error) throw error;

      const currentTotal = categories.reduce((sum, cat) => sum + Number(cat.allocation_percentage), 0);
      const newTotal = currentTotal + newPercentage;

      return newTotal <= 100;
    } catch (error) {
      console.error('Error validating percentage:', error);
      return false;
    }
  };

  return {
    updateCategoryPercentage,
    validateTotalPercentage,
    isUpdating
  };
}
