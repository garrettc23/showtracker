import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { platformNames } from "@/lib/platform-colors";

interface AddShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: string;
}

export default function AddShowDialog({ open, onOpenChange, defaultStatus }: AddShowDialogProps) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addShowMutation = useMutation({
    mutationFn: async (showData: { title: string; platform: string; status: string }) => {
      const response = await apiRequest("POST", "/api/shows", showData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shows"] });
      toast({
        title: "Show added",
        description: "Your show has been added successfully!",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add show",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && platform) {
      addShowMutation.mutate({
        title: title.trim(),
        platform,
        status: defaultStatus,
      });
    }
  };

  const handleClose = () => {
    setTitle("");
    setPlatform("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Show</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new TV show to your watchlist with its streaming platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="showTitle" className="text-sm font-medium text-foreground">
              Show Title
            </Label>
            <Input
              id="showTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter show title"
              className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="platform" className="text-sm font-medium text-foreground">
              Streaming Platform
            </Label>
            <Select value={platform} onValueChange={setPlatform} required>
              <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border hover:bg-accent"
              disabled={addShowMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={addShowMutation.isPending || !title.trim() || !platform}
            >
              {addShowMutation.isPending ? "Adding..." : "Add Show"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
