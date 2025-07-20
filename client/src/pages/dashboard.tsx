import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ShowTile from "@/components/show-tile";
import AddShowDialog from "@/components/add-show-dialog";
import type { Show } from "@shared/schema";

type TabType = "watching" | "planned" | "completed";
type TimeFilter = "all" | "30days" | "3months" | "year";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("watching");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: shows = [], isLoading } = useQuery<Show[]>({
    queryKey: ["/api/shows"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const updateShowMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/shows/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shows"] });
      toast({
        title: "Show updated",
        description: "Show status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredShows = useMemo(() => {
    const showsByStatus = {
      watching: shows.filter(show => show.status === "watching"),
      planned: shows.filter(show => show.status === "planned"),
      completed: shows.filter(show => show.status === "completed"),
    };

    if (activeTab === "completed" && timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case "30days":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      showsByStatus.completed = showsByStatus.completed.filter(show => 
        show.completedAt && new Date(show.completedAt) >= filterDate
      );
    }

    return showsByStatus;
  }, [shows, activeTab, timeFilter]);

  const currentShows = filteredShows[activeTab];

  const handleUpdateShow = (id: number, status: string) => {
    updateShowMutation.mutate({ id, status });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const tabContent = {
    watching: {
      title: "Currently Watching",
      description: "Shows you're actively watching",
    },
    planned: {
      title: "Plan to Watch",
      description: "Shows on your watchlist",
    },
    completed: {
      title: "Completed Shows",
      description: "Shows you've finished watching",
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-foreground">ShowTracker</h1>
              <span className="text-muted-foreground">
                Welcome, <span className="text-foreground">{user?.username}</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Show
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-border">
            {(["watching", "planned", "completed"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-semibold text-lg whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tabContent[tab].title}
                <Badge variant="secondary" className="ml-2">
                  {filteredShows[tab].length}
                </Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {tabContent[activeTab].title}
              </h2>
              <p className="text-muted-foreground">{tabContent[activeTab].description}</p>
            </div>
            
            {activeTab === "completed" && (
              <div className="mt-4 sm:mt-0">
                <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {currentShows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No shows in this category yet.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                className="border-border hover:bg-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Show
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {currentShows.map((show) => (
                <ShowTile
                  key={show.id}
                  show={show}
                  onUpdateStatus={handleUpdateShow}
                  isUpdating={updateShowMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddShowDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
