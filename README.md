# Mr. Nobody - Interactive Fiction Game

## What is Mr. Nobody?

**Our project, titled Mr. Nobody: The Interactive Narrative Game, is inspired by the movie Mr. Nobody (2009) and explores how small choices can lead to completely different life paths. The game lets players experience multiple versions of a single life story, where each decision shapes personality, relationships, and outcomes. Using large language models to generate storylines and dialogue, we aim to create an interactive experience that feels personal, emotional, and unique for every player.**

### Key Features

- **Dynamic Story Generation**: Uses AI (LangChain with Meta-Llama-3) to generate unique, branching narratives in real-time
- **Character System**: Each playthrough features a randomly generated character with:
  - Main attributes (Health, Family, Friends, Career, Wealth)
  - Personality traits (Big Five: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
  - Relationships and hobbies
- **Choice Driven Narrative**: Your decisions shape the character's life path and outcomes
- **Alternative Timelines**: Allows you to explore what might have happened with different choices

## Setup and Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **DeepInfra API Token** (for AI story generation)

### Step 1: Clone and Install Dependencies

```bash
# Navigate to the project directory
cd my-game

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory (`my-game/.env.local`) with the following:

```env
DEEPINFRA_TOKEN=your_deepinfra_api_token_here
```

**Getting a DeepInfra Token:**

1. Sign up at [DeepInfra](https://deepinfra.com/)
2. Navigate to your API keys section
3. Copy your API token
4. Paste it into the `.env.local` file

### Step 3: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### Step 4: Access the Game

Open your browser and navigate to:

- **Main Menu**: [http://localhost:3000](http://localhost:3000)
  - **New Game**: Start a fresh AI-generated story
  - **Play Demo**: Try a pre-built demo story

## How to Play

1. **Start a New Game**: Click "New Game" from the main menu
2. **Character Generation**: The system automatically generates a random character with unique attributes
3. **Read the Story**: Each chapter presents a narrative moment in the character's life
4. **Make Choices**: Select from available options that will shape the story
5. **Progress Through Life**: Guide your character from birth through different life stages
6. **Ending**: Accept your endings

## Project Structure

```
my-game/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes for story generation
│   │   ├── game/         # Main game page
│   │   └── demo/         # Demo mode page
│   ├── components/
│   │   ├── game/         # Game-specific components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility functions
│   └── data/             # Static data (demo stories)
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Technology Stack

- **Framework**: Next.js 15 (React 19)
- **AI/LLM**: LangChain with Meta-Llama-3-8B-Instruct (via DeepInfra)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn UI

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
