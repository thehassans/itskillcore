import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import Broadcast from "@/models/Broadcast";
import Enrollment from "@/models/Enrollment";
import Certificate from "@/models/Certificate";
import Attendance from "@/models/Attendance";
import AttendanceSession from "@/models/AttendanceSession";
import LeaveRequest from "@/models/LeaveRequest";
import FeeInstallment from "@/models/FeeInstallment";
import LessonQuestion from "@/models/LessonQuestion";
import Coupon from "@/models/Coupon";
import { Blog, FAQ, ContactMessage } from "@/models/Content";
import { ALL_COURSE_PRESETS } from "@/lib/coursePresets";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  // 1. Users
  const upsertUser = async (name: string, email: string, pw: string, role: string) => {
    const existing = await User.findOne({ email });
    if (!existing) {
      const password = await bcrypt.hash(pw, 12);
      return User.create({ name, email, role, password });
    }
    return existing;
  };

  const admin = await upsertUser("Super Admin", "admin@lms.com", "Admin@123", "ADMIN");
  const student = await upsertUser("Demo Student", "student@lms.com", "Student@123", "STUDENT");
  const instructorUser = await upsertUser(
    "Usman Tariq",
    "instructor@lms.com",
    "Instructor@123",
    "INSTRUCTOR"
  );

  // 2. 3-Month Live Cohort Courses (5 Days / Week)
  const instructorProfiles = [
    {
      name: "Engr. Hamza Farooq",
      title: "Senior Full-Stack Architect & Ex-Googler",
      avatar: "/images/instructor.jpg",
      bio: "12+ years building enterprise distributed systems and scaling Next.js & Node.js architectures globally.",
    },
    {
      name: "Amira Khan",
      title: "Principal Product Designer & UX Researcher",
      avatar: "/images/instructor.jpg",
      bio: "Lead UX designer with 10+ years shaping accessible, award-winning SaaS products and Figma design systems.",
    },
    {
      name: "Dr. Zaid Malik",
      title: "Chief AI Scientist & ML Researcher",
      avatar: "/images/instructor.jpg",
      bio: "PhD in Machine Learning with a track record of deploying predictive AI and big data analytics pipelines.",
    },
    {
      name: "Sara Qureshi",
      title: "VP of Growth & Performance Marketing",
      avatar: "/images/instructor.jpg",
      bio: "Growth strategist who has scaled multiple 8-figure brands with Meta Ads, Google Ads, and full-funnel CRO.",
    },
  ];

  const seededCourses: any[] = [];

  for (let i = 0; i < ALL_COURSE_PRESETS.length; i++) {
    const preset = ALL_COURSE_PRESETS[i];
    const slug = slugify(preset.title);

    const courseData = {
      title: preset.title,
      slug,
      shortDescription: preset.shortDescription,
      fullDescription: preset.fullDescription,
      thumbnail: preset.thumbnail,
      price: preset.price,
      discountPrice: preset.discountPrice,
      category: preset.category,
      level: preset.level,
      duration: preset.duration,
      cohortSchedule: preset.cohortSchedule,
      instructor: instructorProfiles[i % instructorProfiles.length],
      outcomes: preset.outcomes,
      curriculum: preset.curriculum,
      isPublished: true,
    };

    const doc = await Course.findOneAndUpdate(
      { slug },
      { $set: courseData },
      { upsert: true, new: true }
    );
    seededCourses.push(doc);
  }

  const webDevCourse = seededCourses[0];
  const uiuxCourse = seededCourses[1];
  const pythonCourse = seededCourses[2];
  const amazonCourse = seededCourses[4];

  // 2b. Deduplicate stale legacy courses from earlier seeds while preserving student records
  const legacyPairs: Array<[string, any]> = [
    ["full-stack-web-development-with-next-js", webDevCourse],
    ["full-stack-web-development-with-nextjs", webDevCourse],
    ["ui-ux-design-foundations", uiuxCourse],
    ["uiux-design-foundations", uiuxCourse],
    ["data-analysis-with-python", pythonCourse],
    ["digital-marketing-strategy", seededCourses[3]],
  ];

  for (const [oldSlug, targetCourse] of legacyPairs) {
    if (!targetCourse) continue;
    const oldCourse: any = await Course.findOne({ slug: oldSlug }).lean();
    if (!oldCourse || String(oldCourse._id) === String(targetCourse._id)) continue;

    const oldId = oldCourse._id;
    const newId = targetCourse._id;

    // Migrate Enrollments without violating unique(student, course)
    const oldEnrollments: any[] = await Enrollment.find({ course: oldId }).lean();
    for (const enrDoc of oldEnrollments) {
      const exists = await Enrollment.findOne({ student: enrDoc.student, course: newId });
      if (!exists) {
        await Enrollment.updateOne({ _id: enrDoc._id }, { $set: { course: newId } });
      } else {
        await Enrollment.deleteOne({ _id: enrDoc._id });
      }
    }

    // Migrate Certificates safely
    const oldCerts: any[] = await Certificate.find({ course: oldId }).lean();
    for (const cDoc of oldCerts) {
      const exists = await Certificate.findOne({ student: cDoc.student, course: newId });
      if (!exists) {
        await Certificate.updateOne({ _id: cDoc._id }, { $set: { course: newId } });
      } else {
        await Certificate.deleteOne({ _id: cDoc._id });
      }
    }

    await Promise.all([
      FeeInstallment.updateMany({ course: oldId }, { $set: { course: newId } }),
      Broadcast.updateMany({ course: oldId }, { $set: { course: newId } }),
      LessonQuestion.updateMany({ course: oldId }, { $set: { course: newId } }),
      User.updateMany({ assignedCourses: oldId }, { $pull: { assignedCourses: oldId } }),
      Course.deleteOne({ _id: oldId }),
    ]);
  }

  // Clean up any accidentally polluted non-path avatar strings from Chrome autofill
  await User.updateMany(
    { avatar: { $exists: true, $nin: ["", null], $not: /^(\/|https?:\/\/)/ } },
    { $set: { avatar: "" } }
  );

  // 3. Homework Assignments
  await Assignment.deleteMany({});
  const assignmentsToInsert = [
    {
      course: webDevCourse._id,
      lessonTitle: "Day 5 (Fri): Code Review, Git/GitHub Version Control & Week 1 Assignment",
      title: "Week 1: Responsive Developer Portfolio Website",
      description: "Build a modern multi-page personal developer portfolio using semantic HTML5 and CSS Flexbox/Grid. Ensure complete mobile responsiveness across 375px, 768px, and 1280px breakpoints. Submit your source code (ZIP) or detailed PDF documentation.",
      weekNumber: 1,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      maxScore: 100,
      attachments: [
        {
          name: "Week1_Assignment_Brief.pdf",
          url: "/uploads/Week1_Web_Architecture_Slides.pdf",
          type: "pdf",
        },
      ],
    },
    {
      course: webDevCourse._id,
      lessonTitle: "Day 5 (Fri): Live Lab: Consuming Third-Party REST APIs & Week 2 Project",
      title: "Week 2: Interactive Async Weather & Crypto Dashboard",
      description: "Develop an asynchronous dashboard that fetches live cryptocurrency prices and weather data using Fetch API, Promises, and async/await. Store recent searches in LocalStorage. Submit a Word doc (.docx) or ZIP file with screenshots.",
      weekNumber: 2,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      attachments: [
        {
          name: "API_Endpoints_StarterKit.pdf",
          url: "/uploads/Week1_Web_Architecture_Slides.pdf",
          type: "pdf",
        },
      ],
    },
    {
      course: webDevCourse._id,
      lessonTitle: "Day 5 (Fri): Dynamic Routing, Parallel Routes & Intercepting Modals",
      title: "Week 7: Next.js 14 App Router Dynamic Platform",
      description: "Construct a full Next.js 14 App Router application utilizing Server Components, Server Actions for mutations, dynamic routes [slug], and Tailwind CSS. Deploy to Vercel and submit the live URL along with your project code ZIP.",
      weekNumber: 7,
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
    {
      course: uiuxCourse._id,
      lessonTitle: "Day 5 (Fri): Live Case Study Review & Week 1 Research Brief",
      title: "Week 1: User Empathy & Competitive UX Audit Report",
      description: "Conduct user interviews with at least 3 participants for a healthcare mobile app. Synthesize your research into 2 data-driven user personas, an empathy map, and a competitive audit matrix. Submit as Word (.docx) or PDF.",
      weekNumber: 1,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
    {
      course: uiuxCourse._id,
      lessonTitle: "Day 5 (Fri): Interactive Prototype Workshop & Week 4 Evaluation",
      title: "Week 4: High-Fidelity Interactive Mobile Banking Prototype",
      description: "Build an interactive clickable prototype in Figma using Auto Layout, Component Variants, and Smart Animate transitions. Submit your Figma link and exported screen PNG images.",
      weekNumber: 4,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
    {
      course: pythonCourse._id,
      lessonTitle: "Day 5 (Fri): Mid-Term EDA Portfolio Presentation & Critique",
      title: "Week 5: Exploratory Data Analysis (EDA) on Tech Salaries",
      description: "Perform end-to-end data cleaning, imputation, and exploratory analysis on the Global Tech Salaries dataset using Pandas and Seaborn. Identify salary trends across countries and experience levels. Submit your Jupyter Notebook or PDF report.",
      weekNumber: 5,
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
  ];

  const createdAssignments = await Assignment.insertMany(assignmentsToInsert);

  // 4. Student Submissions (Pre-populated so Admin has files to review and grade immediately)
  await Submission.deleteMany({});
  const submissionsToInsert = [
    {
      assignment: createdAssignments[0]._id, // WebDev Week 1
      student: student._id,
      course: webDevCourse._id,
      studentComment: "Completed my responsive portfolio with CSS Grid and Flexbox. Tested across mobile, tablet, and desktop viewports. All links and dark mode toggle work cleanly!",
      fileUrl: "/uploads/Student_Homework_Portfolio.zip",
      fileName: "Portfolio_Submission_Ahsan.zip",
      fileType: "zip",
      status: "GRADED",
      score: 95,
      feedback: "Outstanding work! Semantic HTML tags are properly used, CSS Grid responsive layout adapts smoothly down to 360px screen width. Code is clean and well-structured.",
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      assignment: createdAssignments[3]._id, // UI/UX Week 1
      student: student._id,
      course: uiuxCourse._id,
      studentComment: "Attached my 12-page UX research case study document with 3 user personas, affinity mapping, and competitive analysis.",
      fileUrl: "/uploads/UX_Research_Audit_CaseStudy.pdf",
      fileName: "Healthcare_UX_Research_Audit.pdf",
      fileType: "pdf",
      status: "GRADED",
      score: 88,
      feedback: "Great depth in user persona quotes and friction identification. In the next sprint, expand the user journey maps to include emotional highs and lows.",
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      assignment: createdAssignments[1]._id, // WebDev Week 2
      student: student._id,
      course: webDevCourse._id,
      studentComment: "Implemented async/await with error boundaries for both Crypto and Weather open APIs. Added LocalStorage cache to prevent rate-limit errors.",
      fileUrl: "/uploads/NextJS_Task_Tracker_Solution.docx",
      fileName: "Async_API_Dashboard_Report.docx",
      fileType: "docx",
      status: "SUBMITTED", // Pending review by Admin
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      assignment: createdAssignments[4]._id, // UI/UX Week 4
      student: student._id,
      course: uiuxCourse._id,
      studentComment: "High-resolution prototype screen designs for the Mobile Banking onboarding and biometric transfer flow.",
      fileUrl: "/uploads/Mobile_Screen_Layout_Designs.png",
      fileName: "Mobile_Banking_Screens.png",
      fileType: "image",
      status: "SUBMITTED",
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  await Submission.insertMany(submissionsToInsert);

  // 5. Quizzes
  await Quiz.deleteMany({});
  const quizzesToInsert = [
    {
      course: webDevCourse._id,
      title: "Week 1 Milestone Quiz: Web Architecture & Semantic HTML",
      description: "Test your comprehension of client-server lifecycles, HTTP status codes, semantic HTML elements, and CSS Flexbox layout rules.",
      weekNumber: 1,
      passingScore: 70,
      questions: [
        {
          question: "Which HTTP status code signifies that a requested resource was successfully created on the server?",
          options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
          correctIndex: 1,
          explanation: "HTTP 201 Created indicates that the request has succeeded and led to the creation of a new resource on the server.",
        },
        {
          question: "Which HTML5 element represents self-contained content that could be distributed independently (e.g. blog post, card)?",
          options: ["<section>", "<article>", "<aside>", "<div>"],
          correctIndex: 1,
          explanation: "<article> represents an independent, self-contained piece of content that could theoretically be syndicated independently.",
        },
        {
          question: "In CSS Flexbox, which property controls alignment along the cross axis?",
          options: ["justify-content", "align-items", "flex-direction", "align-content"],
          correctIndex: 1,
          explanation: "justify-content aligns items along the main axis, whereas align-items aligns them along the cross axis.",
        },
        {
          question: "What does the CSS 'fr' unit represent in CSS Grid?",
          options: ["Fixed resolution unit", "Fraction of the available free space in the grid container", "Frame rate interval", "Font ratio modifier"],
          correctIndex: 1,
          explanation: "The 'fr' unit represents a fraction of the available free space in the grid container.",
        },
        {
          question: "What is the primary benefit of mobile-first responsive web design?",
          options: [
            "It eliminates the need for CSS media queries entirely",
            "It prioritizes core content and performance on constrained devices before scaling up",
            "It forces all users to download desktop assets first",
            "It automatically converts images to vector SVG",
          ],
          correctIndex: 1,
          explanation: "Mobile-first design ensures essential content and lightweight assets are rendered efficiently before adding desktop complexity with min-width media queries.",
        },
      ],
    },
    {
      course: webDevCourse._id,
      title: "Week 3 Milestone Quiz: Modern JavaScript (ES2024) & TypeScript",
      description: "Evaluate your understanding of asynchronous execution, closures, higher-order methods, and TypeScript interfaces.",
      weekNumber: 3,
      passingScore: 75,
      questions: [
        {
          question: "What happens when you await a rejected Promise without a try...catch block in an async function?",
          options: [
            "The function silently returns null",
            "An unhandled promise rejection error is thrown",
            "The code continues executing synchronously",
            "The browser crashes immediately",
          ],
          correctIndex: 1,
          explanation: "Awaiting a rejected Promise throws an exception. Without a try/catch block, it bubbles up as an unhandled rejection.",
        },
        {
          question: "Which TypeScript utility type constructs a type with all properties of T set to optional?",
          options: ["Required<T>", "Readonly<T>", "Partial<T>", "Omit<T, K>"],
          correctIndex: 2,
          explanation: "Partial<T> makes all properties in type T optional.",
        },
        {
          question: "What does the nullish coalescing operator (??) evaluate?",
          options: [
            "Returns the right-hand operand only when the left-hand is null or undefined",
            "Returns the right-hand operand whenever the left-hand is falsy (including 0 or '')",
            "Compares strict equality without type coercion",
            "Safely navigates nested object properties",
          ],
          correctIndex: 0,
          explanation: "?? only falls back when the left operand is null or undefined, preserving valid falsy values like 0 and empty strings.",
        },
      ],
    },
    {
      course: uiuxCourse._id,
      title: "Week 1 Milestone Quiz: UX Foundations & Heuristic Evaluation",
      description: "Assess your mastery of Jakob Nielsen's 10 usability heuristics, empathy mapping, and user research protocols.",
      weekNumber: 1,
      passingScore: 70,
      questions: [
        {
          question: "Which Nielsen Norman Usability Heuristic states that users should always be informed about what is going on through appropriate feedback?",
          options: [
            "Match between system and the real world",
            "Visibility of system status",
            "User control and freedom",
            "Flexibility and efficiency of use",
          ],
          correctIndex: 1,
          explanation: "Visibility of system status requires providing timely feedback (e.g. progress bars, loaders, toast notices).",
        },
        {
          question: "What are the four quadrants of a standard Empathy Map?",
          options: [
            "Inputs, Outputs, Processing, Storage",
            "Says, Thinks, Does, Feels",
            "Strengths, Weaknesses, Opportunities, Threats",
            "Price, Product, Promotion, Place",
          ],
          correctIndex: 1,
          explanation: "A traditional empathy map consists of Says, Thinks, Does, and Feels to capture a comprehensive portrait of user experience.",
        },
        {
          question: "What is the recommended minimum WCAG AA contrast ratio for normal body text against its background?",
          options: ["3.0:1", "4.5:1", "7.0:1", "10:1"],
          correctIndex: 1,
          explanation: "WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text (under 18pt or 14pt bold).",
        },
      ],
    },
  ];

  await Quiz.insertMany(quizzesToInsert);

  // 6. Broadcasts (Live meeting announcements and resource links)
  await Broadcast.deleteMany({});
  await Broadcast.insertMany([
    {
      title: "Live Class Tonight: Web Architecture & Setup (8:00 PM PKT)",
      message: "Our 3-Month cohort live lecture starts sharp at 8:00 PM PKT on Google Meet. Please make sure VS Code and Git are updated. Join 5 minutes early to test your audio.",
      linkUrl: "https://meet.google.com/itskillcore-webdev",
      linkLabel: "Join Google Meet Live",
      target: "ALL",
      senderName: "Engr. Hamza Farooq (Lead Instructor)",
      createdAt: new Date(),
    },
    {
      title: "Week 1 Lecture Slides & Starter Code Repository Released",
      message: "The presentation slide deck, cheatsheets, and exercise starter code for Chapter 1 are now ready for download. Please review before Friday's lab session.",
      linkUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
      linkLabel: "Download Presentation Slides (PDF)",
      target: "ALL",
      senderName: "IT SkillCore Academic Office",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Weekend Doubt Clearing & Portfolio Review Workshop",
      message: "Join senior mentors this Saturday from 5:00 PM – 7:00 PM PKT for 1-on-1 portfolio teardowns, debugging assistance, and live homework guidance.",
      linkUrl: "https://meet.google.com/itskillcore-live",
      linkLabel: "Access Workshop Room",
      target: "ALL",
      senderName: "Student Success Team",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 7. Enrollments
  // Approved enrollment for student in Web Dev Course (with Week 1 lessons completed)
  const completedWeek1LessonIds = (webDevCourse.curriculum?.[0]?.lessons || []).map((l: any) =>
    String(l._id)
  );
  await Enrollment.updateOne(
    { student: student._id, course: webDevCourse._id },
    {
      $set: {
        student: student._id,
        course: webDevCourse._id,
        status: "APPROVED",
        progress: completedWeek1LessonIds,
        paymentReference: "TXN-ITSKILLCORE-LIVE-001",
        approvedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Pending enrollment in UI/UX Design course so Admin sees pending request
  await Enrollment.updateOne(
    { student: student._id, course: uiuxCourse._id },
    {
      $set: {
        student: student._id,
        course: uiuxCourse._id,
        status: "PENDING",
        paymentReference: "TXN-ITSKILLCORE-UIUX-002",
      },
    },
    { upsert: true }
  );

  // Sample Verifiable Certificate for Demo Student
  await Certificate.updateOne(
    { certificateId: "CERT-ITSKILLCORE-2025" },
    {
      $set: {
        certificateId: "CERT-ITSKILLCORE-2025",
        student: student._id,
        course: webDevCourse._id,
        issuedAt: new Date(),
        attendancePct: 92,
        homeworkAvg: 89,
        quizScore: 95,
        customNote: "Graduated with Distinction · Completed 60 Live Sessions & Capstone Project",
      },
    },
    { upsert: true }
  );

  // Sample Week-1 Live Attendance Records for Demo Student (5 Mon-Fri Sessions)
  await Attendance.deleteMany({ student: student._id, course: webDevCourse._id });
  const week1Attendances = [1, 2, 3, 4, 5].map((dayNum) => {
    const dt = new Date(Date.now() - (6 - dayNum) * 86400000);
    return {
      student: student._id,
      course: webDevCourse._id,
      lessonTitle: `Week 1 · Day ${dayNum} Live Cohort Session`,
      dateKey: dt.toISOString().slice(0, 10),
      joinedAt: dt,
    };
  });
  await Attendance.insertMany(week1Attendances);

  // Sample 3-Month Fee Installments for Approved Enrollment
  const approvedEnrollment: any = await Enrollment.findOne({
    student: student._id,
    course: webDevCourse._id,
  });
  if (approvedEnrollment) {
    await FeeInstallment.deleteMany({ student: student._id, course: webDevCourse._id });
    await FeeInstallment.insertMany([
      {
        student: student._id,
        course: webDevCourse._id,
        enrollment: approvedEnrollment._id,
        installmentNumber: 1,
        monthLabel: "Month 1 Tuition (Weeks 1–4)",
        amount: 12000,
        dueDate: new Date(Date.now() - 15 * 86400000),
        paymentMethod: "JazzCash",
        transactionId: "JC-88412093",
        receiptUrl: "/images/hero.jpg",
        status: "VERIFIED",
        adminNote: "Verified by Accounts Lahore",
        submittedAt: new Date(Date.now() - 16 * 86400000),
        verifiedAt: new Date(Date.now() - 15 * 86400000),
      },
      {
        student: student._id,
        course: webDevCourse._id,
        enrollment: approvedEnrollment._id,
        installmentNumber: 2,
        monthLabel: "Month 2 Tuition (Weeks 5–8)",
        amount: 12000,
        dueDate: new Date(Date.now() + 5 * 86400000),
        paymentMethod: "EasyPaisa",
        transactionId: "EP-77319044",
        receiptUrl: "/images/hero.jpg",
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      {
        student: student._id,
        course: webDevCourse._id,
        enrollment: approvedEnrollment._id,
        installmentNumber: 3,
        monthLabel: "Month 3 Tuition (Weeks 9–12)",
        amount: 12000,
        dueDate: new Date(Date.now() + 35 * 86400000),
        paymentMethod: "Bank Transfer",
        status: "UNPAID",
      },
    ]);
  }

  // Sample Ask Instructor Q&A Threads for Web Dev Lesson 1 & 2
  const firstLesson = webDevCourse.curriculum?.[0]?.lessons?.[0];
  if (firstLesson) {
    await LessonQuestion.deleteMany({ course: webDevCourse._id });
    await LessonQuestion.insertMany([
      {
        course: webDevCourse._id,
        lessonId: String(firstLesson._id),
        lessonTitle: firstLesson.title,
        student: student._id,
        question: "Sir, when calling async server actions in Next.js App Router, should MongoDB connection pooling be awaited on every request?",
        isResolved: true,
        replies: [
          {
            author: admin._id,
            authorName: admin.name || "Usman Tariq (Lead Instructor)",
            authorRole: "ADMIN",
            message: "Great question! Yes — always call `await connectDB()` cleanly at the start of the handler; our global cached promise in `src/lib/db.ts` ensures Mongoose reuses the open connection instead of opening duplicates.",
            createdAt: new Date(Date.now() - 3600000),
          },
        ],
      },
      {
        course: webDevCourse._id,
        lessonId: String(firstLesson._id),
        lessonTitle: firstLesson.title,
        student: student._id,
        question: "Could you share the VS Code ESLint + Tailwind IntelliSense settings JSON shown around minute 38:45?",
        isResolved: false,
        replies: [],
      },
    ]);
  }

  // 8. FAQs (Ultra-Detailed Categorized Knowledge Base)
  await FAQ.deleteMany({});
  await FAQ.insertMany([
    {
      question: "How are the 3-month live cohorts and weekly schedules structured?",
      answer:
        "Every IT SkillCore bootcamp runs as a structured, mentor-led live cohort spanning 10 to 12 weeks (50–60 total live sessions) rather than passive pre-recorded playlists.\n\n- Class Cadence: Live interactive sessions run 5 days a week (Monday to Friday, typically 7:30 PM – 10:30 PM PKT depending on the track) via Google Meet.\n- Daily Resources: Each session pairs live screen-shared coding or practical execution with downloadable PDF slide decks, structured lecture notes, and Q&A.\n- Calendar Sync: From both the public course syllabus and your Student Live Timetable tab, you can download a recurring Mon–Fri `.ics` calendar file directly into Google Calendar, Apple Calendar, or Outlook.",
      category: "Classes & Live Attendance",
      order: 1,
    },
    {
      question: "How does Live Class Attendance PIN verification work, and why is 75% required?",
      answer:
        "To preserve real cohort accountability and protect the value of our employer-verified credentials, attendance is tracked rigorously at every session.\n\n- Joining Class & PIN Verification: Launching your live session from the Student Timetable logs your arrival, and your cohort instructor shares a daily 6-character Check-In PIN during the live Google Meet session. Entering that PIN upgrades your session log to Instructor-Verified (`LIVE_PIN`).\n- Streaks & Leaderboard: Consecutive weekday attendance builds your weekday streak and boosts your standing on the Cohort Leaderboard.\n- Graduation Requirement: You must maintain at least 75% verified live attendance across the cohort alongside academic deliverables to unlock certificate issuance.",
      category: "Classes & Live Attendance",
      order: 2,
    },
    {
      question: "What happens if I miss a live class due to an exam, illness, or power outage?",
      answer:
        "We recognize unexpected schedules happen—especially university mid-terms, family emergencies, or load-shedding.\n\n- Submit a Leave Request: Open the Live Timetable tab in your Student Dashboard, choose the cohort and session date, and submit a brief reason.\n- Make-Up Attendance Credit: Your assigned cohort instructor or Admin reviews leave requests directly inside their Leave Requests console. Once approved, the system automatically awards verified make-up attendance credit (`MAKEUP_CREDIT`) for that date so your 75% Certificate Eligibility remains intact.",
      category: "Classes & Live Attendance",
      order: 3,
    },
    {
      question: "How does the 3-month installment plan work for cohort tuition?",
      answer:
        "Once an enrollment request is approved, tuition is automatically split into 3 balanced monthly installments inside your Fee Installments tab—keeping high-caliber training accessible without paying 100% upfront.\n\n- Official Payment Accounts (Pakistan): You can transfer monthly installments via JazzCash (`0300-1234567`), EasyPaisa (`0345-7654321`), or Meezan Bank IBAN (`PK12MEZN0002810104829101`).\n- Fast Verification: Enter your Transaction ID (TID) and upload a clear receipt screenshot directly on the installment card. Our accounts team verifies payments within 2 to 4 hours.",
      category: "Tuition, Installments & Invoices",
      order: 4,
    },
    {
      question: "Can I apply a scholarship, early-bird promo, or tuition grant code?",
      answer:
        "Yes. IT SkillCore offers periodic early-bird discounts and merit-based scholarship waivers administered via official coupon codes (such as `ITSC25` for 25% off or `SCHOLAR50` for 50% scholarship grants).\n\n- Live Validation at Enrollment: On any paid course page, enter your promo or scholarship code above the Enroll button and click Apply to preview your adjusted tuition immediately.\n- Automatic Installment Adjustment: Your locked discount carries into your approved enrollment so all 3 monthly PKR installments are automatically calculated against your discounted balance.",
      category: "Tuition, Installments & Invoices",
      order: 5,
    },
    {
      question: "Can I download official fee invoices and stamped payment receipts?",
      answer:
        "Yes. Every monthly installment card in your Student Fee Installments panel includes an instant PDF generator.\n\n- Unpaid & Pending Invoices: Download an architectural `INV-...pdf` tuition invoice containing installment breakdown, due date, cohort/batch code, and applied scholarship code.\n- Official Paid Receipts: As soon as our accounts team verifies your payment screenshot and TID, the button updates to Official Receipt PDF showing your `PAID & VERIFIED` status, TID, and verification timestamp for personal or employer reimbursement.",
      category: "Tuition, Installments & Invoices",
      order: 6,
    },
    {
      question: "What happens if a monthly tuition installment becomes overdue?",
      answer:
        "Each monthly installment displays its exact due date inside your Fee Installments panel.\n\n- Temporary Classroom Pause: If an installment passes its grace period and is marked overdue by Admin Accounts, your cohort classroom access (`learn/[slug]`) is temporarily paused while your submitted work and attendance history remain preserved.\n- Instant Unlock: Uploading your payment screenshot and TID immediately queues verification—once approved by Accounts, classroom access unlocks automatically.",
      category: "Tuition, Installments & Invoices",
      order: 7,
    },
    {
      question: "How do weekly homework assignments, code reviews, and grading work?",
      answer:
        "Every week concludes with a hands-on practical assignment or Friday workshop deliverable tied directly to real industry workflows.\n\n- Flexible File Uploads: Submit deliverables inside your Homework & Files tab in `.zip` source archive, `.pdf`, `.docx`, or image formats (up to 25 MB) alongside written notes.\n- Direct Mentor Evaluation: Cohort instructors review each submission individually, award marks, and write actionable improvement feedback. Your graded homework scores compute your Capstone Average, which must be 60%+ to graduate.",
      category: "Assignments, Quizzes & Projects",
      order: 8,
    },
    {
      question: "How do milestone quizzes work, and what score is needed to pass?",
      answer:
        "Milestone quizzes test conceptual clarity and troubleshooting speed at key checkpoints throughout the 3-month syllabus.\n\n- Interactive Assessment: Launch open quizzes inside your Quizzes & Scores tab or classroom player, submit answers, and view pass/fail status immediately.\n- Certificate Gate Contribution: All assigned cohort quizzes must meet the passing threshold (typically 70%+) alongside 75%+ attendance and 60%+ capstone homework average before your credential gate unlocks.",
      category: "Assignments, Quizzes & Projects",
      order: 9,
    },
    {
      question: "How can I ask technical questions between live Google Meet classes?",
      answer:
        "You never have to wait until the next evening session when stuck on a bug, design constraint, or product-research metric.\n\n- Lesson Q&A Threads: Ask questions directly inside any lesson classroom or from the Lesson Q&A tab in your Student Dashboard.\n- Instructor Resolution: Only your assigned cohort instructor and academic admins see and answer your thread, tagging resolved solutions so the entire cohort benefits cleanly.",
      category: "Assignments, Quizzes & Projects",
      order: 10,
    },
    {
      question: "How do employers verify an IT SkillCore graduation certificate?",
      answer:
        "Every certificate features a unique immutable Credential ID (such as `CERT-ITSKILLCORE-2025`) and an embedded QR code pointing directly to our public verification portal (`/verify/[certId]`).\n\n- Instant Public Audit: Employers scanning the QR code or searching the ID see the graduate's name, verified completion date, cohort curriculum & outcomes, live attendance percentage, capstone grade average, and real-time Active vs. Revoked registry status.",
      category: "Certificates & Public Portfolio",
      order: 11,
    },
    {
      question: "What is the Public Graduate Portfolio and how do I share it?",
      answer:
        "Every IT SkillCore student automatically receives a verifiable public showcase page at `/portfolio/[studentId]`, accessible via a 1-click link in your Student Dashboard sidebar and Certificates tab.\n\n- Verified Evidence for Recruiters: Unlike static PDF resumes, your portfolio displays live verified attendance totals, enrolled cohorts, graded capstone assignment scores with mentor feedback, and active credential badges linked directly to the verification registry.",
      category: "Certificates & Public Portfolio",
      order: 12,
    },
    {
      question: "Can I download a high-resolution PDF copy of my certificate?",
      answer:
        "Yes. Once you pass the 75% Attendance & Capstone Gate (and Admin finalizes cohort sign-off if applicable), you can claim your certificate directly in the Certificates tab.\n\n- Architectural A4 Executive PDF: Download a print-ready A4 landscape PDF designed in IT SkillCore's Pine & Lime executive layout complete with the official verification seal, authorised signatory, QR verification matrix, and verified merit metrics.",
      category: "Certificates & Public Portfolio",
      order: 13,
    },
    {
      question: "What career tracks are offered, including Amazon FBA and TikTok Shop?",
      answer:
        "IT SkillCore offers six flagship 3-month live cohort tracks tailored for both global remote engineering roles and high-growth digital commerce.\n\n- Engineering & Data: Full-Stack Web Development with Next.js & MERN, UI/UX Design Foundations & Product Strategy, and Data Analysis & Machine Learning with Python.\n- Digital & Social Commerce: Digital Marketing Strategy & Growth Hacking, Amazon FBA Private Label & Wholesale Mastery, and TikTok Shop & Viral Social Commerce.",
      category: "Programs & Career Readiness",
      order: 14,
    },
    {
      question: "Do I need prior coding or e-commerce experience before enrolling?",
      answer:
        "No prior industry experience is required for our foundational cohorts. Programs such as UI/UX Design, Data Analysis with Python, Amazon FBA, and TikTok Shop start cleanly from Day 1 orientation and environment setup.\n\n- Intermediate Tracks: Full-Stack Next.js & MERN moves purposefully from semantic HTML/JavaScript foundations into production APIs and cloud deployments.\n- Free Lesson Preview: Every course syllabus page unlocks Week 1 Day 1 material as a free preview so you can inspect lecture notes and teaching depth before applying.",
      category: "Programs & Career Readiness",
      order: 15,
    },
  ]);

  // 9. Blogs
  await Blog.deleteMany({});
  await Blog.insertMany([
    {
      title: "Why 5-Day-a-Week Live Cohorts Produce 4x Higher Hiring Rates",
      slug: "live-cohorts-vs-self-paced",
      coverImage: "/images/blog-1.jpg",
      author: "Engr. Hamza Farooq",
      tags: ["Bootcamp", "Career Growth", "Online Learning"],
      excerpt: "Self-paced tutorials have an 8% completion rate. Discover why interactive 5-day live cohort learning with peer code reviews accelerates tech careers.",
      content: [
        "In the early days of online learning, pre-recorded video catalogues promised to democratize tech education. A decade later, the data tells a stark truth: passive self-paced video libraries suffer from an alarming 92% dropout rate.",
        "IT SkillCore's 3-month model is built on active live cohorts. Attending class 5 days a week at 8:00 PM creates routine, accountability, and real momentum.",
        "When an instructor reviews your pull request live or debugs a race condition in front of your cohort, the lessons stick permanently. Spaced daily practice consistently outperforms weekend cramming.",
        "Every chapter culminates in a graded homework submission, slide downloads, and milestone quizzes that construct a verifiable engineering portfolio.",
      ].join("\n\n"),
    },
    {
      title: "The Ultimate Next.js 14 & MERN Roadmap for 2025",
      slug: "nextjs-mern-roadmap-2025",
      coverImage: "/images/blog-2.jpg",
      author: "IT SkillCore Academic Team",
      tags: ["Next.js", "Full-Stack", "JavaScript"],
      excerpt: "From TypeScript foundations to Server Components and MongoDB aggregations: the complete step-by-step curriculum to becoming a senior full-stack engineer.",
      content: [
        "Modern web development has moved past simple client-side SPAs. Today's high-paying engineering roles demand mastery of server-driven architectures, edge runtimes, and strict type safety.",
        "Our 12-week Full-Stack curriculum moves deliberately from JavaScript engine mechanics through React 18 component lifecycles, culminating in production Next.js 14 App Router patterns.",
        "On the backend, you'll master Express REST APIs, MongoDB aggregation pipelines, and production JWT authentication with HttpOnly cookies to thwart XSS and CSRF attacks.",
        "By graduation, you don't just possess theoretical knowledge—you have 4 live deployed web applications on your resume and a verified certificate employers can check in seconds.",
      ].join("\n\n"),
    },
    {
      title: "How to Build a World-Class UX Case Study in Figma",
      slug: "build-killer-ux-case-study",
      coverImage: "/images/blog-3.jpg",
      author: "Amira Khan",
      tags: ["UI/UX", "Figma", "Portfolio"],
      excerpt: "Design recruiters spend less than 90 seconds on your portfolio. Learn how to showcase business impact, user empathy, and interactive prototypes.",
      content: [
        "A common mistake junior designers make is presenting pretty Dribbble shots without explaining the problem, the constraints, or the user research that informed the decisions.",
        "Design hiring leads at top tech companies want to see your thinking process: Why did you choose this information hierarchy? What failed during usability testing? How did the final layout improve conversion rates?",
        "In the IT SkillCore UI/UX Masterclass, students learn the 5 Planes of UX, master Figma Auto Layout and Variables, and publish comprehensive case studies ready for global design agencies.",
      ].join("\n\n"),
    },
  ]);

  // 10. Instructor Tenant Assignment, Sample Live Attendance PIN & Leave Request
  await User.findByIdAndUpdate(instructorUser._id, {
    $set: {
      title: "Principal Full-Stack Architect",
      bio: "12+ years mentoring full-stack Next.js, Node.js, Python, and E-Commerce cohorts at IT SkillCore.",
      assignedCourses: [webDevCourse._id, pythonCourse._id, amazonCourse._id].filter(Boolean),
    },
  });
  await Course.updateMany(
    { _id: { $in: [webDevCourse._id, pythonCourse._id, amazonCourse?._id].filter(Boolean) } },
    { $set: { assignedInstructor: instructorUser._id, batchCode: "Batch 01", maxSeats: 40 } }
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  await AttendanceSession.findOneAndUpdate(
    { course: webDevCourse._id, dateKey: todayKey },
    {
      $set: {
        instructor: instructorUser._id,
        lessonTitle: "Live Interactive Lecture & Code Review",
        code: "SC4829",
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      },
    },
    { upsert: true, new: true }
  );

  const leaveDateKey = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await LeaveRequest.findOneAndUpdate(
    { student: student._id, course: webDevCourse._id, dateKey: leaveDateKey },
    {
      $setOnInsert: {
        reason: "Scheduled university mid-term exam; will review the full recording tonight.",
        status: "PENDING",
      },
    },
    { upsert: true, new: true }
  );

  // 11. Sample Coupons / Scholarships & Admissions Leads
  await Promise.all([
    Coupon.findOneAndUpdate(
      { code: "ITSC25" },
      {
        $setOnInsert: {
          code: "ITSC25",
          discountType: "PERCENT",
          discountValue: 25,
          description: "Early-Bird Cohort Grant (25% off tuition)",
          maxUses: 200,
          isActive: true,
        },
      },
      { upsert: true }
    ),
    Coupon.findOneAndUpdate(
      { code: "SCHOLAR50" },
      {
        $setOnInsert: {
          code: "SCHOLAR50",
          discountType: "PERCENT",
          discountValue: 50,
          description: "Merit Scholarship Waiver (50% tuition reduction)",
          maxUses: 50,
          isActive: true,
        },
      },
      { upsert: true }
    ),
  ]);

  if ((await ContactMessage.countDocuments()) === 0) {
    await ContactMessage.insertMany([
      {
        name: "Saad Mahmood",
        email: "saad.mahmood@example.pk",
        subject: "Scholarship inquiry for Amazon FBA Batch 01",
        message: "Assalam-o-Alaikum, I am a final-year BBA student in Lahore interested in the upcoming Amazon FBA Private Label cohort. Are merit scholarship codes still open for Batch 01?",
        status: "NEW",
      },
      {
        name: "Hira Farooq",
        email: "hira.farooq@example.pk",
        subject: "Corporate team training for 5 developers",
        message: "We want to enroll 5 junior frontend engineers in your Mon–Fri Full-Stack Next.js cohort. Can we pay via Meezan Bank IBAN?",
        status: "RESOLVED",
        adminNotes: "Shared IBAN details and corporate invoice schedule via email.",
        resolvedAt: new Date(),
      },
    ]);
  }

  return NextResponse.json({
    ok: true,
    message: "IT SkillCore database successfully seeded with 3-Month 5-Day/Week Cohort curriculum, live schedules, presentations, assignments, submissions, quizzes, broadcasts, instructor tenant, and test accounts.",
    seededCourses: seededCourses.length,
    seededAssignments: assignmentsToInsert.length,
    seededSubmissions: submissionsToInsert.length,
    seededQuizzes: quizzesToInsert.length,
  });
}
