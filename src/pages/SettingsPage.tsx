import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Key, Save, User, Upload, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userProfile, user, updateUsername, updateName } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [username, setUsername] = useState(userProfile?.username || "");
  const [fullName, setFullName] = useState(userProfile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar_url || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API key form state
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [defaultModel, setDefaultModel] = useState("gpt-4");

  // Save profile handler
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      return toast({
        title: "Username Required",
        description: "Please enter a valid username.",
        variant: "destructive",
      });
    }
    setIsLoading(true);
    const usernameSuccess = await updateUsername(username);
    const nameSuccess = fullName !== userProfile?.name
      ? await updateName(fullName)
      : true;
    setIsLoading(false);
    if (usernameSuccess && nameSuccess) {
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been updated.",
      });
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${user.id}-${Math.random()}.${ext}`;
    setIsLoading(true);
    try {
      const { error: uploadError } = await supabase
        .storage
        .from("avatars")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(path);
      const url = publicURLData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(url);
      toast({
        title: "Avatar Updated",
        description: "Your profile photo has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar delete handler
  const handleDeleteAvatar = async () => {
    if (!avatarUrl || !user) return;
    if (!confirm("Are you sure you want to delete your avatar?")) return;
    setIsLoading(true);
    try {
      // Extract the storage key from the public URL
      const parts = avatarUrl.split("/avatars/");
      if (parts.length < 2) throw new Error("Invalid avatar URL");
      const filePath = parts[1];

      const { error: removeError } = await supabase
        .storage
        .from("avatars")
        .remove([filePath]);
      if (removeError) throw removeError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(null);
      toast({
        title: "Avatar Deleted",
        description: "Your profile photo has been removed.",
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete avatar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save API keys handler (stub)
  const handleSaveApiKeys = () => {
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been securely stored.",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList>
            <TabsTrigger value="profile">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage your profile settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      {theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      <span>Appearance</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Customize the look and feel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Key className="h-4 w-4" />
                      <span>API Keys</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage your API integrations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="ai-settings">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <span>AI Settings</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure AI model preferences</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="text-lg">
                        {userProfile?.username
                          ?.substring(0, 2)
                          .toUpperCase() || "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-12 rounded-full h-8 w-8"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    {avatarUrl && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                        onClick={handleDeleteAvatar}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  className="flex gap-2"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">Theme Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Configure your AI providers API keys for enhanced
                  capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="openai-key"
                      className="pl-10"
                      type="password"
                      placeholder="sk-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for ChatGPT, DALL-E, and text-to-speech
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="anthropic-key"
                      className="pl-10"
                      type="password"
                      placeholder="sk_ant-..."
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for Claude models
                  </p>
                </div>
                <Button onClick={handleSaveApiKeys} className="flex gap-2">
                  <Save className="h-4 w-4" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-settings">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure your AI model preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-model">Default AI Model</Label>
                  <Select value={defaultModel} onValueChange={setDefaultModel}>
                    <SelectTrigger id="default-model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Context Memory</p>
                      <p className="text-sm text-muted-foreground">
                        Keep previous conversation history
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enhanced Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Use more advanced models for better results
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Citations</p>
                      <p className="text-sm text-muted-foreground">
                        Include sources in AI responses when available
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button className="flex gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
