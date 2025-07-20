import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { platformColors, platformNames, type Platform } from "@/lib/platform-colors";
import type { Show } from "@shared/schema";

interface ShowTileProps {
  show: Show;
  onUpdateStatus: (id: number, status: string) => void;
  isUpdating: boolean;
}

export default function ShowTile({ show, onUpdateStatus, isUpdating }: ShowTileProps) {
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
            onClick={() => onUpdateStatus(show.id, "watching")}
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
    <Card className="show-tile bg-card border-border overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative group rounded-lg">
      <div className="relative">
        <img
          src={show.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjUwIiB5PSIyNTAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIxNzUiIHk9IjI3NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+VFY8L3A+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjQwMCIgZmlsbD0iIzhCNUM4QyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K'}
          alt={`${show.title} poster`}
          className="w-full h-64 sm:h-72 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjUwIiB5PSIyNTAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIxNzUiIHk9IjI3NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHA+VFY8L3A+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjQwMCIgZmlsbD0iIzhCNUM4QyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
          }}
        />
        
        {/* Platform Badge */}
        <Badge
          className="absolute top-3 right-3 text-white text-xs font-semibold rounded-lg"
          style={{ backgroundColor: platformColor }}
        >
          {platformName}
        </Badge>
        
        {/* Completed Badge */}
        {show.status === "completed" && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold rounded-lg">
            ✓ Completed
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-foreground font-semibold text-left mb-3 line-clamp-2">
          {show.title}
        </h3>
        {getActionButton()}
      </CardContent>
    </Card>
  );
}
