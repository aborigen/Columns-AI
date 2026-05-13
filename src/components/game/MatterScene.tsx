
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { 
  FRUIT_TIERS, 
  ARENA_WIDTH, 
  ARENA_HEIGHT, 
  DROP_STAGING_HEIGHT,
  GAME_OVER_LINE_Y
} from '@/lib/game-constants';

interface MatterSceneProps {
  nextFruitIndex: number;
  onFruitDropped: () => void;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
  suggestedX: number | null;
  onBodiesUpdate: (bodies: any[]) => void;
}

export function MatterScene({ 
  nextFruitIndex, 
  onFruitDropped, 
  onScoreUpdate, 
  onGameOver,
  suggestedX,
  onBodiesUpdate
}: MatterSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const stagingFruitRef = useRef<Matter.Body | null>(null);
  const gameOverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mousePos, setMousePos] = useState({ x: ARENA_WIDTH / 2 });

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = engineRef.current;
    engine.gravity.y = 1.2;

    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
        wireframes: false,
        background: 'transparent',
      }
    });
    renderRef.current = render;

    // Arena walls
    const ground = Matter.Bodies.rectangle(ARENA_WIDTH / 2, ARENA_HEIGHT + 25, ARENA_WIDTH, 50, { isStatic: true, render: { visible: false } });
    const leftWall = Matter.Bodies.rectangle(-25, ARENA_HEIGHT / 2, 50, ARENA_HEIGHT, { isStatic: true, render: { visible: false } });
    const rightWall = Matter.Bodies.rectangle(ARENA_WIDTH + 25, ARENA_HEIGHT / 2, 50, ARENA_HEIGHT, { isStatic: true, render: { visible: false } });
    
    Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Collision Events
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.label === bodyB.label && bodyA.label !== 'Rectangle Body') {
          const tierIdx = FRUIT_TIERS.findIndex(f => f.type === bodyA.label);
          if (tierIdx !== -1 && tierIdx < FRUIT_TIERS.length - 1) {
            const nextTier = FRUIT_TIERS[tierIdx + 1];
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;

            onScoreUpdate(nextTier.score);
            
            Matter.Composite.remove(engine.world, [bodyA, bodyB]);
            
            const newFruit = Matter.Bodies.circle(midX, midY, nextTier.radius, {
              label: nextTier.type,
              render: {
                fillStyle: nextTier.color,
                strokeStyle: 'rgba(255,255,255,0.3)',
                lineWidth: 2,
              },
              restitution: 0.3,
              friction: 0.1
            });
            Matter.Composite.add(engine.world, newFruit);
          }
        }
      });
    });

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Update parent with game state for AI
    const updateLoop = () => {
      if (isGameOver) return;
      const bodies = Matter.Composite.allBodies(engine.world)
        .filter(b => b.label !== 'Rectangle Body' && b.id !== stagingFruitRef.current?.id)
        .map(b => ({
          id: b.id.toString(),
          type: b.label,
          x: b.position.x,
          y: b.position.y,
          radius: (b as any).circleRadius
        }));
      onBodiesUpdate(bodies);
      
      // Game Over Check
      const overflowing = bodies.some(b => b.y - b.radius < GAME_OVER_LINE_Y);
      if (overflowing && !gameOverTimerRef.current) {
        gameOverTimerRef.current = setTimeout(() => {
          setIsGameOver(true);
          onGameOver();
        }, 3000);
      } else if (!overflowing && gameOverTimerRef.current) {
        clearTimeout(gameOverTimerRef.current);
        gameOverTimerRef.current = null;
      }

      requestAnimationFrame(updateLoop);
    };
    const animId = requestAnimationFrame(updateLoop);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      cancelAnimationFrame(animId);
      if (gameOverTimerRef.current) clearTimeout(gameOverTimerRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isGameOver) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const x = Math.max(
      FRUIT_TIERS[nextFruitIndex].radius, 
      Math.min(ARENA_WIDTH - FRUIT_TIERS[nextFruitIndex].radius, clientX - rect.left)
    );
    setMousePos({ x });
  };

  const handleClick = useCallback(() => {
    if (isGameOver || stagingFruitRef.current) return;

    const fruitDef = FRUIT_TIERS[nextFruitIndex];
    const dropX = mousePos.x;
    
    const fruit = Matter.Bodies.circle(dropX, DROP_STAGING_HEIGHT, fruitDef.radius, {
      label: fruitDef.type,
      render: {
        fillStyle: fruitDef.color,
        strokeStyle: 'rgba(255,255,255,0.3)',
        lineWidth: 2,
      },
      restitution: 0.2,
      friction: 0.1
    });

    Matter.Composite.add(engineRef.current.world, fruit);
    onFruitDropped();
  }, [nextFruitIndex, mousePos, isGameOver, onFruitDropped]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full cursor-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[#1A0C0E] overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '30px 30px'
         }} />
      </div>

      {/* Danger Zone Line */}
      <div 
        className="absolute w-full border-t-2 border-dashed border-primary/40 z-10" 
        style={{ top: GAME_OVER_LINE_Y }}
      >
        <div className="absolute right-2 -top-6 text-[10px] font-bold text-primary tracking-widest bg-background/80 px-2 py-0.5 rounded">
          DANGER ZONE
        </div>
      </div>

      {/* Suggested Path */}
      {suggestedX !== null && !isGameOver && (
        <div 
          className="absolute h-full w-[2px] bg-secondary/30 z-0 pointer-events-none"
          style={{ left: suggestedX }}
        >
          <div className="absolute bottom-0 w-4 h-4 -left-[7px] border-2 border-secondary/50 rounded-full animate-ping" />
        </div>
      )}

      {/* Drop Staging Ghost */}
      {!isGameOver && (
        <div 
          className="absolute top-[80px] pointer-events-none z-20 flex items-center justify-center transition-all duration-75 ease-out"
          style={{ 
            left: mousePos.x, 
            transform: 'translate(-50%, -50%)',
            width: FRUIT_TIERS[nextFruitIndex].radius * 2,
            height: FRUIT_TIERS[nextFruitIndex].radius * 2,
            borderRadius: '50%',
            backgroundColor: FRUIT_TIERS[nextFruitIndex].color,
            boxShadow: `0 0 20px ${FRUIT_TIERS[nextFruitIndex].color}80`,
            border: '2px solid rgba(255,255,255,0.4)'
          }}
        >
           <span className="text-xl select-none">{FRUIT_TIERS[nextFruitIndex].label}</span>
           <div className="absolute -top-12 h-12 w-[1px] bg-gradient-to-b from-transparent to-primary/50" />
        </div>
      )}

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
          <h2 className="text-4xl font-black text-primary mb-2 italic">ARENA FULL!</h2>
          <p className="text-muted-foreground mb-8 max-w-[200px]">The fruits have reached the danger threshold.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/40"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
