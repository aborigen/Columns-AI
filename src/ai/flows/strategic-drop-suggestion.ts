'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing strategic drop suggestions in the Pulp Drop game.
 *
 * - strategicDropSuggestion - A function that takes the current game state and recommends an optimal drop location.
 * - StrategicDropSuggestionInput - The input type for the strategicDropSuggestion function.
 * - StrategicDropSuggestionOutput - The return type for the strategicDropSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const FruitSchema = z.object({
  id: z.string().describe('Unique identifier for the fruit.'),
  type: z.string().describe('The type of fruit (e.g., "cherry", "grape", "orange", "watermelon").'),
  x: z.number().describe('The x-coordinate of the fruit in the game arena.'),
  y: z.number().describe('The y-coordinate of the fruit in the game arena.'),
  radius: z.number().describe('The radius of the fruit.'),
});

const StrategicDropSuggestionInputSchema = z.object({
  currentFruits: z.array(FruitSchema).describe('An array describing all fruits currently in the game arena, including their positions, types, and sizes.'),
  nextFruitType: z.string().describe('The type of fruit that is about to be dropped next.'),
  arenaWidth: z.number().describe('The total width of the game arena.'),
  availableDropXRange: z.object({
    min: z.number().describe('The minimum x-coordinate where a fruit can be dropped.'),
    max: z.number().describe('The maximum x-coordinate where a fruit can be dropped.'),
  }).describe('The valid horizontal range for dropping the next fruit.'),
});
export type StrategicDropSuggestionInput = z.infer<typeof StrategicDropSuggestionInputSchema>;

// Output Schema
const StrategicDropSuggestionOutputSchema = z.object({
  suggestedDropX: z.number().describe('The recommended horizontal x-coordinate for dropping the next fruit.'),
  reasoning: z.string().describe('An explanation of why this specific drop location was chosen, considering potential merges and cascades.'),
});
export type StrategicDropSuggestionOutput = z.infer<typeof StrategicDropSuggestionOutputSchema>;

// Prompt definition
const strategicDropSuggestionPrompt = ai.definePrompt({
  name: 'strategicDropSuggestionPrompt',
  input: {schema: StrategicDropSuggestionInputSchema},
  output: {schema: StrategicDropSuggestionOutputSchema},
  prompt: `You are an expert player of "Pulp Drop", a game where players drop fruits into an arena to merge identical types into larger fruits. The goal is to maximize merges and cascades without overflowing the arena.

Your task is to analyze the current state of the game arena and recommend the optimal horizontal (x) coordinate to drop the next fruit. Provide a brief but insightful reasoning for your recommendation, focusing on potential merges, cascade opportunities, and avoiding an overflow.

Here is the current game state:
Arena Width: {{{arenaWidth}}}
Available Drop X Range: min={{{availableDropXRange.min}}}, max={{{availableDropXRange.max}}}
Next Fruit to Drop: {{{nextFruitType}}}
Current Fruits in Arena (JSON):
{{{json currentFruits}}}

Consider the size of the '{{{nextFruitType}}}' and how it might interact with existing fruits. Aim to create chains of merges. Avoid dropping in positions that will immediately lead to the heap growing too high. The suggestedDropX must be within the availableDropXRange.min and availableDropXRange.max.`,
});

// Flow definition
const strategicDropSuggestionFlow = ai.defineFlow(
  {
    name: 'strategicDropSuggestionFlow',
    inputSchema: StrategicDropSuggestionInputSchema,
    outputSchema: StrategicDropSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await strategicDropSuggestionPrompt(input);
    if (!output) {
      throw new Error('Failed to get a strategic drop suggestion from the AI.');
    }
    // Ensure the suggestedDropX is within the valid range.
    const clampedX = Math.max(input.availableDropXRange.min, Math.min(input.availableDropXRange.max, output.suggestedDropX));
    return {
      ...output,
      suggestedDropX: clampedX,
    };
  }
);

// Wrapper function
export async function strategicDropSuggestion(input: StrategicDropSuggestionInput): Promise<StrategicDropSuggestionOutput> {
  return strategicDropSuggestionFlow(input);
}
