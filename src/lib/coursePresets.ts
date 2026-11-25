export interface LessonPreset {
  title: string;
  day: string;
  duration: string;
  content: string;
  presentationUrl?: string;
  presentationName?: string;
  assignmentPrompt?: string;
  isFreePreview?: boolean;
}

export interface ModulePreset {
  moduleTitle: string;
  weekNumber: number;
  lessons: LessonPreset[];
}

export interface CoursePreset {
  id: string;
  name: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  cohortSchedule: {
    durationMonths: number;
    daysPerWeek: number;
    timing: string;
    mode: string;
    liveClassLink: string;
  };
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  outcomes: string[];
  curriculum: ModulePreset[];
}

// 1. FULL-STACK WEB DEVELOPMENT BOOTCAMP (12 WEEKS / 3 MONTHS, 5 DAYS/WEEK)
export const fullStackWebDevPreset: CoursePreset = {
  id: "fullstack-web-dev",
  name: "Full-Stack Web Development (12 Weeks · 5 Days/Week)",
  title: "Full-Stack Web Development with Next.js & MERN",
  category: "Development",
  level: "Intermediate",
  duration: "3 Months (60 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 8:00 PM – 9:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-webdev",
  },
  shortDescription: "3-Month live instructor-led bootcamp covering modern JavaScript, React 18, Next.js 14 App Router, Node.js, and MongoDB with 5 live classes per week.",
  fullDescription: "Transform into a job-ready full-stack engineer in 12 intensive weeks. Featuring 5 days a week live interactive sessions, daily lecture notes, presentation decks, graded weekend assignments, and hands-on portfolio projects guided by senior engineering instructors.",
  thumbnail: "/images/course-nextjs.jpg",
  price: 249,
  discountPrice: 149,
  outcomes: [
    "Master JavaScript ES2024 & TypeScript fundamentals to advanced patterns",
    "Build responsive modern web applications with React 18 and Next.js 14 App Router",
    "Design and deploy production RESTful APIs with Node.js, Express & MongoDB",
    "Implement enterprise authentication, JWT tokens, RBAC, and security safeguards",
    "Ship 4 complete production web applications to Vercel and cloud platforms",
    "Earn an accredited, verifiable certificate with unique QR code verification"
  ],
  curriculum: [
    {
      moduleTitle: "Week 1: Modern Web Architecture & HTML5/CSS3 Semantic Mastery",
      weekNumber: 1,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Course Orientation, Web Protocols & Development Environment",
          duration: "1.5h",
          content: "Comprehensive overview of client-server architecture, HTTP/HTTPS request-response lifecycles, DNS resolution, and configuring modern VS Code workflows with ESLint and Prettier.",
          presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
          presentationName: "Week1_Day1_Architecture_Slides.pdf",
          isFreePreview: true,
        },
        {
          day: "Day 2 (Tue)",
          title: "Semantic HTML5, Accessibility (a11y) & Document Structure",
          duration: "1.5h",
          content: "Deep dive into HTML5 semantic elements (main, article, section, nav, aside), ARIA labels, screen reader optimization, and SEO-friendly document hierarchy.",
          presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
          presentationName: "Week1_Day2_HTML5_Semantics.pdf",
          isFreePreview: true,
        },
        {
          day: "Day 3 (Wed)",
          title: "Modern CSS: Flexbox Deep Dive & Responsive Layouts",
          duration: "1.5h",
          content: "Mastering Flexbox properties (flex-direction, justify-content, align-items, flex-wrap, flex-grow/shrink), mobile-first media queries, and responsive design systems.",
          assignmentPrompt: "Build a responsive navigation header and product card grid utilizing pure CSS Flexbox without frameworks.",
        },
        {
          day: "Day 4 (Thu)",
          title: "CSS Grid Architecture & Complex Page Layouts",
          duration: "1.5h",
          content: "Two-dimensional layouts with CSS Grid: grid-template-columns, fr units, minmax(), auto-fit, auto-fill, grid-template-areas, and hybrid Flexbox-Grid architectures.",
          presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
          presentationName: "Week1_Day4_CSS_Grid.pdf",
        },
        {
          day: "Day 5 (Fri)",
          title: "Code Review, Git/GitHub Version Control & Week 1 Assignment",
          duration: "1.5h",
          content: "Live instructor code review of student submissions. Git fundamentals: repository init, commits, branching strategies, resolving merge conflicts, and publishing via GitHub Pages.",
          assignmentPrompt: "Assignment 1: Build and deploy a multi-page personal developer portfolio site using HTML5 semantics and CSS Flexbox/Grid.",
        },
      ],
    },
    {
      moduleTitle: "Week 2: JavaScript Core Fundamentals & DOM Engineering",
      weekNumber: 2,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "JS Runtime, Variables (let/const), Types & Execution Context",
          duration: "1.5h",
          content: "How JavaScript engines work: call stack, memory heap, variable hoisting, temporal dead zone, primitive vs reference types, and scope chain.",
          presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
          presentationName: "Week2_Day1_JavaScript_Engine.pdf",
        },
        {
          day: "Day 2 (Tue)",
          title: "Functions, Arrow Syntax, Closures & Higher-Order Functions",
          duration: "1.5h",
          content: "First-class citizens in JS: closures, lexical scoping, factory functions, array higher-order methods (map, filter, reduce, find, some, every).",
        },
        {
          day: "Day 3 (Wed)",
          title: "The DOM: Selection, Manipulation & Event Bubbling",
          duration: "1.5h",
          content: "Document Object Model manipulation: querySelector, createElement, appendChild, dataset attributes, event listeners, event delegation, and stopPropagation.",
          assignmentPrompt: "Create a dynamic interactive Todo/Kanban application with task creation, deletion, filtering, and status updates.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Asynchronous JavaScript: Promises & Async/Await",
          duration: "1.5h",
          content: "The JavaScript Event Loop, microtasks vs macrotasks, Promise chaining, Promise.all, error handling with try/catch blocks, and modern Fetch API.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Lab: Consuming Third-Party REST APIs & Week 2 Project",
          duration: "1.5h",
          content: "Building an asynchronous weather dashboard utilizing Fetch API, OpenWeather API, async/await, and browser LocalStorage persistence.",
          assignmentPrompt: "Assignment 2: Build an interactive Crypto/Stock tracker web app fetching real-time JSON data from an open API.",
        },
      ],
    },
    {
      moduleTitle: "Week 3: Advanced Modern JavaScript (ES2024) & TypeScript Basics",
      weekNumber: 3,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Destructuring, Spread/Rest, Modules & Modern ES Features",
          duration: "1.5h",
          content: "Modern syntax: object and array destructuring, rest/spread operators, optional chaining (?.), nullish coalescing (??), ES Modules (import/export).",
        },
        {
          day: "Day 2 (Tue)",
          title: "Object-Oriented JavaScript & Prototype Inheritance",
          duration: "1.5h",
          content: "Prototypes, prototype chain, ES6 classes, constructor functions, inheritance with extends/super, getters and setters, and private class fields (#).",
        },
        {
          day: "Day 3 (Wed)",
          title: "Introduction to TypeScript: Type Annotations & Interfaces",
          duration: "1.5h",
          content: "Why TypeScript: primitive types, union types, type aliases, interface declarations, optional properties, readonly fields, and setting up tsconfig.json.",
        },
        {
          day: "Day 4 (Thu)",
          title: "TypeScript Generics, Enums & Strict Type Checking",
          duration: "1.5h",
          content: "Generic functions and interfaces <T>, standard enums, utility types (Partial, Pick, Omit), and configuring strict mode for bulletproof frontends.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Refactoring Session: Converting Plain JS to TypeScript",
          duration: "1.5h",
          content: "Hands-on guided conversion of a legacy JavaScript code project to full TypeScript with zero compiler errors and strict typing.",
          assignmentPrompt: "Refactor your Week 2 Weather Dashboard into TypeScript with custom interfaces and error-handled async requests.",
        },
      ],
    },
    {
      moduleTitle: "Week 4: Tailwind CSS & Modern UI Component Systems",
      weekNumber: 4,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Tailwind CSS Architecture & Utility-First Philosophy",
          duration: "1.5h",
          content: "Setting up Tailwind CSS, understanding the JIT compiler, spacing scale, typography, flex and grid utilities, and color palettes.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Responsive Breakpoints, States (:hover, :focus, :active)",
          duration: "1.5h",
          content: "Mastering modifier prefixes (sm:, md:, lg:, dark:, peer-, group-hover:), creating animated micro-interactions and accessible focus states.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Customizing Tailwind: tailwind.config.ts & Design Tokens",
          duration: "1.5h",
          content: "Extending themes, defining custom color systems, brand fonts, spacing scales, animations, and reusable @apply utility classes.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Component Libraries: Lucide Icons, Headless UI & Radix",
          duration: "1.5h",
          content: "Integrating headless accessible UI primitives: modals, dropdown menus, toast alerts, dialogs, and accessible tabs with smooth transitions.",
        },
        {
          day: "Day 5 (Fri)",
          title: "SaaS Dashboard UI Sprint & Week 4 Assessment",
          duration: "1.5h",
          content: "Live 90-minute design-to-code sprint: building a responsive SaaS analytics dashboard with sidebars, stat widgets, and data tables.",
          assignmentPrompt: "Assignment 4: Code a pixel-perfect, responsive analytics dashboard UI matching modern fintech design standards.",
        },
      ],
    },
    {
      moduleTitle: "Week 5: React 18 Core: Components, Props & Hooks",
      weekNumber: 5,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "React Fundamentals: JSX, Virtual DOM & Component Hierarchy",
          duration: "1.5h",
          content: "Why React: Declarative vs Imperative programming, JSX compilation, Virtual DOM reconciliation, props passing, and component purity.",
        },
        {
          day: "Day 2 (Tue)",
          title: "State Management with useState & Controlled Forms",
          duration: "1.5h",
          content: "Managing component state, batch updates in React 18, immutable state updates with arrays and objects, and controlled input patterns.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Side Effects & Lifecycles with useEffect",
          duration: "1.5h",
          content: "The component lifecycle, dependency arrays, cleanup functions, fetching data inside useEffect, and avoiding infinite re-render loops.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Custom Hooks & Lifting State Up",
          duration: "1.5h",
          content: "Extracting reusable logic into custom hooks (useLocalStorage, useDebounce, useWindowSize), unidirectional data flow, and props drilling solutions.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Lab: Interactive E-Commerce Product Catalog with Cart",
          duration: "1.5h",
          content: "Building an interactive shopping cart with live price calculations, quantity modifiers, and toast notifications.",
          assignmentPrompt: "Assignment 5: Build a multi-filter product store in React with categories, search, price slider, and persistent cart.",
        },
      ],
    },
    {
      moduleTitle: "Week 6: Advanced React: Context API, useReducer & Performance",
      weekNumber: 6,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Global State Management with React Context API",
          duration: "1.5h",
          content: "Creating contexts, createContext, useContext, context providers, preventing unnecessary re-renders, and modular state architecture.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Complex State with useReducer & Action Dispatching",
          duration: "1.5h",
          content: "Redux-pattern thinking with useReducer: state reducers, typed actions, dispatching, combining Context and useReducer for scalable apps.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Performance Optimization: useMemo, useCallback & memo",
          duration: "1.5h",
          content: "Profiling React applications, React DevTools Profiler, referential equality, when to use useMemo and useCallback, and code splitting with React.lazy.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Direct DOM Access with useRef & Imperative Handles",
          duration: "1.5h",
          content: "useRef for DOM measurements, managing timers/intervals without re-rendering, forwardRef, and useImperativeHandle.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Mid-Term Project Review & Comprehensive React Quiz",
          duration: "1.5h",
          content: "Instructor live review of students' React implementations, refactoring antipatterns, and administering Mid-Term React Assessment.",
          assignmentPrompt: "Mid-Term Project: Build a collaborative workspace / task board with drag-and-drop state management.",
        },
      ],
    },
    {
      moduleTitle: "Week 7: Next.js 14 App Router & Server Components",
      weekNumber: 7,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Next.js 14 Architecture: App Router vs Pages Router",
          duration: "1.5h",
          content: "File-system routing in Next.js 14, folder conventions (page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx), and SEO metadata generation.",
        },
        {
          day: "Day 2 (Tue)",
          title: "React Server Components (RSC) vs Client Components",
          duration: "1.5h",
          content: "Mental model for Server Components, zero-bundle-size benefits, when to use 'use client', passing props across server-client boundaries.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Data Fetching, Caching & Revalidation (ISR)",
          duration: "1.5h",
          content: "Server-side data fetching with fetch(), automatic request deduplication, cache tags, revalidatePath, revalidateTag, and Incremental Static Regeneration.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Next.js Server Actions & Form Mutations",
          duration: "1.5h",
          content: "Direct server mutations with Server Actions ('use server'), progressive enhancement, optimistic UI updates with useOptimistic, and pending states.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Dynamic Routing, Parallel Routes & Intercepting Modals",
          duration: "1.5h",
          content: "Dynamic segments [slug], catch-all routes [...slug], slots (@modal), parallel routes, and soft navigation modals for image galleries.",
          assignmentPrompt: "Assignment 7: Build a high-performance content publishing platform using Next.js 14 App Router and Server Components.",
        },
      ],
    },
    {
      moduleTitle: "Week 8: Backend Engineering with Node.js & Express",
      weekNumber: 8,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Node.js Runtime, V8 Engine & Non-Blocking I/O",
          duration: "1.5h",
          content: "Node.js architecture, libuv event loop, streams and buffers, process global, and building a raw HTTP server without frameworks.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Express.js Architecture, Routing & Middleware Chain",
          duration: "1.5h",
          content: "Building REST servers with Express, app.use(), request lifecycle, writing custom logging, authentication, and validation middleware.",
        },
        {
          day: "Day 3 (Wed)",
          title: "RESTful API Standards & Request Body Parsing",
          duration: "1.5h",
          content: "REST principles (GET, POST, PUT, PATCH, DELETE), status codes, query parameters, URL params, JSON payload handling, and CORS configuration.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Error Handling Architecture & Input Validation with Zod",
          duration: "1.5h",
          content: "Centralized error handling middleware, custom APIError classes, schema validation with Zod, and returning structured JSON errors.",
        },
        {
          day: "Day 5 (Fri)",
          title: "API Testing with Postman & Automated Integration Tests",
          duration: "1.5h",
          content: "Creating Postman collections, environment variables, writing pre-request scripts, automated test assertions, and exporting API specs.",
          assignmentPrompt: "Assignment 8: Design and implement a full REST API for a course management system with validation and error handling.",
        },
      ],
    },
    {
      moduleTitle: "Week 9: Database Architecture: MongoDB & Mongoose Modeling",
      weekNumber: 9,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "NoSQL Database Concepts & MongoDB Atlas Setup",
          duration: "1.5h",
          content: "Relational vs Document databases, BSON documents, collections, installing MongoDB locally and connecting to cloud MongoDB Atlas clusters.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Mongoose Schema Design, Data Types & Validation",
          duration: "1.5h",
          content: "Defining schemas with Mongoose, field types, required constraints, default values, timestamps, custom validators, and pre/post hooks.",
        },
        {
          day: "Day 3 (Wed)",
          title: "CRUD Operations, Query Filters & Population",
          duration: "1.5h",
          content: "Querying MongoDB: find, findOne, updateOne, deleteOne, comparison operators ($gt, $in, $regex), pagination with skip/limit, and schema .populate().",
        },
        {
          day: "Day 4 (Thu)",
          title: "MongoDB Aggregation Pipeline & Indexing",
          duration: "1.5h",
          content: "Complex data transformations with $match, $group, $sort, $project, $unwind, compound indexes, and database query optimization.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Database Seeding & Production Backup Strategies",
          duration: "1.5h",
          content: "Writing automated seed scripts, idempotent upserts, handling connection pools, and database dump/restore commands.",
          assignmentPrompt: "Assignment 9: Design a normalized MongoDB database schema for an online learning management system with aggregations.",
        },
      ],
    },
    {
      moduleTitle: "Week 10: Authentication, Authorization & Security Best Practices",
      weekNumber: 10,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Authentication Principles: Sessions vs JWT Tokens",
          duration: "1.5h",
          content: "Stateful sessions vs stateless JSON Web Tokens (JWT), token anatomy (header, payload, signature), and secure transmission.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Password Hashing with Bcrypt & Secure Registration Flow",
          duration: "1.5h",
          content: "Salting and hashing passwords with bcryptjs, preventing rainbow table attacks, user registration endpoint, and input sanitization.",
        },
        {
          day: "Day 3 (Wed)",
          title: "HttpOnly Cookies, Refresh Tokens & NextAuth / Auth.js",
          duration: "1.5h",
          content: "XSS and CSRF prevention, storing tokens in secure HttpOnly cookies, implementing silent token refresh, and configuring NextAuth / Auth.js.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Role-Based Access Control (RBAC) & Protected Routes",
          duration: "1.5h",
          content: "Enforcing admin, student, and instructor roles, Next.js Edge Middleware route guards, and protecting backend API endpoints.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Web Security Audit: OWASP Top 10 Safeguards",
          duration: "1.5h",
          content: "Auditing application security against SQL/NoSQL injection, rate limiting with Redis/Upstash, security headers with Helmet, and CORS locks.",
          assignmentPrompt: "Assignment 10: Implement a complete secure authentication system with JWT HttpOnly cookies and role-based permissions.",
        },
      ],
    },
    {
      moduleTitle: "Week 11: Real-World Capstone Project: End-to-End LMS Platform",
      weekNumber: 11,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Capstone Sprint Kickoff: Requirements & System Architecture",
          duration: "1.5h",
          content: "Architecting the full LMS system: course browsing, enrollment workflows, live class broadcasts, video players, and homework submissions.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Building the Student Dashboard & Video Streaming Player",
          duration: "1.5h",
          content: "Implementing responsive course players, lesson navigation, lecture notes tabs, and progress persistence.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Homework File Upload Submissions & Multi-Format Parsing",
          duration: "1.5h",
          content: "Building file uploaders supporting Word docs (.docx), PDFs, images, and ZIP files with file size checks and preview cards.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Admin Grading Suite & Student Feedback System",
          duration: "1.5h",
          content: "Admin assignment inspection panel, downloading student submissions, assigning scores, and giving rich instructor feedback notes.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Broadcast Announcement System & Verification Certificates",
          duration: "1.5h",
          content: "Admin one-click live broadcast links, student inbox tab, PDF certificate generation, and QR code verification endpoints.",
          assignmentPrompt: "Final Capstone Milestone: Complete all student and admin modules with zero errors and responsive layouts.",
        },
      ],
    },
    {
      moduleTitle: "Week 12: Deployment, CI/CD, Portfolio Showcase & Graduation",
      weekNumber: 12,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Production Optimization, Bundling & Environment Configuration",
          duration: "1.5h",
          content: "Production build audits, analyzing bundle sizes with @next/bundle-analyzer, optimizing images and fonts, and managing production secrets.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Cloud Deployment to Vercel & MongoDB Atlas Scaling",
          duration: "1.5h",
          content: "Deploying Next.js applications to Vercel, custom domain mapping, SSL certificate configuration, and configuring MongoDB connection pooling.",
        },
        {
          day: "Day 3 (Wed)",
          title: "CI/CD Pipelines with GitHub Actions & Automated Testing",
          duration: "1.5h",
          content: "Setting up GitHub Actions workflows: linting, TypeScript type-checking, running automated test suites, and staging branch deployments.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Resume Engineering, LinkedIn Optimization & Tech Interviews",
          duration: "1.5h",
          content: "How to present full-stack bootcamp projects to hiring managers, structuring technical resumes, GitHub portfolio polish, and interview prep.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Capstone Demo Day, Certificate Award Ceremony & Graduation",
          duration: "2h",
          content: "Live student project presentations to instructors and peers. Issuing verified digital graduation certificates and alumni community onboarding.",
          assignmentPrompt: "Submit your live deployed Capstone URL and GitHub repository for final instructor graduation sign-off.",
        },
      ],
    },
  ],
};

