# SpashtAI 🌌

**SpashtAI** is a premium, transparency-first insurance policy analyzer. It transforms complex, jargon-heavy insurance documents into clear, actionable insights using cutting-edge AI and a world-class 3D immersive user experience.

![SpashtAI Hero](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3)

## ✨ Features

- **3D Deep Space Experience**: A custom-built Three.js galaxy environment that provides a unique, "floating in space" feeling throughout the app.
- **AI Policy Extraction**: Powered by **Gemini 2.5 Flash**, the app extracts hidden exclusions, coverage details, and personalized risks from any PDF insurance policy.
- **Glassmorphic UI**: High-end visual design featuring translucent panels, subtle glows, and fluid animations using Framer Motion.
- **Insight Deck**: A swipeable, gesture-based interface for reviewing policy insights, making document analysis feel like a modern discovery experience.
- **Personalized Risk Scoring**: Generates a dynamic "SpashtAI Score" by measuring how well a policy aligns with your unique profile (age, dependents, risk appetite).

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **AI Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth & DB**: [Firebase](https://firebase.google.com/)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/anshika-atulgupta/spashtAi.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   # Add your Firebase config variables if using Auth/Firestore
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌌 Core Components

- **SpaceBackground**: A custom 3D star field with over 4,000 particles and a procedural Milky Way band.
- **AnalyzeAction**: A robust server action that parses PDFs, handles JSON extraction, and manages AI tokens efficiently.
- **InsightCard**: Gesture-driven component for interactive data visualization.

---

Built with ❤️ by the SpashtAI Team.
