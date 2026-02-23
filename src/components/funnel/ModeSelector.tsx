import { Users, Rocket, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/hooks/use-app-state";
import { useToast } from "@/hooks/use-toast";

const collaborateBullets = [
  "Step-by-step input",
  "Approve each section",
  "Live editing",
];

const getItDoneBullets = [
  "One strategic brief",
  "Autonomous execution",
  "Check back in 10 min",
];

export function ModeSelector() {
  const { selectMode } = useAppState();
  const { toast } = useToast();

  const handleGetItDone = () => {
    toast({
      title: "Coming in V2",
      description: "Starting Collaborate mode for now.",
    });
    selectMode("collaborate");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Before we build your Lead Magnet Funnel…
        </h2>
        <p className="text-sm text-muted-foreground">How do you want to work?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {/* Collaborate */}
        <Card className="relative border border-border hover:border-primary/40 transition-colors cursor-pointer group">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Collaborate</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Real-time collaboration with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <ul className="space-y-1.5">
              {collaborateBullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-primary shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              size="sm"
              className="w-full"
              onClick={() => selectMode("collaborate")}
            >
              Start Collaborating
            </Button>
          </CardFooter>
        </Card>

        {/* Get It Done */}
        <Card className="relative border border-border opacity-70 hover:opacity-90 transition-opacity cursor-pointer group">
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5"
          >
            V2
          </Badge>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Get It Done</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Delegate and receive complete deliverables
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <ul className="space-y-1.5">
              {getItDoneBullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleGetItDone}
            >
              Brief &amp; Build
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