// 2. UI/UX DESIGN & PRODUCT STRATEGY MASTERCLASS (10 WEEKS / 3 MONTHS, 5 DAYS/WEEK)
export const uiuxDesignPreset: CoursePreset = {
  id: "uiux-design",
  name: "UI/UX Design Masterclass (10 Weeks · 5 Days/Week)",
  title: "UI/UX Design Foundations & Product Strategy",
  category: "Design",
  level: "Beginner",
  duration: "3 Months (50 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 6:00 PM – 7:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-design",
  },
  shortDescription: "A comprehensive 10-week live bootcamp covering UX research, user journeys, Figma component systems, interactive prototyping, and client presentations.",
  fullDescription: "Master digital product design from initial empathy interviews to high-fidelity clickable Figma prototypes. Featuring daily live interactive workshops, downloadable design kit presentations, and portfolio case studies.",
  thumbnail: "/images/course-design.jpg",
  price: 199,
  discountPrice: 119,
  outcomes: [
    "Conduct user research, empathetic interviews, and build accurate user personas",
    "Design responsive web and mobile interfaces following Apple HIG & Google Material",
    "Master Figma: auto layout, variants, variables, component libraries, and interactive prototyping",
    "Build a production design system with design tokens, typography scales, and atomic components",
    "Complete 3 end-to-end portfolio case studies ready for global design agencies",
    "Receive a verified IT SkillCore completion certificate with public verification link"
  ],
  curriculum: [
    {
      moduleTitle: "Week 1: Foundations of User Experience (UX) & Design Thinking",
      weekNumber: 1,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "What is UX? The 5 Planes of User Experience",
          duration: "1.5h",
          content: "Strategy, Scope, Structure, Skeleton, and Surface planes. Understanding user empathy, business goals vs user needs, and role expectations.",
          presentationUrl: "/uploads/UX_Research_Audit_CaseStudy.pdf",
          presentationName: "Week1_Day1_UX_Planes.pdf",
          isFreePreview: true,
        },
        {
          day: "Day 2 (Tue)",
          title: "User Research Methodologies: Qualitative vs Quantitative",
          duration: "1.5h",
          content: "Planning research sprints, writing interview scripts, conducting 1-on-1 interviews, surveys, and gathering qualitative insights.",
          presentationUrl: "/uploads/UX_Research_Audit_CaseStudy.pdf",
          presentationName: "Week1_Day2_User_Research.pdf",
        },
        {
          day: "Day 3 (Wed)",
          title: "Synthesizing Research: Empathy Maps & User Personas",
          duration: "1.5h",
          content: "Distilling raw interview data into affinity diagrams, empathy maps (Says, Thinks, Does, Feels), and data-driven user personas.",
          assignmentPrompt: "Draft 2 detailed user personas for a telehealth mobile app including demographics, goals, pain points, and quote.",
        },
        {
          day: "Day 4 (Thu)",
          title: "User Journey Mapping & Problem Statements (How Might We)",
          duration: "1.5h",
          content: "Mapping emotional highs and lows across user touchpoints, identifying friction points, and framing actionable 'How Might We' problem statements.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Case Study Review & Week 1 Research Brief",
          duration: "1.5h",
          content: "Instructor teardown of real-world app case studies (Airbnb, Uber, Duolingo) and assigning Week 1 project submission.",
          assignmentPrompt: "Assignment 1: Complete a comprehensive User Research & Persona Case Study document (PDF or Word format).",
        },
      ],
    },
    {
      moduleTitle: "Week 2: Information Architecture & Low-Fidelity Wireframing",
      weekNumber: 2,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Information Architecture & Card Sorting Exercises",
          duration: "1.5h",
          content: "Taxonomy, navigation hierarchies, open and closed card sorting techniques, and structural organization of digital products.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Creating User Flows & Site Maps",
          duration: "1.5h",
          content: "Documenting happy paths, edge cases, decision diamonds, and complete product site maps using FigJam and Whimsical.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Paper Prototyping & Rapid Low-Fidelity Sketching",
          duration: "1.5h",
          content: "Crazy Eights ideation, sketching 8 solutions in 8 minutes, wireframing on paper, and rapid internal team feedback loops.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Digital Wireframing in Figma: Grids, Layouts & Hierarchy",
          duration: "1.5h",
          content: "Translating paper sketches into clean digital wireframes in Figma using 8pt grid systems, 12-column grids, and grayscale blocks.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Wireframe Usability Testing & Week 2 Assignment",
          duration: "1.5h",
          content: "Testing wireframe prototypes with test users, identifying layout confusion, and submitting wireframe prototypes.",
          assignmentPrompt: "Assignment 2: Submit a 6-screen wireframe flow in Figma illustrating a smooth checkout user journey.",
        },
      ],
    },
    {
      moduleTitle: "Week 3: Visual Design (UI) Principles: Color, Typography & Layout",
      weekNumber: 3,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Color Theory & Accessible Contrast Ratios (WCAG AA/AAA)",
          duration: "1.5h",
          content: "Color psychology, 60-30-10 rule, primary/secondary/neutral palettes, semantic status colors, and WCAG accessibility standards.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Typography Mastery: Font Pairing & Modular Type Scales",
          duration: "1.5h",
          content: "Serif vs Sans-serif, kerning, leading, tracking, setting up fluid modular type scales (Major Third / Perfect Fourth), and readable line lengths.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Visual Hierarchy: Spacing, Elevation & Contrast",
          duration: "1.5h",
          content: "Guiding the eye through contrast, scale, depth, subtle drop shadows, blur effects, and consistent 8pt spacing rhythm.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Iconography, Imagery & Micro-Interactions",
          duration: "1.5h",
          content: "Selecting icon sets (Lucide, Heroicons), icon grid consistency, pairing high quality photography, and designing intuitive affordances.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live UI Critique & High-Fidelity Screen Assignment",
          duration: "1.5h",
          content: "Instructor critique of typography and color balance in student submissions, followed by Week 3 assignment instructions.",
          assignmentPrompt: "Assignment 3: Design 3 high-fidelity mobile landing screens applying accessible color contrast and typography scale.",
        },
      ],
    },
    {
      moduleTitle: "Week 4: Figma Advanced Features: Auto Layout, Variants & Variables",
      weekNumber: 4,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Mastering Figma Auto Layout 5.0",
          duration: "1.5h",
          content: "Auto layout directions, padding, gap, min/max dimensions, fill container vs hug contents, and nested auto layout frames.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Component Properties & Variants",
          duration: "1.5h",
          content: "Creating reusable components, boolean properties, instance swap properties, text properties, and multi-state variants (hover, active, disabled).",
        },
        {
          day: "Day 3 (Wed)",
          title: "Figma Variables: Colors, Numbers, Strings & Modes",
          duration: "1.5h",
          content: "Deep dive into Figma Variables: setting up color tokens, number tokens for spacing/radii, and building 1-click Dark Mode switches.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Interactive Prototyping: Smart Animate & Micro-Transitions",
          duration: "1.5h",
          content: "Building interactive prototypes with Smart Animate: drag gestures, spring animations, overlay modals, and interactive toggle switches.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Interactive Prototype Workshop & Week 4 Evaluation",
          duration: "1.5h",
          content: "Live workshop building a clickable mobile onboarding flow with micro-animations and sound effects.",
          assignmentPrompt: "Assignment 4: Submit a fully interactive Figma prototype of a mobile banking app with Smart Animate transitions.",
        },
      ],
    },
    {
      moduleTitle: "Week 5: Building Production-Ready Design Systems",
      weekNumber: 5,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Design Systems Architecture: Atomic Design Methodology",
          duration: "1.5h",
          content: "Atoms, Molecules, Organisms, Templates, and Pages. How tech companies (Shopify Polaris, Material Design, Carbon) structure design systems.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Foundations Library: Colors, Typography, Spacing & Shadows",
          duration: "1.5h",
          content: "Creating the foundational shared Figma library with semantic tokens, typography styles, grid styles, and elevation levels.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Core Component Kit: Buttons, Inputs, Cards & Navigation",
          duration: "1.5h",
          content: "Building accessible button sets, input fields with error states, badge pills, dropdowns, and sticky navigation headers.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Complex Components: Modals, Data Tables & Date Pickers",
          duration: "1.5h",
          content: "Designing complex organisms: paginated data tables, sorting filters, calendar date range pickers, and responsive drawer sheets.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Publishing & Managing Team Libraries in Figma",
          duration: "1.5h",
          content: "Publishing updates, managing version histories, component deprecation warnings, and design documentation.",
          assignmentPrompt: "Assignment 5: Build and publish a cohesive 15-component Figma design system with full variant states and tokens.",
        },
      ],
    },
    {
      moduleTitle: "Week 6: Mobile App Design (iOS Human Interface & Material You)",
      weekNumber: 6,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "iOS Guidelines: Navigation Bars, Tab Bars & Home Indicators",
          duration: "1.5h",
          content: "Apple Human Interface Guidelines: safe areas, Dynamic Island design, system typography (SF Pro), and native gesture patterns.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Android & Material 3 Guidelines: Top App Bars & FABs",
          duration: "1.5h",
          content: "Google Material You principles: dynamic color theming, Floating Action Buttons (FAB), bottom navigation, and Material typography (Roboto).",
        },
        {
          day: "Day 3 (Wed)",
          title: "Designing for Multiple Screen Densities & Orientations",
          duration: "1.5h",
          content: "Understanding @1x, @2x, @3x export resolutions, responsive adaptation for tablets and foldables, and accessibility font scaling.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Mobile Micro-Interactions: Haptics & Pull-to-Refresh",
          duration: "1.5h",
          content: "Designing delight: pull-to-refresh animations, skeleton loaders, success state checkmarks, and haptic feedback triggers.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Mobile App Teardown & Mid-Term Milestone Project",
          duration: "1.5h",
          content: "Live teardown of top iOS apps and launching the Mid-Term Mobile App Case Study assignment.",
          assignmentPrompt: "Mid-Term Project: Design an end-to-end mobile food delivery app (10+ screens) following iOS Human Interface Guidelines.",
        },
      ],
    },
    {
      moduleTitle: "Week 7: Web & SaaS Dashboard Product Design",
      weekNumber: 7,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "SaaS Product Patterns: Information Hierarchy & Metrics",
          duration: "1.5h",
          content: "Designing executive dashboards, key metric summary cards (MRR, churn, conversion), time-range selectors, and comparison indicators.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Data Visualization: Charts, Graphs & Data Tables",
          duration: "1.5h",
          content: "Choosing the right charts (line, bar, donut, sparkline), chart color contrast, hover tooltips, and designing scalable data tables.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Multi-Step Onboarding Wizards & Empty States",
          duration: "1.5h",
          content: "Designing zero-data empty states with actionable illustrations, progress step bars, and frictionless onboarding flows.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Responsive Web Layouts: Mobile to 4K Ultra-Wide",
          duration: "1.5h",
          content: "Adapting complex multi-pane desktop layouts down to tablet and mobile drawer views without losing critical functionality.",
        },
        {
          day: "Day 5 (Fri)",
          title: "SaaS Dashboard Critique & Assignment",
          duration: "1.5h",
          content: "Live instructor critique of student dashboard layouts and assigning Week 7 deliverables.",
          assignmentPrompt: "Assignment 7: Design a comprehensive analytics dashboard for an LMS or B2B SaaS platform in Figma.",
        },
      ],
    },
    {
      moduleTitle: "Week 8: Usability Testing, Heuristic Evaluation & Metrics",
      weekNumber: 8,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Jakob Nielsen’s 10 Usability Heuristics",
          duration: "1.5h",
          content: "Visibility of system status, match between system and real world, user control and freedom, consistency and standards, error prevention.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Conducting Moderated & Unmoderated Usability Tests",
          duration: "1.5h",
          content: "Writing usability testing task protocols, recruiting test participants, running sessions via Maze / Lookback, and recording pain points.",
        },
        {
          day: "Day 3 (Wed)",
          title: "UX Metrics: SUS Score, Task Success Rate & Time on Task",
          duration: "1.5h",
          content: "Measuring usability quantitatively: System Usability Scale (SUS), Single Ease Question (SEQ), Net Promoter Score (NPS), and completion rates.",
        },
        {
          day: "Day 4 (Thu)",
          title: "A/B Testing Foundations & Iterative Design Sprints",
          duration: "1.5h",
          content: "Formulating testable design hypotheses, primary vs secondary metrics, statistical significance basics, and sprint retrospectives.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Usability Audit Report Workshop & Submission",
          duration: "1.5h",
          content: "Compiling usability findings into an executive report with video clips, severity ratings, and prioritized design recommendations.",
          assignmentPrompt: "Assignment 8: Conduct a heuristic evaluation on an existing web application and submit a prioritized audit report.",
        },
      ],
    },
    {
      moduleTitle: "Week 9: Developer Handoff, Design Tokens & Code Connect",
      weekNumber: 9,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Figma Dev Mode: Inspecting CSS, iOS & Android Specs",
          duration: "1.5h",
          content: "Using Figma Dev Mode, inspecting padding, box-shadows, typography tokens, asset export (SVG, WebP), and redlining dimensions.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Writing Clear Design Annotations & Component Specs",
          duration: "1.5h",
          content: "Documenting edge cases, responsive behaviors, error messaging, character limits, and loading states for frontend engineers.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Exporting Assets & Optimizing SVGs for Web Performance",
          duration: "1.5h",
          content: "Exporting clean vector SVGs, optimizing path data with SVGOMG, managing sprite sheets, and high-DPI asset exports.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Bridging the Gap: How Designers & Engineers Collaborate",
          duration: "1.5h",
          content: "Design QA reviews, verifying staging builds against Figma specs, communication via Jira and Slack, and resolving technical constraints.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Mock Developer Handoff Meeting & Week 9 Assessment",
          duration: "1.5h",
          content: "Roleplaying a real-world developer handoff meeting, answering engineer questions, and locking design files.",
          assignmentPrompt: "Assignment 9: Prepare a developer-ready Figma file with full annotations, exportable assets, and interaction notes.",
        },
      ],
    },
    {
      moduleTitle: "Week 10: Capstone Case Study, Portfolio Website & Career Launch",
      weekNumber: 10,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "How to Structure a Killer UX Case Study",
          duration: "1.5h",
          content: "Anatomy of an award-winning case study: Problem statement, research data, wireframes, iterations, final prototype, and measurable business impact.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Creating High-Impact Mockups & Presentation Slides",
          duration: "1.5h",
          content: "Using clay 3D device mockups, perspective presentations, animated GIF demos, and polishing case study storytelling.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Building Your Portfolio Website (Framer, Webflow, Behance)",
          duration: "1.5h",
          content: "Selecting portfolio platforms, writing engaging about pages, showcasing client testimonials, and personal branding for designers.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Design Interview Prep: Whiteboard Challenges & App Critiques",
          duration: "1.5h",
          content: "Mastering whiteboard design challenges, framework for app critiques in live interviews, and negotiating senior design salaries.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Portfolio Showcase, Graduation & Certificate Awarding",
          duration: "2h",
          content: "Students present their capstone case study to guest design leads. Awarding accredited IT SkillCore graduation certificates.",
          assignmentPrompt: "Submit your final published Behance/Framer portfolio case study for instructor graduation sign-off.",
        },
      ],
    },
  ],
};

