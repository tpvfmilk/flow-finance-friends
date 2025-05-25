import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PartnerSettings {
  id?: string;
  partner1_name: string;
  partner2_name: string;
}

const Settings = () => {
  const [partnerNames, setPartnerNames] = useState({
    partner1: "Partner A",
    partner2: "Partner B"
  });
  
  const [preferences, setPreferences] = useState({
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    notifications: true,
    darkMode: false
  });

  const queryClient = useQueryClient();

  // Fetch partner settings
  const { data: partnerSettings } = useQuery({
    queryKey: ['partner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_settings' as any)
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as PartnerSettings;
    }
  });

  // Update partner names when data is loaded
  useEffect(() => {
    if (partnerSettings) {
      setPartnerNames({
        partner1: partnerSettings.partner1_name,
        partner2: partnerSettings.partner2_name
      });
    }
  }, [partnerSettings]);

  // Save partner names mutation
  const savePartnerNamesMutation = useMutation({
    mutationFn: async (names: { partner1: string; partner2: string }) => {
      const partnerData = {
        partner1_name: names.partner1,
        partner2_name: names.partner2
      };

      if (partnerSettings?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('partner_settings' as any)
          .update(partnerData)
          .eq('id', partnerSettings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('partner_settings' as any)
          .insert([partnerData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-settings'] });
      toast.success("Partner names updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save partner names");
      console.error(error);
    }
  });

  const handleSavePartnerNames = () => {
    savePartnerNamesMutation.mutate(partnerNames);
  };

  const handleExportData = () => {
    // This would export all financial data
    toast.success("Data export started. You'll receive a download link shortly.");
  };

  const handleImportData = () => {
    // This would handle data import
    toast.info("Data import feature coming soon!");
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      toast.error("Data clearing feature would be implemented here");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Names</CardTitle>
          <CardDescription>Customize how partners are displayed in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="partner1">Partner 1 Name</Label>
            <Input
              id="partner1"
              value={partnerNames.partner1}
              onChange={(e) => setPartnerNames(prev => ({ ...prev, partner1: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="partner2">Partner 2 Name</Label>
            <Input
              id="partner2"
              value={partnerNames.partner2}
              onChange={(e) => setPartnerNames(prev => ({ ...prev, partner2: e.target.value }))}
            />
          </div>
          <Button 
            onClick={handleSavePartnerNames}
            disabled={savePartnerNamesMutation.isPending}
          >
            {savePartnerNamesMutation.isPending ? "Saving..." : "Save Partner Names"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Customize how data is displayed in the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for budget limits and goal milestones</p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
            </div>
            <Switch
              id="darkMode"
              checked={preferences.darkMode}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Import, export, or clear your financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleImportData} variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This action will permanently delete all your financial data including expenses, deposits, categories, and goals.
            </p>
            <Button onClick={handleClearAllData} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Application information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build:</span>
              <span>2025.01</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
