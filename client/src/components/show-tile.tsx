import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { platformColors, platformNames, type Platform } from "@/lib/platform-colors";
import type { Show } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ShowTileProps {
  show: Show;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

export default function ShowTile({ show, onUpdateStatus, onDelete, isUpdating }: ShowTileProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const platform = show.platform as Platform;
  const platformColor = platformColors[platform] || platformColors.other;
  const platformName = platformNames[platform] || show.platform;

  const getActionButton = () => {
    switch (show.status) {
      case "watching":
        return (
          <Button
            onClick={() => onUpdateStatus(show.id, "completed")}
            disabled={isUpdating}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Mark Completed
          </Button>
        );
      case "planned":
        return (
          <Button
            onClick={() => onUpdateStatus(show.id, "watching")}
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Move to Watching
          </Button>
        );
      case "completed":
        return (
          <Button
            onClick={() => onUpdateStatus(show.id, "planned")}
            disabled={isUpdating}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Rewatch
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="show-tile bg-card border-border overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative group rounded-lg">
        <div className="relative">
          <img
            src={show.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxRjI5MzciLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAsIDIyNSkiPjxnIHRyYW5zZm9ybT0ic2NhbGUoMi41KSB0cmFuc2xhdGUoLTUwLCAtMjUpIj48cGF0aCBkPSJNMCAwaDEwMHY1MEgweiIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiNFNTNFM0UiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjE1IiByPSIzIiBmaWxsPSIjMzhBMTY5Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSIxNSIgcj0iMyIgZmlsbD0iI0Q2OUUyRSIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiMzMTgyQ0UiLz48cGF0aCBkPSJNMjAgMjVjMCA1IDUgMTAgMTUgMTBzMTUtNSAxNS0xMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEwIDVMMTAgME05MCA1TDkwIDBNMTAgNDVMMTAgNTBNOTAgNDVMOTAgNTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9nPjwvZz48dGV4dCB4PSIxNTAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='}
            alt={`${show.title} poster`}
            className="w-full h-64 sm:h-72 object-cover object-center"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9IiMxRjI5MzciLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTAsIDIyNSkiPjxnIHRyYW5zZm9ybT0ic2NhbGUoMi41KSB0cmFuc2xhdGUoLTUwLCAtMjUpIj48cGF0aCBkPSJNMCAwaDEwMHY1MEgweiIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiNFNTNFM0UiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjE1IiByPSIzIiBmaWxsPSIjMzhBMTY5Ii8+PGNpcmNsZSBjeD0iMzUiIGN5PSIxNSIgcj0iMyIgZmlsbD0iI0Q2OUUyRSIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiMzMTgyQ0UiLz48cGF0aCBkPSJNMjAgMjVjMCA1IDUgMTAgMTUgMTBzMTUtNSAxNS0xMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEwIDVMMTAgME05MCA1TDkwIDBNMTAgNDVMMTAgNTBNOTAgNDVMOTAgNTAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9nPjwvZz48dGV4dCB4PSIxNTAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          
          {/* Delete Button - Top Left */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            size="sm"
            className="absolute top-2 left-2 h-8 w-8 p-0 bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          {/* Platform Badge - Top Right */}
          <Badge
            className="absolute top-3 right-3 text-white text-xs font-semibold rounded-lg"
            style={{ backgroundColor: platformColor }}
          >
            {platformName}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground font-semibold text-left flex-1 line-clamp-2">
              {show.title}
            </h3>
            {/* Completed Badge - Right of Show Name */}
            {show.status === "completed" && (
              <Badge className="ml-2 bg-green-600 text-white text-xs font-semibold rounded-lg">
                ✓ Completed
              </Badge>
            )}
          </div>
          {getActionButton()}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Show</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{show.title}" from your watchlist? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(show.id);
                setShowDeleteDialog(false);
              }}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