// 3. PYTHON DATA SCIENCE & MACHINE LEARNING BOOTCAMP (10 WEEKS / 3 MONTHS, 5 DAYS/WEEK)
export const pythonDataSciencePreset: CoursePreset = {
  id: "python-data-science",
  name: "Python Data Science & ML (10 Weeks · 5 Days/Week)",
  title: "Data Analysis & Machine Learning with Python",
  category: "Data",
  level: "Beginner",
  duration: "3 Months (50 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 7:00 PM – 8:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-data",
  },
  shortDescription: "10-week live cohort covering Python programming, Pandas, NumPy, statistical modeling, data visualization, and applied Scikit-Learn machine learning.",
  fullDescription: "From writing your first Python script to training predictive machine learning models. Learn live 5 days a week with practical Jupyter notebooks, real-world datasets, presentation slides, and portfolio projects.",
  thumbnail: "/images/course-data.jpg",
  price: 219,
  discountPrice: 0,
  outcomes: [
    "Write idiomatic Python 3 code with OOP principles and scientific libraries",
    "Clean, transform, and analyze multi-gigabyte datasets with Pandas & NumPy",
    "Create publication-ready data visualizations with Matplotlib & Seaborn",
    "Train and evaluate regression, classification, and clustering machine learning models",
    "Deploy data science web apps and predictive APIs with Streamlit and FastAPI",
    "Earn a verifiable digital certificate recognized across tech companies"
  ],
  curriculum: [
    {
      moduleTitle: "Week 1: Python Fundamentals & Scientific Computing Setup",
      weekNumber: 1,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Introduction to Python 3 & Anaconda/Jupyter Notebooks",
          duration: "1.5h",
          content: "Setting up Python 3.12, Anaconda environments, navigating Jupyter Lab / Google Colab, executing cells, and markdown documentation.",
          isFreePreview: true,
        },
        {
          day: "Day 2 (Tue)",
          title: "Data Types, Variables, String Formatting & Conditionals",
          duration: "1.5h",
          content: "Integers, floats, booleans, string manipulation, f-strings, if/elif/else statements, and logical comparison operators.",
          isFreePreview: true,
        },
        {
          day: "Day 3 (Wed)",
          title: "Python Data Structures: Lists, Tuples, Dictionaries & Sets",
          duration: "1.5h",
          content: "Indexing, slicing, list comprehensions, dictionary key-value lookups, set operations (union, intersection), and tuple immutability.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Loops, Functions, Lambda Expressions & Exception Handling",
          duration: "1.5h",
          content: "For and while loops, defining functions with def, default arguments, *args/**kwargs, anonymous lambda functions, and try/except blocks.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Lab: Algorithmic Problem Solving & Week 1 Assignment",
          duration: "1.5h",
          content: "Interactive live problem solving sprint covering real-world data filtering algorithms and Python assignment instructions.",
          assignmentPrompt: "Assignment 1: Write a Python program that processes and filters transaction logs, outputting key financial summaries.",
        },
      ],
    },
    {
      moduleTitle: "Week 2: Numerical Computing with NumPy",
      weekNumber: 2,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "NumPy ndarray Architecture & Vectorized Operations",
          duration: "1.5h",
          content: "Why NumPy: C-speed vectorization, memory locality, creating arrays from lists, arange, linspace, zeros, and ones.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Array Indexing, Slicing, Boolean Masking & Reshaping",
          duration: "1.5h",
          content: "Multi-dimensional slicing (2D/3D), boolean indexing, conditional replacement with np.where(), reshape(), and flatten().",
        },
        {
          day: "Day 3 (Wed)",
          title: "Mathematical Operations, Broadcasting & Aggregations",
          duration: "1.5h",
          content: "Element-wise arithmetic, matrix multiplication with @, NumPy broadcasting rules, and aggregations (sum, mean, std, min, max, argmax).",
        },
        {
          day: "Day 4 (Thu)",
          title: "Linear Algebra & Random Number Generation with NumPy",
          duration: "1.5h",
          content: "np.linalg operations (dot product, inverse, eigenvalues), random distributions (normal, uniform), and setting random seeds.",
        },
        {
          day: "Day 5 (Fri)",
          title: "NumPy Performance Benchmark Lab & Assignment 2",
          duration: "1.5h",
          content: "Benchmarking pure Python vs vectorized NumPy on 1,000,000 data points, followed by Week 2 submission brief.",
          assignmentPrompt: "Assignment 2: Implement image manipulation filters and matrix transformations purely using NumPy arrays.",
        },
      ],
    },
    {
      moduleTitle: "Week 3: Data Wrangling & Manipulation with Pandas",
      weekNumber: 3,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Pandas Series & DataFrames: Reading CSV, Excel & JSON",
          duration: "1.5h",
          content: "Introduction to Pandas: reading datasets with pd.read_csv, head, tail, info, describe, inspecting data types, and index management.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Data Selection, Filtering & Querying with .loc & .iloc",
          duration: "1.5h",
          content: "Selecting rows and columns with label-based (.loc) and integer-based (.iloc) indexing, multi-condition filtering, and .query() syntax.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Handling Missing Data, Duplicates & Data Cleaning",
          duration: "1.5h",
          content: "Identifying null values (isna, sum), imputation strategies (fillna with mean/median/mode), dropna, and removing duplicate records.",
        },
        {
          day: "Day 4 (Thu)",
          title: "String Operations & DateTime Manipulation in Pandas",
          duration: "1.5h",
          content: "Using .str accessors (contains, replace, extract), pd.to_datetime, extracting year/month/day/dayofweek, and time series resample().",
        },
        {
          day: "Day 5 (Fri)",
          title: "Dirty Data Cleaning Sprint & Week 3 Assignment",
          duration: "1.5h",
          content: "Hands-on live sprint cleaning a messy real-world real estate dataset containing bad formats, missing entries, and currency symbols.",
          assignmentPrompt: "Assignment 3: Clean and normalize a messy e-commerce dataset of 50,000 orders using Pandas.",
        },
      ],
    },
    {
      moduleTitle: "Week 4: Advanced Pandas: GroupBy, Merging & Pivot Tables",
      weekNumber: 4,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "The Split-Apply-Combine Strategy with .groupby()",
          duration: "1.5h",
          content: "Aggregating groups, applying custom aggregation functions with .agg(), transforming columns with .transform(), and group filtering.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Merging, Joining & Concatenating Multi-Table Datasets",
          duration: "1.5h",
          content: "Relational operations in Pandas: pd.merge (inner, left, right, outer joins), merge keys, and pd.concat along axis 0 and 1.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Reshaping Data: Pivot Tables, Melt & Stack/Unstack",
          duration: "1.5h",
          content: "Creating executive summary pivot tables with pd.pivot_table, unpivoting wide-to-long formats with pd.melt(), and multi-index manipulation.",
        },
        {
          day: "Day 4 (Thu)",
          title: "High-Performance Pandas: Vectorized Apply & Memory Tuning",
          duration: "1.5h",
          content: "Optimizing memory usage using category dtypes, avoiding slow iterrows(), and benchmarking vectorized column transformations.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Business Analytics Case Study & Week 4 Assessment",
          duration: "1.5h",
          content: "Instructor live demonstration answering real CEO business questions using multi-table joins and aggregation queries.",
          assignmentPrompt: "Assignment 4: Perform a deep churn and revenue cohort analysis on a multi-table SaaS subscription database.",
        },
      ],
    },
    {
      moduleTitle: "Week 5: Exploratory Data Analysis (EDA) & Visualization",
      weekNumber: 5,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Data Visualization Foundations with Matplotlib",
          duration: "1.5h",
          content: "Figure and axes anatomy, line plots, scatter plots, bar charts, histograms, customizing titles, labels, legends, and DPI export.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Statistical Visualizations with Seaborn",
          duration: "1.5h",
          content: "Distribution plots (histplot, kdeplot), box plots, violin plots, pairplots for multi-variable exploration, and heatmap correlation matrices.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Interactive Dashboards with Plotly & Cufflinks",
          duration: "1.5h",
          content: "Building interactive zoomable charts, hover tooltips, animated time series, and geospatial choropleth maps using Plotly Express.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Statistical Foundations: Distributions, P-Values & Correlation",
          duration: "1.5h",
          content: "Normal distribution, central limit theorem, skewness, Pearson vs Spearman correlation, hypothesis testing, and interpreting p-values.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Mid-Term EDA Portfolio Presentation & Critique",
          duration: "1.5h",
          content: "Students submit and present exploratory data reports answering critical hypothesis questions with compelling visuals.",
          assignmentPrompt: "Mid-Term Project: Deliver a complete EDA report on Global Tech Salaries with statistical insights and visualizations.",
        },
      ],
    },
    {
      moduleTitle: "Week 6: Applied Machine Learning: Regression Models",
      weekNumber: 6,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Machine Learning Concepts: Supervised vs Unsupervised",
          duration: "1.5h",
          content: "Feature matrix (X) vs target vector (y), train/test split, data leakage pitfalls, Scikit-Learn API philosophy (fit, transform, predict).",
        },
        {
          day: "Day 2 (Tue)",
          title: "Linear Regression: Math, Assumptions & Implementation",
          duration: "1.5h",
          content: "Ordinary Least Squares (OLS), cost function, gradient descent intuition, evaluating models with MAE, MSE, RMSE, and R-squared.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Feature Engineering: Scaling, One-Hot Encoding & Pipelines",
          duration: "1.5h",
          content: "StandardScaler, MinMaxScaler, OneHotEncoder, ColumnTransformer, and packaging preprocessing with make_pipeline.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Regularization Techniques: Ridge (L2) & Lasso (L1)",
          duration: "1.5h",
          content: "Overfitting vs Underfitting, bias-variance tradeoff, penalizing large weights, feature selection with Lasso, and tuning alpha.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Housing Price Prediction Sprint & Week 6 Evaluation",
          duration: "1.5h",
          content: "Building an end-to-end regression pipeline predicting home sale values, validating cross-validation folds.",
          assignmentPrompt: "Assignment 6: Train and optimize a regression pipeline predicting used car prices with R2 > 0.85.",
        },
      ],
    },
    {
      moduleTitle: "Week 7: Classification Models & Evaluation Metrics",
      weekNumber: 7,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Logistic Regression & The Sigmoid Function",
          duration: "1.5h",
          content: "Binary classification, log-odds, sigmoid curve, threshold setting, decision boundaries, and multi-class classification (One-vs-Rest).",
        },
        {
          day: "Day 2 (Tue)",
          title: "Classification Metrics: Confusion Matrix, Precision, Recall & F1",
          duration: "1.5h",
          content: "Why accuracy is misleading on imbalanced datasets: True Positives, False Positives, Precision-Recall tradeoff, ROC-AUC score.",
        },
        {
          day: "Day 3 (Wed)",
          title: "K-Nearest Neighbors (KNN) & Support Vector Machines (SVM)",
          duration: "1.5h",
          content: "Distance metrics (Euclidean, Manhattan), choosing optimal K, SVM margins, and non-linear kernel tricks (RBF, Polynomial).",
        },
        {
          day: "Day 4 (Thu)",
          title: "Handling Imbalanced Datasets: SMOTE & Class Weights",
          duration: "1.5h",
          content: "Addressing rare fraud or medical events: random oversampling, undersampling, synthetic generation with SMOTE, and class_weight='balanced'.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Customer Churn Prediction Lab & Week 7 Assignment",
          duration: "1.5h",
          content: "Live lab predicting telecom customer churn, analyzing feature importance, and generating classification reports.",
          assignmentPrompt: "Assignment 7: Build a credit card fraud detection classifier optimizing for Recall and ROC-AUC score.",
        },
      ],
    },
    {
      moduleTitle: "Week 8: Tree-Based Models & Ensemble Learning (Random Forest & XGBoost)",
      weekNumber: 8,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Decision Trees: Gini Impurity, Entropy & Pruning",
          duration: "1.5h",
          content: "How trees split: Information Gain, Gini index, max_depth, min_samples_split, visualizing trees with export_graphviz, and preventing tree overfitting.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Random Forests & Bagging (Bootstrap Aggregation)",
          duration: "1.5h",
          content: "Wisdom of the crowd in ML: bootstrap sampling, random feature subsets, Out-of-Bag (OOB) error estimation, and feature importances.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Boosting Algorithms: AdaBoost & Gradient Boosting",
          duration: "1.5h",
          content: "Sequential learning from errors: assigning sample weights in AdaBoost, gradient boosting math, learning rate, and residual minimization.",
        },
        {
          day: "Day 4 (Thu)",
          title: "State-of-the-Art Gradient Boosters: XGBoost & LightGBM",
          duration: "1.5h",
          content: "Installing and tuning XGBoost and LightGBM: early stopping, subsampling, colsample_bytree, and GPU acceleration.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Kaggle Competition Simulation & Week 8 Assignment",
          duration: "1.5h",
          content: "Simulated live Kaggle competition with leaderboard submissions, hyperparameter search with Optuna and GridSearchCV.",
          assignmentPrompt: "Assignment 8: Compete on the Titanic survival dataset with an ensemble model achieving top 10% accuracy.",
        },
      ],
    },
    {
      moduleTitle: "Week 9: Unsupervised Learning & Dimensionality Reduction",
      weekNumber: 9,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "K-Means Clustering: Centroids, Inertia & Elbow Method",
          duration: "1.5h",
          content: "Partitioning unlabeled data: K-means algorithm steps, convergence, calculating WCSS (inertia), Elbow curve, and Silhouette score.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Hierarchical Clustering & Dendrogram Analysis",
          duration: "1.5h",
          content: "Agglomerative clustering, linkage criteria (ward, complete, average), reading dendrograms, and selecting natural cluster counts.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Dimensionality Reduction: Principal Component Analysis (PCA)",
          duration: "1.5h",
          content: "Curse of dimensionality, variance retention, calculating principal components, scree plots, and 2D/3D visualization of high-dimensional data.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Customer Segmentation Sprint: Marketing Personas from Clusters",
          duration: "1.5h",
          content: "Applying K-Means and PCA to RFM (Recency, Frequency, Monetary) retail data to identify VIP, At-Risk, and Bargain customer segments.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Clustering Deliverables & Week 9 Assessment",
          duration: "1.5h",
          content: "Presenting business recommendations derived from unsupervised customer clusters to simulated stakeholders.",
          assignmentPrompt: "Assignment 9: Perform customer segmentation on retail transaction records and generate 4 actionable marketing profiles.",
        },
      ],
    },
    {
      moduleTitle: "Week 10: Model Deployment (FastAPI/Streamlit) & Capstone Demo Day",
      weekNumber: 10,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Serializing Models with Joblib & Model Versioning",
          duration: "1.5h",
          content: "Saving trained pipelines with joblib.dump, loading models in production, validating inference latency, and tracking model drift.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Building Interactive ML Web Apps with Streamlit",
          duration: "1.5h",
          content: "Building real-time web applications with Streamlit: sliders, file uploaders, interactive charts, and live prediction output.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Building High-Speed Prediction APIs with FastAPI & Docker",
          duration: "1.5h",
          content: "Serving model predictions via REST with FastAPI, Pydantic request models, Swagger documentation, and Docker containerization.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Cloud Deployment to Hugging Face Spaces & Render",
          duration: "1.5h",
          content: "Deploying production Streamlit apps to Hugging Face Spaces and hosting FastAPI backends on cloud servers with HTTPS.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Capstone Presentation Day, Graduation & Verified Certificates",
          duration: "2h",
          content: "Live student presentations demonstrating deployed machine learning applications, followed by issuing official verified certificates.",
          assignmentPrompt: "Submit your live deployed Streamlit/FastAPI machine learning application URL and GitHub repo for graduation.",
        },
      ],
    },
  ],
};

