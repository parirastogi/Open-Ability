# OpenAbility AI

OpenAbility AI is an inclusive career companion designed to adapt the hiring experience to the candidate, rather than forcing the candidate to adapt to a traditional recruitment platform. 

The application focuses on professional abilities, career targets, and sensory/workplace accommodations without bias.

---

##  Getting Started

Follow these steps to run the product locally on your machine.

### 1. Install Dependencies
Initialize the project modules:
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root workspace to specify variables (e.g. database credentials):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/openability_db?schema=public"
```

### 3. Launch Development Server
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the application.

---

##  Folder Architecture

Designed using strict separation of concerns, the workspace is organized as follows:

```
/app                # Next.js App Router Pages and Layouts
  /dashboard        # Main Candidates workspace area
  /onboarding       # Accommodations setup wizard
/components         # Reusable components
  /layout           # Common Navigation and Accessibility buttons
  /landing          # Landing page assets and 3D Canvas visual
/database           # Prisma Schema and seed scripts
/features           # Feature-specific panels
  /assistant        # Persistent companion chat interface
  /matching         # Explainable score calculation cards
  /resume           # Extraction upload grids
/services           # Logic wrappers
  /ai               # LLM resume analysis and mock engines
  /matching         # Weighted multivariable scoring
  /speech           # Web Speech Synthesis & Recognition bindings
  /accessibility    # DOM style overrides
/types              # TypeScript type structures
```

---

##  Weighted Matching Model

The engine calculates scores across multiple dimensions, ensuring accessibility needs represent compatibility validations rather than negative weights:

- **Technical Skills Match (35% weight):** Compares required capabilities against candidate skills.
- **Experience Match (20% weight):** Assesses experience tenure against target requirements.
- **Career Goal Alignment (15% weight):** Evaluates target roles matching job descriptions.
- **Work Preferences Match (15% weight):** Evaluates Remote/Hybrid preferences against office configurations.
- **Accessibility Accommodation Match (15% weight):** Confirms if employer supports requested accommodations (Screen Reader compatibility, Audio captions, Wheelchair access, Flexible scheduling).

---

## 🛠️ Verification
Verify that code passes type checking:
```bash
npx tsc --noEmit
```
