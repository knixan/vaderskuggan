# Väderskuggan

<p align="center">
  <img src="public/image/loggo.png" alt="Väderskuggan Logo" width="200"/>
</p>

<p align="center">
  <strong>A modern Swedish weather application built with Next.js</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**Väderskuggan** is a clean and intuitive weather application that provides real-time and upcoming weather data for Swedish locations.  
Built with modern web technologies, it offers a seamless experience across desktop and mobile devices.

The application fetches weather data from **SMHI’s Open Data API** (Swedish Meteorological and Hydrological Institute) and presents it in a clear, accessible, and visually appealing interface.

---

## Features

- **Current Temperature Display** – Real-time temperature and conditions  
- **Comprehensive Weather Metrics** – Humidity, air pressure, visibility, and cloud cover  
- **Tomorrow’s Forecast** – Dedicated card for the next day’s weather  
- **Responsive Design** – Optimized for both desktop and mobile devices  
- **Interactive Comments** – Weather-related commentary and insights  
- **High Performance** – Built with Next.js and Turbopack for optimal speed  
- **Modern UI** – Clean and minimal design with Tailwind CSS  

---

## Demo

<div align="center">
  <img src="public/screenshot-desktop.png" alt="Desktop Screenshot" width="600"/>
  <br/>
  <em>Desktop View</em>
</div>

<br/>

<div align="center">
  <img src="public/screenshot-mobile.png" alt="Mobile Screenshot" width="300"/>
  <br/>
  <em>Mobile View</em>
</div>

---

## Getting Started

### Prerequisites
- **Node.js** (LTS version recommended)  
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/knixan/vaderskuggan.git
   cd vaderskuggan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Visit `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** React Icons
- **API:** SMHI Open Data API
- **Build Tool:** Turbopack

---

API: SMHI Open Data API

Build Tool: Turbopack

## Project Structure

```
vaderskuggan/
├── public/
│   ├── image/
│   │   └── loggo.png
│   ├── screenshot-desktop.png
│   └── screenshot-mobile.png
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── weather.ts          # Weather data fetching logic
│   │   ├── type/
│   │   │   └── types.ts            # TypeScript type definitions
│   │   ├── favicon.ico
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # App layout component
│   │   └── page.tsx                # Main page component
│   └── components/
│       ├── comments.tsx            # Weather comment component
│       └── footer.tsx              # Footer component
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## Customization

- **Weather Logic:** Edit `src/app/actions/weather.ts` to adjust data fetching
- **Types:** Update `src/app/type/types.ts` for schema changes
- **Main Interface:** Modify `src/app/page.tsx` for layout updates
- **Comments:** Customize `src/components/comments.tsx` for comment handling

---

---

## API Information

This application uses SMHI's Open Data API to fetch weather information.
Refer to SMHI's documentation for details on:

- Endpoints and parameters
- Usage limitations and terms
- Attribution requirements

---

## License

This project was created by Josefine Eriksson.

### Attribution

- **Weather Data:** SMHI (Swedish Meteorological and Hydrological Institute)
- **Development Support:** Alexander, Lexicon Linköping
- **Design & Development:** Kod och Design

### Author

**Josefine Eriksson**
- Website: [kodochdesign.se](https://kodochdesign.se)
- GitHub: [@knixan](https://github.com/knixan)

<p align="center">
  Developed by <a href="https://kodochdesign.se">Kod och Design</a> in Sweden
</p> ```