// 4. DIGITAL MARKETING STRATEGY & GROWTH HACKING (10 WEEKS / 3 MONTHS, 5 DAYS/WEEK)
export const digitalMarketingPreset: CoursePreset = {
  id: "digital-marketing",
  name: "Digital Marketing Strategy (10 Weeks · 5 Days/Week)",
  title: "Digital Marketing Strategy & Growth Hacking",
  category: "Marketing",
  level: "Advanced",
  duration: "3 Months (50 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 9:00 PM – 10:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-marketing",
  },
  shortDescription: "A high-impact 10-week cohort covering full-funnel customer acquisition, SEO technical audits, Google Ads, Meta Ads Manager, and retention automation.",
  fullDescription: "Master growth hacking and performance marketing with data-driven frameworks. Attend live classes 5 days a week, execute real ad budget campaigns, build high-converting landing pages, and analyze ROAS.",
  thumbnail: "/images/course-marketing.jpg",
  price: 189,
  discountPrice: 99,
  outcomes: [
    "Master Full-Funnel Growth Architecture (TOFU, MOFU, BOFU)",
    "Run high-ROI paid ad campaigns on Meta Ads Manager (Facebook/Instagram) & Google Ads",
    "Conduct technical SEO audits, keyword gap analysis, and content ranking strategies",
    "Design high-converting landing pages with CRO principles and A/B testing",
    "Build email marketing automations, customer lifecycle flows, and WhatsApp funnels",
    "Receive a verified IT SkillCore digital certificate of completion"
  ],
  curriculum: [
    {
      moduleTitle: "Week 1: Growth Strategy & Full-Funnel Architecture",
      weekNumber: 1,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Modern Digital Marketing Landscape & Growth Mindset",
          duration: "1.5h",
          content: "Evolution of paid vs organic acquisition, CAC (Customer Acquisition Cost), LTV (Lifetime Value), and the AARRR Pirate Metrics framework.",
          isFreePreview: true,
        },
        {
          day: "Day 2 (Tue)",
          title: "Defining Ideal Customer Profiles (ICP) & Buyer Personas",
          duration: "1.5h",
          content: "B2B vs B2C buyer journeys, identifying pain triggers, customer research surveys, and building hyper-specific target audience personas.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Crafting Irresistible Value Propositions & Messaging",
          duration: "1.5h",
          content: "Hook, Story, Offer frameworks, writing compelling headline formulas, and communicating unique differentiators against competitors.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Full-Funnel Mapping: TOFU, MOFU, BOFU Strategies",
          duration: "1.5h",
          content: "Top of Funnel awareness tactics, Middle of Funnel nurture mechanisms, and Bottom of Funnel conversion triggers.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Funnel Teardown & Week 1 Assignment Brief",
          duration: "1.5h",
          content: "Instructor live teardown of multimillion dollar SaaS and e-commerce funnels, followed by Week 1 assignment guidelines.",
          assignmentPrompt: "Assignment 1: Map an end-to-end full-funnel acquisition strategy for a product including CAC/LTV targets.",
        },
      ],
    },
    {
      moduleTitle: "Week 2: Technical SEO, Keyword Research & Content Authority",
      weekNumber: 2,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Search Engine Algorithms & Crawling/Indexing Architecture",
          duration: "1.5h",
          content: "How Google crawls, renders, and indexes web pages; Google Search Console diagnostics, robots.txt, and XML sitemaps.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Advanced Keyword Research & Search Intent Mapping",
          duration: "1.5h",
          content: "Using Ahrefs / SEMrush: informational vs transactional intent, long-tail opportunities, keyword difficulty, and search volume analysis.",
        },
        {
          day: "Day 3 (Wed)",
          title: "On-Page SEO Optimization & Semantic Schema Markup",
          duration: "1.5h",
          content: "Title tags, meta descriptions, H1-H3 hierarchy, URL structure, image alt tags, internal linking siloing, and JSON-LD structured data.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Core Web Vitals & Technical Site Speed Optimization",
          duration: "1.5h",
          content: "Optimizing LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift) for top search rankings.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live SEO Audit Lab & Week 2 Assignment",
          duration: "1.5h",
          content: "Performing a live technical SEO audit on an e-commerce website and compiling a prioritized remediation punch list.",
          assignmentPrompt: "Assignment 2: Conduct a 20-point technical SEO audit on a selected domain and present your recommendations.",
        },
      ],
    },
    {
      moduleTitle: "Week 3: Meta Ads Manager (Facebook & Instagram) Mastery",
      weekNumber: 3,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Meta Ads Architecture: Campaigns, Ad Sets & Ads",
          duration: "1.5h",
          content: "Campaign objectives (Sales, Leads, Traffic, Engagement), CBO (Advantage Campaign Budget) vs ABO, and budget pacing.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Audience Targeting: Custom, Lookalike & Broad Advantage+",
          duration: "1.5h",
          content: "Building website custom audiences, customer list uploads, 1%-5% Lookalike audiences, and leveraging Meta's Advantage+ AI targeting.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Meta Pixel & Conversions API (CAPI) Integration",
          duration: "1.5h",
          content: "Server-side tracking with Conversions API, setting up custom events (Purchase, AddToCart, Lead), and event deduplication.",
        },
        {
          day: "Day 4 (Thu)",
          title: "High-Converting Ad Creatives & Copywriting Formulas",
          duration: "1.5h",
          content: "UGC (User-Generated Content) frameworks, direct response copywriting (PAS, AIDA), hook testing, and video thumb-stop rates.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Ad Campaign Launch & Week 3 Assignment",
          duration: "1.5h",
          content: "Live instructor setup and launch of a real Meta Ad campaign, reviewing QA checklists before activating budget.",
          assignmentPrompt: "Assignment 3: Build a complete Meta Ads campaign draft with 3 audience variations and 5 high-converting ad creatives.",
        },
      ],
    },
    {
      moduleTitle: "Week 4: Google Ads (Search, Performance Max & YouTube)",
      weekNumber: 4,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Google Search Ads & The Ad Auction Mechanism",
          duration: "1.5h",
          content: "Quality Score (Ad Relevance, Expected CTR, Landing Page Experience), Ad Rank formula, and bidding strategies (Maximize Conversions, Target CPA).",
        },
        {
          day: "Day 2 (Tue)",
          title: "Keyword Match Types & Negative Keyword Sculpting",
          duration: "1.5h",
          content: "Exact match, Phrase match, Broad match with Smart Bidding, identifying budget-wasting search terms, and negative keyword lists.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Responsive Search Ads (RSA) & Asset Extensions",
          duration: "1.5h",
          content: "Writing 15 headlines and 4 descriptions, pinning best headlines, adding sitelinks, callouts, structured snippets, and promotion assets.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Google Performance Max (PMax) Campaigns & Shopping Ads",
          duration: "1.5h",
          content: "Setting up Performance Max asset groups, audience signals, product feeds via Google Merchant Center, and YouTube video ads.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Google Ads Account Audit & Week 4 Evaluation",
          duration: "1.5h",
          content: "Step-by-step account audit of an active Google Ads spend account, detecting search term leakage, and assigning project.",
          assignmentPrompt: "Assignment 4: Construct a high-intent Google Search Ads campaign structure with negative keyword lists.",
        },
      ],
    },
    {
      moduleTitle: "Week 5: Landing Page Optimization & Conversion Rate Optimization (CRO)",
      weekNumber: 5,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Anatomy of an 8-Figure Landing Page",
          duration: "1.5h",
          content: "Above-the-fold elements: headline, subheadline, hero image/video, primary CTA, social proof bar, and message match with ad copy.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Conversion Psychology: Cognitive Biases & Urgency",
          duration: "1.5h",
          content: "Applying scarcity, social proof, loss aversion, authority bias, risk reversal guarantees, and overcoming buyer objections.",
        },
        {
          day: "Day 3 (Wed)",
          title: "User Behavior Analytics: Heatmaps, Scrollmaps & Session Recordings",
          duration: "1.5h",
          content: "Analyzing Hotjar / Microsoft Clarity recordings: rage clicks, dead clicks, drop-off points, and form abandonment friction.",
        },
        {
          day: "Day 4 (Thu)",
          title: "A/B Split Testing Methodology & Statistical Confidence",
          duration: "1.5h",
          content: "Formulating testable hypotheses, determining sample size requirements, running split tests, and avoiding false positives.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Live Landing Page Teardown & Mid-Term Assignment",
          duration: "1.5h",
          content: "Live teardown of student landing pages, redlining copy and layout issues to boost conversion rates from 1.5% to 4.0%+.",
          assignmentPrompt: "Mid-Term Project: Design and copywrite a high-converting B2B or e-commerce landing page with CRO annotations.",
        },
      ],
    },
    {
      moduleTitle: "Week 6: Email Marketing Automations & Customer Lifecycle Retention",
      weekNumber: 6,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Email Deliverability, Sender Reputation & List Health",
          duration: "1.5h",
          content: "SPF, DKIM, DMARC DNS records, warm-up schedules, spam trigger words, list hygiene, and maintaining <0.1% bounce rates.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Essential Automated Flows: Welcome Series & Abandoned Cart",
          duration: "1.5h",
          content: "Setting up trigger-based automations in Klaviyo / Mailchimp: 3-part Welcome Series, dynamic Abandoned Cart flows, and Browse Abandonment.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Customer Win-Back, Post-Purchase & VIP Retention Sequences",
          duration: "1.5h",
          content: "Post-purchase onboarding, requesting product reviews, replenishment reminders, and 60-day win-back discount sequences.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Audience Segmentation & Behavioral Triggers",
          duration: "1.5h",
          content: "Creating engaged 30/60/90-day segments, predictive CLV segments, purchase frequency tiers, and personalized dynamic content.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Email Campaign Copywriting Lab & Week 6 Assignment",
          duration: "1.5h",
          content: "Writing compelling email subject lines, preview text, previewing mobile responsiveness, and testing plain text vs rich HTML.",
          assignmentPrompt: "Assignment 6: Write and configure a 4-stage automated email onboarding sequence with conditional branching.",
        },
      ],
    },
    {
      moduleTitle: "Week 7: Social Media Growth, Organic Viral Loops & TikTok Strategy",
      weekNumber: 7,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Short-Form Video Algorithms (TikTok, Reels, YouTube Shorts)",
          duration: "1.5h",
          content: "Algorithm mechanics: watch time, completion rate, re-watch factor, shares, and understanding audio trends.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Content Batching, Scripting & 3-Second Hooks",
          duration: "1.5h",
          content: "Writing high-retention video scripts, visual pattern interrupts, pacing, auto-captioning, and batching 30 videos per week.",
        },
        {
          day: "Day 3 (Wed)",
          title: "LinkedIn Thought Leadership & B2B Organic Outreach",
          duration: "1.5h",
          content: "Optimizing executive profiles, writing viral LinkedIn carousels, algorithmic engagement pods rules, and organic pipeline generation.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Influencer Marketing & Affiliate Partnership Systems",
          duration: "1.5h",
          content: "Finding micro-influencers, outreach negotiation scripts, contract terms, commission tracking via affiliate codes, and measuring ROAS.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Social Growth Strategy Sprint & Week 7 Evaluation",
          duration: "1.5h",
          content: "Live critique of organic content strategies and assigning a 30-day viral content distribution roadmap.",
          assignmentPrompt: "Assignment 7: Produce a 30-day short-form video content calendar including scripts, hooks, and trend targets.",
        },
      ],
    },
    {
      moduleTitle: "Week 8: Web Analytics (GA4), Server-Side Tracking & Tag Manager",
      weekNumber: 8,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Google Analytics 4 (GA4) Event-Based Data Model",
          duration: "1.5h",
          content: "Universal Analytics vs GA4: event parameters, user properties, custom dimensions, and session vs user acquisition reports.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Google Tag Manager (GTM) Architecture & Triggers",
          duration: "1.5h",
          content: "Tags, triggers, variables, dataLayer events, testing via GTM Preview Mode, and configuring custom button click trackers.",
        },
        {
          day: "Day 3 (Wed)",
          title: "E-Commerce Enhanced Conversion Tracking & UTM Strategy",
          duration: "1.5h",
          content: "Tracking purchase revenue, transaction IDs, items array, building standardized UTM campaign naming conventions.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Attribution Modeling: First Click, Last Click & Data-Driven",
          duration: "1.5h",
          content: "Understanding multi-touch attribution, why last-click hurts brand marketing, cross-device tracking, and privacy regulations (GDPR/CCPA).",
        },
        {
          day: "Day 5 (Fri)",
          title: "Analytics Audit Workshop & Week 8 Assignment",
          duration: "1.5h",
          content: "Live audit of a live GA4 account, fixing unassigned traffic, broken referral exclusions, and configuring custom funnels.",
          assignmentPrompt: "Assignment 8: Configure a complete GTM container tracking dynamic form submits and e-commerce purchases.",
        },
      ],
    },
    {
      moduleTitle: "Week 9: Looker Studio Executive Dashboards & Growth Reporting",
      weekNumber: 9,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Connecting Data Sources: GA4, Google Ads, Meta Ads & BigQuery",
          duration: "1.5h",
          content: "Setting up data connectors in Google Looker Studio, data blending, calculated fields, and date range parameters.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Designing Executive Marketing Dashboards",
          duration: "1.5h",
          content: "Building clean CEO-ready visual reports: Blended ROAS, Total Marketing Spend, Blended CAC, Net Profit, and Conversion Funnels.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Automated Weekly & Monthly Client Reporting Systems",
          duration: "1.5h",
          content: "Automating scheduled PDF email delivery to executives, highlighting week-over-week wins, and formatting clear executive summaries.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Growth Modeling & Budget Forecasting in Spreadsheets",
          duration: "1.5h",
          content: "Building predictive financial models: forecasting revenue at $10k, $50k, and $100k ad spend tiers given conversion rate assumptions.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Dashboard Presentation Sprint & Week 9 Assessment",
          duration: "1.5h",
          content: "Students present their live interactive Looker Studio dashboards to simulated agency clients.",
          assignmentPrompt: "Assignment 9: Deliver an automated Looker Studio executive dashboard integrating paid traffic and revenue metrics.",
        },
      ],
    },
    {
      moduleTitle: "Week 10: Capstone Marketing Plan, Agency Pitch & Graduation",
      weekNumber: 10,
      lessons: [
        {
          day: "Day 1 (Mon)",
          title: "Structuring a Comprehensive $100k Growth Marketing Plan",
          duration: "1.5h",
          content: "Synthesizing strategy: budget allocation across channels, creative asset roadmap, testing plan, and risk mitigation.",
        },
        {
          day: "Day 2 (Tue)",
          title: "Writing Winning Agency Proposals & Retainer Pricing",
          duration: "1.5h",
          content: "How to price marketing services: flat retainers vs % of ad spend vs performance bonuses, proposal slide templates, and closing deals.",
        },
        {
          day: "Day 3 (Wed)",
          title: "Marketing Automation Tools Stack (Zapier, Make, CRM)",
          duration: "1.5h",
          content: "Connecting lead forms directly to HubSpot/Salesforce, automated Slack alerts for sales teams, and automated lead scoring.",
        },
        {
          day: "Day 4 (Thu)",
          title: "Digital Marketer Career Navigation & Consulting Setup",
          duration: "1.5h",
          content: "Setting up your digital marketing consultancy, building social proof, landing high-ticket clients, and interview strategy.",
        },
        {
          day: "Day 5 (Fri)",
          title: "Capstone Pitch Day, Graduation Ceremony & Certificate Issuance",
          duration: "2h",
          content: "Live pitches of capstone marketing plans to senior marketing directors. Issuance of verified IT SkillCore certificates.",
          assignmentPrompt: "Submit your final comprehensive 3-Month Growth Marketing Strategy Slide Deck for final graduation sign-off.",
        },
      ],
    },
  ],
};

