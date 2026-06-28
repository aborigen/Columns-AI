
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MatterScene } from '@/components/game/MatterScene';
import { AIAdvisor } from '@/components/game/AIAdvisor';
import { EvolutionGuide } from '@/components/game/EvolutionGuide';
import { FRUIT_TIERS, ARENA_WIDTH, ARENA_HEIGHT } from '@/lib/game-constants';
import { Trophy, RefreshCcw, LayoutDashboard, BrainCircuit, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PulpDropGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nextFruitIndex, setNextFruitIndex] = useState(0);
  const [currentBodies, setCurrentBodies] = useState<any[]>([]);
  const [suggestedX, setSuggestedX] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('pulpdrop_high_score') : null;
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {
      console.warn('LocalStorage not available');
    }
    setNextFruitIndex(Math.floor(Math.random() * 4)); 
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('pulpdrop_high_score', score.toString());
        }
      } catch (e) {}
    }
  }, [score, highScore]);

  const handleFruitDropped = useCallback(() => {
    setNextFruitIndex(Math.floor(Math.random() * 5));
    setSuggestedX(null);
  }, []);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore(prev => prev + points);
  }, []);

  const handleReset = useCallback(() => {
    setScore(0);
    setSuggestedX(null);
    setGameKey(prev => prev + 1);
  }, []);

  const arenaDropRange = useMemo(() => {
    const radius = FRUIT_TIERS[nextFruitIndex].radius;
    return {
      min: radius + 10,
      max: ARENA_WIDTH - radius - 10
    };
  }, [nextFruitIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic">PULP<span className="text-primary">DROP</span></h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Physics Strategy Merging</p>
            </div>
          </div>

          <div className="flex space-x-4 items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <HelpCircle className="w-6 h-6 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic">HOW TO PLAY</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Master the art of the perfect fruit drop.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-6 py-4">
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">1</div>
                    <p className="text-sm leading-relaxed">Move your <span className="text-foreground font-bold">cursor or finger</span> to position the fruit above the arena.</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">2</div>
                    <p className="text-sm leading-relaxed"><span className="text-foreground font-bold">Click or tap</span> to drop the fruit. Use physics to your advantage!</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">3</div>
                    <p className="text-sm leading-relaxed">Combine <span className="text-foreground font-bold">two identical fruits</span> to merge them into a larger fruit.</p>
                  </div>
                  <div className="flex space-x-4 border-t border-white/5 pt-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary shrink-0">!</div>
                    <p className="text-sm leading-relaxed italic text-muted-foreground">Don't let the fruits pile up past the <span className="text-primary font-bold">Stability Threshold</span> line.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="glass px-6 py-3 rounded-2xl flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Record</p>
                <p className="text-xl font-black">{highScore.toLocaleString()}</p>
              </div>
            </div>
            <div className="glass px-6 py-3 rounded-2xl bg-primary/5 border-primary/20 flex items-center space-x-3">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-1">Score</p>
                <p className="text-2xl font-black">{score.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleReset} className="rounded-2xl h-14 w-14 border-white/10 hover:bg-white/5">
              <RefreshCcw className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          <aside className="hidden lg:flex flex-col space-y-6">
            <div className="glass p-6 rounded-3xl">
               <h3 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-widest flex items-center space-x-2">
                 <RefreshCcw className="w-4 h-4" />
                 <span>Evolution Cycle</span>
               </h3>
               <EvolutionGuide />
            </div>
          </aside>

          <main className="flex flex-col items-center space-y-6">
            <div 
              className="relative glass rounded-[2rem] border-4 border-white/5 shadow-[0_0_100px_rgba(255,77,77,0.1)] overflow-hidden"
              style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}
            >
              <MatterScene 
                key={gameKey}
                nextFruitIndex={nextFruitIndex}
                onFruitDropped={handleFruitDropped}
                onScoreUpdate={handleScoreUpdate}
                onBodiesUpdate={setCurrentBodies}
                suggestedX={suggestedX}
                onGameOver={handleReset}
              />
            </div>
          </main>

          <aside className="flex flex-col space-y-6 w-full max-w-sm mx-auto">
            <div className="glass p-6 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Up Next</p>
               <div className="flex items-center space-x-6">
                  <div 
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-inner border-2 border-white/10 animate-float"
                    style={{ 
                      backgroundColor: FRUIT_TIERS[nextFruitIndex].color + '20',
                      borderColor: FRUIT_TIERS[nextFruitIndex].color + '40'
                    }}
                  >
                    {FRUIT_TIERS[nextFruitIndex].label}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black capitalize">{FRUIT_TIERS[nextFruitIndex].type}</h4>
                    <p className="text-sm text-muted-foreground">Tier {FRUIT_TIERS[nextFruitIndex].tier + 1}</p>
                    <div className="mt-2 flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-1.5 rounded-full ${i < FRUIT_TIERS[nextFruitIndex].tier ? 'bg-primary' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <AIAdvisor 
              onSuggestionReceived={setSuggestedX}
              gameState={{
                currentFruits: currentBodies,
                nextFruitType: FRUIT_TIERS[nextFruitIndex].type,
                arenaWidth: ARENA_WIDTH,
                availableDropXRange: arenaDropRange
              }}
            />

            <div className="glass p-6 rounded-3xl bg-secondary/5 border-secondary/10">
              <div className="flex items-center space-x-2 mb-3">
                <BrainCircuit className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">Tactical Tip</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dropping fruits near the walls can sometimes prevent them from rolling too fast. Use the AI Strategic Lens to find potential merge chains.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
