import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-warm">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};