// 5. AMAZON FBA PRIVATE LABEL & WHOLESALE MASTERY (10 WEEKS, 5 DAYS/WEEK)
export const amazonFbaPreset: CoursePreset = {
  id: "amazon-fba-mastery",
  name: "Amazon FBA Private Label & Wholesale (10 Weeks · 5 Days/Week)",
  title: "Amazon FBA Private Label & Wholesale Mastery",
  category: "E-Commerce",
  level: "Beginner",
  duration: "3 Months (50 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 9:00 PM – 10:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-amazon",
  },
  shortDescription:
    "3-Month live Amazon FBA training covering profitable product hunting with Helium 10, Alibaba supplier negotiation, LLC/brand setup, listing SEO, and PPC launch scaling.",
  fullDescription:
    "Build a profitable global e-commerce business or launch an agency career as an Amazon FBA specialist. Across 50 live interactive sessions, learn data-backed product research, patent checks, supplier sourcing, DDP freight logistics, A+ Content SEO, and profitable Sponsored Ads management.",
  thumbnail: "/images/course-amazon.jpg",
  price: 229,
  discountPrice: 139,
  outcomes: [
    "Hunt high-margin, low-competition winning products using Helium 10 & Keepa",
    "Verify suppliers on Alibaba, negotiate MOQs, and manage inspections & DDP shipping",
    "Write keyword-indexed Amazon listings, EBC / A+ Content, and high-CTR creative briefs",
    "Launch and optimize Amazon PPC (Auto, Broad, Exact) to lower ACOS and scale TACOS",
    "Manage Seller Central Inventory Performance Index (IPI), FBA shipments, and Brand Registry",
    "Deliver client-ready Amazon FBA launch & account management audits"
  ],
  curriculum: Array.from({ length: 10 }, (_, idx) => {
    const wk = idx + 1;
    const topics = [
      "Amazon Business Models, Seller Central Setup & Account Health",
      "Deep Niche Discovery, Helium 10 Black Box & Market Validation",
      "Competitor Auditing, Keepa Historical Analytics & Margin Calculation",
      "Patent Checks, Supplier Hunting on Alibaba & Sample Evaluation",
      "Freight Forwarding, Incoterms (EXW/FOB/DDP) & FBA Shipment Plans",
      "Keyword Indexing (Cerebro/Magnet) & High-Converting Listing Copywriting",
      "Product Photography Direction, Brand Registry & A+ Visual Content",
      "Product Launch Velocity, Vine Reviews & Conversion Rate Optimization",
      "Amazon PPC Mastery: Campaign Architecture, Bid Optimization & ACOS Control",
      "Wholesale FBA Sourcing, Agency Client Acquisition & Capstone Audit"
    ];
    const days = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)"];
    return {
      moduleTitle: `Week ${wk}: ${topics[idx]}`,
      weekNumber: wk,
      lessons: days.map((day, dIdx) => ({
        day,
        title:
          dIdx === 0
            ? `${topics[idx].split(",")[0]} — Core Framework`
            : dIdx === 4
            ? `Live Case Audit & Week ${wk} FBA Deliverable`
            : `${topics[idx].split(",")[0]} — Hands-On Seller Central Lab ${dIdx}`,
        duration: "1.5h",
        content: `Live interactive walkthrough covering ${topics[idx].toLowerCase()}, real Seller Central examples, and actionable checklists.`,
        presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
        presentationName: `AmazonFBA_Week${wk}_Slides.pdf`,
        assignmentPrompt:
          dIdx === 4 ? `Week ${wk} Assignment: Submit your practical deliverable for ${topics[idx]}.` : undefined,
        isFreePreview: wk === 1 && dIdx === 0,
      })),
    };
  }),
};

