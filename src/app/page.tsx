
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MatterScene } from '@/components/game/MatterScene';
import { AIAdvisor } from '@/components/game/AIAdvisor';
import { EvolutionGuide } from '@/components/game/EvolutionGuide';
import { FRUIT_TIERS, ARENA_WIDTH, ARENA_HEIGHT } from '@/lib/game-constants';
import { Trophy, RefreshCcw, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function PulpDropPage() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nextFruitIndex, setNextFruitIndex] = useState(0);
  const [currentBodies, setCurrentBodies] = useState<any[]>([]);
  const [suggestedX, setSuggestedX] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pulpdrop_highscore');
    if (saved) setHighScore(parseInt(saved));
    setNextFruitIndex(Math.floor(Math.random() * 5)); // Initial small fruits
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pulpdrop_highscore', score.toString());
    }
  }, [score, highScore]);

  const handleFruitDropped = useCallback(() => {
    // New next fruit is always within the first 5 tiers for gameplay balance
    setNextFruitIndex(Math.floor(Math.random() * 5));
    setSuggestedX(null);
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const handleGameOver = useCallback(() => {
    // Game over logic handled inside MatterScene via state, 
    // but this callback is here for potential analytics or global state
  }, []);

  const handleBodiesUpdate = useCallback((bodies: any[]) => {
    setCurrentBodies(bodies);
  }, []);

  const arenaDropRange = useMemo(() => ({
    min: FRUIT_TIERS[nextFruitIndex].radius,
    max: ARENA_WIDTH - FRUIT_TIERS[nextFruitIndex].radius
  }), [nextFruitIndex]);

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_400px_1fr] gap-8 items-start">
        
        {/* Left Sidebar: Score & Evolution */}
        <aside className="hidden lg:flex flex-col gap-6 h-full">
          <div className="p-6 glass rounded-2xl flex flex-col gap-4 border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Record</p>
                <p className="text-2xl font-black text-foreground">{highScore.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <EvolutionGuide />
        </aside>

        {/* Center: Game Container */}
        <main className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-end lg:hidden mb-2">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Score</span>
                <span className="text-3xl font-black">{score.toLocaleString()}</span>
             </div>
             <div className="p-2 glass rounded-lg flex gap-2 items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Next:</span>
                <span className="text-2xl">{FRUIT_TIERS[nextFruitIndex].label}</span>
             </div>
          </div>

          <div 
            className="relative shadow-[0_0_100px_rgba(242,68,114,0.1)] rounded-b-3xl border-x-4 border-b-4 border-white/5 overflow-hidden"
            style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
          >
            <MatterScene 
              nextFruitIndex={nextFruitIndex}
              onFruitDropped={handleFruitDropped}
              onScoreUpdate={handleScoreUpdate}
              onGameOver={handleGameOver}
              suggestedX={suggestedX}
              onBodiesUpdate={handleBodiesUpdate}
            />
          </div>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden lg:hidden">
             <Progress value={(score / Math.max(highScore, 1000)) * 100} className="h-full bg-primary" />
          </div>
        </main>

        {/* Right Sidebar: HUD & AI */}
        <aside className="flex flex-col gap-6 h-full">
          {/* Main HUD */}
          <div className="hidden lg:flex p-6 glass rounded-2xl flex-col gap-6 border-white/5">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Score</p>
                  <h1 className="text-5xl font-black text-foreground tracking-tighter">{score.toLocaleString()}</h1>
               </div>
               <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <RefreshCcw className="w-5 h-5 text-muted-foreground" />
               </button>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Next Up</p>
                 <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 border-white/5 bg-white/5 animate-squish"
                      style={{ color: FRUIT_TIERS[nextFruitIndex].color }}
                    >
                      {FRUIT_TIERS[nextFruitIndex].label}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-foreground capitalize">{FRUIT_TIERS[nextFruitIndex].type}</span>
                       <span className="text-xs text-muted-foreground">Level {FRUIT_TIERS[nextFruitIndex].tier + 1}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* AI Advisor */}
          <AIAdvisor 
            onSuggestionReceived={(x) => setSuggestedX(x)}
            gameState={{
              currentFruits: currentBodies,
              nextFruitType: FRUIT_TIERS[nextFruitIndex].type,
              arenaWidth: ARENA_WIDTH,
              availableDropXRange: arenaDropRange
            }}
          />

          {/* Tips / Stats */}
          <div className="p-4 glass rounded-xl border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">Pro Tip</span>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed">
               Dropping smaller fruits at the bottom helps stabilize the heap. Larger fruits like Pineapple should stay centered to maximize merge opportunities.
             </p>
          </div>
        </aside>

      </div>

      {/* Footer Mobile Stats */}
      <footer className="fixed bottom-0 left-0 w-full lg:hidden bg-background/80 backdrop-blur-md p-4 border-t border-white/5 flex justify-around">
         <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">High Score</p>
            <p className="font-bold">{highScore.toLocaleString()}</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] font-bold text-primary uppercase">Current</p>
            <p className="font-bold">{score.toLocaleString()}</p>
         </div>
      </footer>
    </div>
  );
}
