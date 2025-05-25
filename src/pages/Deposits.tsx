import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Deposit {
  id: string;
  amount: number;
  contributor_name: string;
  date: string;
  description?: string;
  type: string;
  frequency?: string;
}

interface PartnerSettings {
  id: string;
  partner1_name: string;
  partner2_name: string;
}

const Deposits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    contributor_name: "",
    description: "",
    type: "one-time",
    frequency: "weekly",
    date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  // Fetch partner settings for dropdown options
  const { data: partnerSettings } = useQuery({
    queryKey: ['partner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching partner settings:', error);
        return null;
      }
      return data;
    }
  });

  // Fetch deposits
  const { data: deposits, isLoading } = useQuery({
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

  // Create deposit mutation
  const createDepositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const { data, error } = await supabase
        .from('deposits')
        .insert([depositData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success("Deposit added successfully!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add deposit");
      console.error(error);
    }
  });

  // Update deposit mutation
  const updateDepositMutation = useMutation({
    mutationFn: async ({ id, ...depositData }: any) => {
      const { data, error } = await supabase
        .from('deposits')
        .update(depositData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success("Deposit updated successfully!");
      setIsDialogOpen(false);
      setEditingDeposit(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update deposit");
      console.error(error);
    }
  });

  // Delete deposit mutation
  const deleteDepositMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success("Deposit deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete deposit");
      console.error(error);
    }
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      contributor_name: "",
      description: "",
      type: "one-time",
      frequency: "weekly",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositData = {
      amount: parseFloat(formData.amount),
      contributor_name: formData.contributor_name,
      description: formData.description || null,
      type: formData.type,
      frequency: formData.type === "recurring" ? formData.frequency : null,
      date: formData.date
    };

    if (editingDeposit) {
      updateDepositMutation.mutate({ id: editingDeposit.id, ...depositData });
    } else {
      createDepositMutation.mutate(depositData);
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setFormData({
      amount: deposit.amount.toString(),
      contributor_name: deposit.contributor_name,
      description: deposit.description || "",
      type: deposit.type,
      frequency: deposit.frequency || "weekly",
      date: deposit.date.split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this deposit?")) {
      deleteDepositMutation.mutate(id);
    }
  };

  const totalDeposits = deposits?.reduce((sum, deposit) => sum + deposit.amount, 0) || 0;
  const contributors = [...new Set(deposits?.map(d => d.contributor_name) || [])];

  // Get contributor options from partner settings
  const getContributorOptions = () => {
    const options = [];
    if (partnerSettings?.partner1_name) {
      options.push(partnerSettings.partner1_name);
    }
    if (partnerSettings?.partner2_name) {
      options.push(partnerSettings.partner2_name);
    }
    // Fallback to default names if no partner settings
    if (options.length === 0) {
      options.push("Partner A", "Partner B");
    }
    return options;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deposits</h1>
          <p className="text-muted-foreground">Track financial contributions and deposits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDeposit(null); resetForm(); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDeposit ? "Edit" : "Add"} Deposit</DialogTitle>
              <DialogDescription>
                {editingDeposit ? "Update the deposit details" : "Record a new deposit or contribution"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contributor_name">Contributor Name</Label>
                <Select value={formData.contributor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, contributor_name: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getContributorOptions().map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "recurring" && (
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createDepositMutation.isPending || updateDepositMutation.isPending}>
                  {editingDeposit ? "Update" : "Add"} Deposit
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Deposits</CardTitle>
            <CardDescription>All time total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contributors</CardTitle>
            <CardDescription>Unique contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contributors.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {contributors.slice(0, 3).join(", ")}
              {contributors.length > 3 && ` +${contributors.length - 3} more`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
          <CardDescription>Your latest contributions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading deposits...</div>
          ) : deposits?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No deposits yet. Add your first deposit to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {deposits?.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{deposit.contributor_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(deposit.date).toLocaleDateString()} • {deposit.type}
                        {deposit.frequency && ` (${deposit.frequency})`}
                        {deposit.description && ` • ${deposit.description}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-green-600">+${deposit.amount.toFixed(2)}</div>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(deposit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(deposit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposits;