// 6. TIKTOK SHOP & VIRAL SOCIAL COMMERCE (10 WEEKS, 5 DAYS/WEEK)
export const tiktokShopPreset: CoursePreset = {
  id: "tiktok-shop-commerce",
  name: "TikTok Shop & Viral Social Commerce (10 Weeks · 5 Days/Week)",
  title: "TikTok Shop & Viral Social Commerce",
  category: "E-Commerce",
  level: "Beginner",
  duration: "3 Months (50 Live Sessions)",
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 7:30 PM – 9:00 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-tiktok",
  },
  shortDescription:
    "3-Month live cohort mastering TikTok Shop Seller Center (UK/US), viral product selection, shoppable short-form hooks, creator affiliate outreach, and TikTok Live Ads.",
  fullDescription:
    "Capture the fastest-growing social commerce channel worldwide. In 10 structured live weeks (Mon–Fri), master TikTok Shop account compliance, trending product discovery, high-retention UGC hooks, creator affiliate scaling, Spark Ads, and live shopping conversion mechanics.",
  thumbnail: "/images/course-tiktok.jpg",
  price: 199,
  discountPrice: 119,
  outcomes: [
    "Set up compliant TikTok Shop US/UK Seller accounts and fulfillment workflows",
    "Discover viral impulse-buy products using Kalodata, FastMoss & Creative Center",
    "Script and edit 3-second scroll-stopping shoppable video hooks & UGC ads",
    "Build & automate a 100+ TikTok Affiliate Creator outreach pipeline",
    "Run profitable GMV Max, Video Shopping Ads, and Live Shopping Ads campaigns",
    "Manage Shop Performance Scores (SPS), payouts, and dropship/3PL fulfillment"
  ],
  curriculum: Array.from({ length: 10 }, (_, idx) => {
    const wk = idx + 1;
    const topics = [
      "TikTok Shop Ecosystem, US/UK Account Architecture & Compliance",
      "Viral Product Hunting with Kalodata, FastMoss & Trend Signals",
      "3PL Fulfillment, US Warehouse Sourcing & Margin Modeling",
      "High-Retention Short-Form Scripting & Viral Hook Mechanics",
      "UGC Product Studio Production, Lighting & CapCut Conversion Editing",
      "Creator Affiliate Program: Open/Target Collaborations & Outreach Automation",
      "TikTok Ads Manager: GMV Max, Video Shopping Ads & Spark Ads",
      "Live Shopping Frameworks: Run-of-Show, Pinning & Real-Time Offers",
      "Shop Performance Score (SPS), Dispute Prevention & Scaling Winners",
      "Agency Retainer Blueprint & Capstone Live Brand Launch"
    ];
    const days = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)"];
    return {
      moduleTitle: `Week ${wk}: ${topics[idx]}`,
      weekNumber: wk,
      lessons: days.map((day, dIdx) => ({
        day,
        title:
          dIdx === 0
            ? `${topics[idx].split(",")[0]} — Strategy & Setup`
            : dIdx === 4
            ? `Creative Teardown & Week ${wk} Shop Lab`
            : `${topics[idx].split(",")[0]} — Live Execution Workshop ${dIdx}`,
        duration: "1.5h",
        content: `Hands-on live session exploring ${topics[idx].toLowerCase()}, real store dashboards, and campaign breakdowns.`,
        presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
        presentationName: `TikTokShop_Week${wk}_Slides.pdf`,
        assignmentPrompt:
          dIdx === 4 ? `Week ${wk} Assignment: Submit your store or creative deliverable for ${topics[idx]}.` : undefined,
        isFreePreview: wk === 1 && dIdx === 0,
      })),
    };
  }),
};

export const ALL_COURSE_PRESETS: CoursePreset[] = [
  fullStackWebDevPreset,
  uiuxDesignPreset,
  pythonDataSciencePreset,
  digitalMarketingPreset,
  amazonFbaPreset,
  tiktokShopPreset,
];
