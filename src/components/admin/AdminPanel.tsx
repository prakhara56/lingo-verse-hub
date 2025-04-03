import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck, Key, Database } from 'lucide-react';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUserCount();
    }
  }, [isAdmin]);

  const fetchUserCount = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setUserCount(count || 0);
    } catch (error) {
      console.error('Error fetching user count:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!newAdminEmail) return;

    setLoading(true);
    try {
      // First get the user id from their username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newAdminEmail)
        .single();

      if (userError) {
        // Try to check if this is an email and search for a profile with matching username
        if (newAdminEmail.includes('@')) {
          const { data: emailData, error: emailError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', newAdminEmail)
            .single();
            
          if (emailError) {
            throw new Error('User not found. Please check the email or username.');
          }
          
          // Update the user's admin status
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', emailData.id);
            
          if (updateError) throw updateError;
        } else {
          throw new Error('User not found. Please check the username.');
        }
      } else {
        // Update the user's admin status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userData.id);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: 'Admin added',
        description: `${newAdminEmail} has been made an admin.`,
      });
      
      setNewAdminEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          Manage users and system settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4 pt-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <span className="font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : userCount}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-admin">Add Admin</Label>
              <div className="flex gap-2">
                <Input
                  id="new-admin"
                  placeholder="Email or username"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={makeAdmin} disabled={loading || !newAdminEmail}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Make Admin
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4 pt-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Database Status</span>
              </div>
              <span className="font-semibold text-green-500">Connected</span>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => fetchUserCount()}>
              Refresh System Status
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
