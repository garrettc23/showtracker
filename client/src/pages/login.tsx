import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/auth/check-user", { username });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.exists) {
        // User exists, log them in
        loginMutation.mutate(username);
      } else {
        // User doesn't exist, show confirmation modal
        setPendingUsername(username);
        setShowConfirmModal(true);
      }
    },
    onError: (error) => {
      toast({
        title: "Error checking user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/auth/login", { username });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/auth/create-user", { username });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to ShowTracker!",
        description: "Your account has been created successfully.",
      });
      setShowConfirmModal(false);
    },
    onError: (error) => {
      toast({
        title: "Account creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      checkUserMutation.mutate(username.trim());
    }
  };

  const handleCreateAccount = () => {
    createUserMutation.mutate(pendingUsername);
  };

  const handleReject = () => {
    setShowConfirmModal(false);
    setPendingUsername("");
  };

  const isLoading = checkUserMutation.isPending || loginMutation.isPending || createUserMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">ShowTracker</h1>
            <p className="text-muted-foreground mb-6">Track your favorite shows across all platforms</p>
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-muted rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              How to get started:
            </h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Enter your username.</li>
              <li>If your username matches an existing account, you will be logged in automatically.</li>
              <li>If no account exists, a new account will be created. A modal will appear asking you to confirm or reject the new account.</li>
              <li>Confirm to proceed or reject to cancel.</li>
              <li>Welcome to ShowTracker!</li>
            </ol>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Create New Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              No existing account found for username "{pendingUsername}". Would you like to create a new account?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={createUserMutation.isPending}
              className="flex-1 border-border hover:bg-accent"
            >
              Reject
            </Button>
            <Button
              onClick={handleCreateAccount}
              disabled={createUserMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createUserMutation.isPending ? "Creating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
