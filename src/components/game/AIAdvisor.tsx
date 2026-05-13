
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Target } from 'lucide-react';
import { strategicDropSuggestion, type StrategicDropSuggestionInput } from '@/ai/flows/strategic-drop-suggestion';
import { useToast } from '@/hooks/use-toast';

interface AIAdvisorProps {
  gameState: StrategicDropSuggestionInput;
  onSuggestionReceived: (x: number) => void;
}

export function AIAdvisor({ gameState, onSuggestionReceived }: AIAdvisorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setSuggestion(null);

    try {
      const result = await strategicDropSuggestion(gameState);
      setSuggestion(result.reasoning);
      onSuggestionReceived(result.suggestedDropX);
    } catch (error) {
      toast({
        title: "Strategic Lens Offline",
        description: "Could not reach the AI strategist right now.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 glass rounded-xl border-primary/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Strategic Lens
        </h3>
        <Button 
          size="sm" 
          variant="secondary" 
          className="h-8 px-2 font-bold bg-secondary hover:bg-secondary/80"
          onClick={handleGetSuggestion}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "ANALYZE"}
        </Button>
      </div>
      
      {suggestion ? (
        <div className="text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex gap-2 items-start text-secondary mb-1">
             <Target className="w-3 h-3 mt-1 shrink-0" />
             <span className="font-medium">SUGGESTED DROP</span>
          </div>
          {suggestion}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Tap analyze to get tactical insights based on the current heap.
        </p>
      )}
    </div>
  );
}
