
import React from 'react';
import { FRUIT_TIERS } from '@/lib/game-constants';
import { ArrowRight } from 'lucide-react';

export function EvolutionGuide() {
  return (
    <div className="p-4 glass rounded-xl flex flex-col gap-4 overflow-hidden border-white/5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Evolution Cycle</h3>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {FRUIT_TIERS.map((fruit, idx) => (
          <div key={fruit.type} className="flex items-center gap-3 group">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2"
              style={{ 
                backgroundColor: fruit.color + '20', 
                borderColor: fruit.color,
                boxShadow: `0 0 10px ${fruit.color}40`
              }}
            >
              {fruit.label}
            </div>
            <div className="flex-1 text-xs font-medium">
              <span className="text-foreground capitalize">{fruit.type}</span>
            </div>
            {idx < FRUIT_TIERS.length - 1 && (
               <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
