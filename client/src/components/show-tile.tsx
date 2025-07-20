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
    <Card className="show-tile bg-card border-border overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative group">
      <div className="relative">
        <img
          src={show.imageUrl || 'https://images.unsplash.com/photo-1489599734473-75adfd1b2a5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600'}
          alt={`${show.title} poster`}
          className="w-full h-64 sm:h-72 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1489599734473-75adfd1b2a5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600';
          }}
        />
        
        {/* Platform Badge */}
        <Badge
          className="absolute top-3 right-3 text-white text-xs font-semibold"
          style={{ backgroundColor: platformColor }}
        >
          {platformName}
        </Badge>
        
        {/* Completed Badge */}
        {show.status === "completed" && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold">
            ✓ Completed
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-foreground font-semibold text-center mb-3 line-clamp-2">
          {show.title}
        </h3>
        {getActionButton()}
      </CardContent>
    </Card>
  );
}
