/**
 * CampusOS Demo Seed Script.
 *
 * Creates a seeded demo account with pre-loaded data so the app is
 * immediately understandable during a hackathon demo.
 *
 * Run: cd backend && npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

import User from '../src/models/user.js';
import Timetable from '../src/models/timetable.js';
import Attendance from '../src/models/attendance.js';
import Expense from '../src/models/expense.js';
import ExpenseBudget from '../src/models/expense-budget.js';
import Document from '../src/models/document.js';
import KnowledgeResource from '../src/models/knowledge-resource.js';
import GoodSeniorPoints from '../src/models/good-senior-points.js';
import BurnoutRecord from '../src/models/burnout-record.js';
import Notification from '../src/models/notification.js';

const MONGODB_URI = process.env.MONGODB_URI;

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const daysFromNow = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};
const getCurrentMonth = () => {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // --- Create or update demo user ---
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@campusos.app' },
      {
        email: 'demo@campusos.app',
        name: 'Arjun Kumar',
        isDemo: true,
        college: 'IIT Delhi',
        semester: 5,
        branch: 'Computer Science & Engineering',
      },
      { upsert: true, new: true }
    );
    const userId = demoUser._id;
    console.log('Demo user created:', userId.toString());

    // --- Timetable (Subjects with schedule) ---
    await Timetable.deleteMany({ userId });
    const subjects = await Timetable.insertMany([
      { userId, name: 'Data Structures & Algorithms', code: 'CS201', faculty: 'Dr. Sharma', day: 'monday', startTime: '09:00', endTime: '10:00', room: 'LH-101', targetThreshold: 75 },
      { userId, name: 'Data Structures & Algorithms', code: 'CS201', faculty: 'Dr. Sharma', day: 'wednesday', startTime: '09:00', endTime: '10:00', room: 'LH-101', targetThreshold: 75 },
      { userId, name: 'Data Structures & Algorithms', code: 'CS201', faculty: 'Dr. Sharma', day: 'friday', startTime: '09:00', endTime: '10:00', room: 'LH-101', targetThreshold: 75 },
      { userId, name: 'Operating Systems', code: 'CS301', faculty: 'Prof. Gupta', day: 'monday', startTime: '11:00', endTime: '12:00', room: 'LH-202', targetThreshold: 75 },
      { userId, name: 'Operating Systems', code: 'CS301', faculty: 'Prof. Gupta', day: 'thursday', startTime: '11:00', endTime: '12:00', room: 'LH-202', targetThreshold: 75 },
      { userId, name: 'Computer Networks', code: 'CS302', faculty: 'Dr. Patel', day: 'tuesday', startTime: '10:00', endTime: '11:00', room: 'LH-303', targetThreshold: 75 },
      { userId, name: 'Computer Networks', code: 'CS302', faculty: 'Dr. Patel', day: 'thursday', startTime: '10:00', endTime: '11:00', room: 'LH-303', targetThreshold: 75 },
      { userId, name: 'DBMS', code: 'CS303', faculty: 'Prof. Singh', day: 'tuesday', startTime: '14:00', endTime: '15:00', room: 'LH-104', targetThreshold: 75 },
      { userId, name: 'DBMS', code: 'CS303', faculty: 'Prof. Singh', day: 'friday', startTime: '14:00', endTime: '15:00', room: 'LH-104', targetThreshold: 75 },
      { userId, name: 'DSA Lab', code: 'CS201L', faculty: 'Dr. Sharma', day: 'wednesday', startTime: '14:00', endTime: '16:00', room: 'Lab-3', targetThreshold: 80 },
    ]);
    console.log(`Timetable seeded: ${subjects.length} entries`);

    // --- Attendance Records (last 3 weeks) ---
    await Attendance.deleteMany({ userId });
    const dsaSubjects = subjects.filter((s) => s.code === 'CS201');
    const osSubjects = subjects.filter((s) => s.code === 'CS301');
    const cnSubjects = subjects.filter((s) => s.code === 'CS302');
    const dbmsSubjects = subjects.filter((s) => s.code === 'CS303');

    const attendanceRecords = [];
    const statuses = ['attended', 'attended', 'attended', 'attended', 'missed', 'attended', 'skipped'];

    for (let i = 1; i <= 18; i++) {
      const date = daysAgo(i);
      const dayOfWeek = date.getDay();

      // DSA (Mon, Wed, Fri)
      if ([1, 3, 5].includes(dayOfWeek) && dsaSubjects.length > 0) {
        attendanceRecords.push({
          userId,
          subjectId: dsaSubjects[0]._id,
          date,
          status: statuses[i % statuses.length],
        });
      }
      // OS (Mon, Thu)
      if ([1, 4].includes(dayOfWeek) && osSubjects.length > 0) {
        attendanceRecords.push({
          userId,
          subjectId: osSubjects[0]._id,
          date,
          status: i === 5 ? 'cancelled' : statuses[(i + 1) % statuses.length],
        });
      }
      // CN (Tue, Thu)
      if ([2, 4].includes(dayOfWeek) && cnSubjects.length > 0) {
        attendanceRecords.push({
          userId,
          subjectId: cnSubjects[0]._id,
          date,
          status: statuses[(i + 2) % statuses.length],
        });
      }
      // DBMS (Tue, Fri)
      if ([2, 5].includes(dayOfWeek) && dbmsSubjects.length > 0) {
        attendanceRecords.push({
          userId,
          subjectId: dbmsSubjects[0]._id,
          date,
          status: i === 10 ? 'holiday' : statuses[(i + 3) % statuses.length],
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`Attendance seeded: ${attendanceRecords.length} records`);

    // --- Expenses (last 2 weeks) ---
    await Expense.deleteMany({ userId });
    const expenses = [
      { userId, amount: 120, date: daysAgo(0), merchant: 'Campus Canteen', description: 'Lunch - rice and dal', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 45, date: daysAgo(0), merchant: 'Tea Point', description: 'Tea and biscuits', category: 'food', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 250, date: daysAgo(1), merchant: 'Auto Stand', description: 'Auto to Sarojini Nagar', category: 'travel', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 350, date: daysAgo(2), merchant: 'Amazon', description: 'Graph Theory textbook', category: 'academics', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 200, date: daysAgo(3), merchant: 'PVR Cinemas', description: 'Movie with friends', category: 'entertainment', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 1500, date: daysAgo(4), merchant: 'Hostel Mess', description: 'Monthly mess fee', category: 'hostel', paymentMode: 'bank_transfer', source: 'manual' },
      { userId, amount: 80, date: daysAgo(5), merchant: 'Xerox Shop', description: 'Assignment printout', category: 'academics', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 150, date: daysAgo(6), merchant: 'Dominos', description: 'Late night pizza', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 60, date: daysAgo(7), merchant: 'Metro', description: 'Metro to Hauz Khas', category: 'travel', paymentMode: 'card', source: 'manual' },
      { userId, amount: 500, date: daysAgo(8), merchant: 'Flipkart', description: 'Phone charger cable', category: 'shopping', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 300, date: daysAgo(9), merchant: 'Airtel', description: 'Mobile recharge', category: 'bills', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 180, date: daysAgo(10), merchant: 'Medical Store', description: 'Cold medicine', category: 'medical', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 90, date: daysAgo(11), merchant: 'Chai Sutta Bar', description: 'Coffee with study group', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 400, date: daysAgo(12), merchant: 'Uber', description: 'Cab to internship interview', category: 'travel', paymentMode: 'upi', source: 'manual' },
    ];
    await Expense.insertMany(expenses);
    console.log(`Expenses seeded: ${expenses.length} records`);

    // --- Budgets ---
    await ExpenseBudget.deleteMany({ userId });
    const month = getCurrentMonth();
    await ExpenseBudget.insertMany([
      { userId, category: 'food', limit: 5000, month },
      { userId, category: 'travel', limit: 2000, month },
      { userId, category: 'academics', limit: 3000, month },
      { userId, category: 'entertainment', limit: 1500, month },
      { userId, category: 'hostel', limit: 2000, month },
      { userId, category: 'shopping', limit: 2000, month },
    ]);
    console.log('Budgets seeded: 6 categories');

    // --- Documents (with confirmed extraction) ---
    await Document.deleteMany({ userId });
    await Document.insertMany([
      {
        userId,
        fileName: 'DSA_Assignment_3.pdf',
        fileKey: `${userId}/documents/demo-dsa-assignment.pdf`,
        fileType: 'application/pdf',
        fileSize: 245000,
        category: 'assignment',
        extractedData: {
          title: 'DSA Assignment 3 - Trees and Graphs',
          dates: [{ label: 'Due Date', date: daysFromNow(3).toISOString().split('T')[0] }],
          subjects: ['Data Structures & Algorithms'],
          keyInfo: ['Implement BFS and DFS', 'Minimum spanning tree problem', 'Submit on Moodle'],
        },
        possibleInfo: [],
        status: 'confirmed',
        source: 'upload',
      },
      {
        userId,
        fileName: 'OS_Midsem_Notice.pdf',
        fileKey: `${userId}/documents/demo-os-midsem.pdf`,
        fileType: 'application/pdf',
        fileSize: 120000,
        category: 'exam',
        extractedData: {
          title: 'Operating Systems Mid-Semester Examination',
          dates: [{ label: 'Exam Date', date: daysFromNow(7).toISOString().split('T')[0] }],
          subjects: ['Operating Systems'],
          keyInfo: ['Syllabus: Processes, Threads, Scheduling, Deadlocks', 'Duration: 2 hours', 'Venue: Exam Hall 1'],
        },
        possibleInfo: [{ field: 'Total Marks', value: '40', confidence: 0.8 }],
        status: 'confirmed',
        source: 'upload',
      },
      {
        userId,
        fileName: 'Placement_Drive_TCS.docx',
        fileKey: `${userId}/documents/demo-placement-tcs.docx`,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 89000,
        category: 'placement',
        extractedData: {
          title: 'TCS NQT Placement Drive Registration',
          dates: [{ label: 'Registration Deadline', date: daysFromNow(5).toISOString().split('T')[0] }],
          subjects: [],
          keyInfo: ['Eligibility: 60% and above', 'Register on placement portal', 'Carry ID card and resume'],
        },
        possibleInfo: [],
        status: 'confirmed',
        source: 'upload',
      },
    ]);
    console.log('Documents seeded: 3 confirmed uploads');

    // --- Knowledge Resources ---
    await KnowledgeResource.deleteMany({ userId });
    const resources = await KnowledgeResource.insertMany([
      {
        userId,
        type: 'notes',
        title: 'Binary Search Tree - Complete Notes',
        subject: 'Data Structures & Algorithms',
        description: 'Comprehensive notes on BST operations: insertion, deletion, traversal, balancing.',
        content: '# Binary Search Tree\n\n## Properties\n- Left subtree contains only nodes with keys less than parent\n- Right subtree contains only nodes with keys greater than parent\n\n## Operations\n- Search: O(log n) average\n- Insert: O(log n) average\n- Delete: O(log n) average',
      },
      {
        userId,
        type: 'pyq',
        title: 'OS Mid-Sem 2024 - Previous Year Paper',
        subject: 'Operating Systems',
        description: 'Last year mid-semester paper with solutions for process scheduling and deadlocks.',
        content: 'Q1. Explain Round Robin scheduling with quantum = 4ms.\nQ2. Prove that the Banker\'s algorithm is safe.\nQ3. Compare preemptive vs non-preemptive scheduling.',
      },
      {
        userId,
        type: 'professor_review',
        title: 'Dr. Sharma - DSA',
        subject: 'Data Structures & Algorithms',
        description: 'Very thorough explanations. Assignments are challenging but fair. Gives bonus marks for creative solutions.',
        rating: 4,
      },
    ]);
    console.log(`Knowledge resources seeded: ${resources.length}`);

    // --- Good Senior Points ---
    await GoodSeniorPoints.deleteMany({ userId });
    await GoodSeniorPoints.create({
      userId,
      totalPoints: 3,
      contributions: resources.map((r) => ({
        resourceId: r._id,
        type: r.type,
        pointsEarned: 1,
        date: daysAgo(2),
      })),
    });
    console.log('Good Senior Points seeded: 3 points');

    // --- Burnout Records (last 10 days) ---
    await BurnoutRecord.deleteMany({ userId });
    const burnoutRecords = [];
    for (let i = 0; i < 10; i++) {
      const mood = Math.max(1, Math.min(5, 4 - Math.floor(i / 4))); // Declining mood
      const sleep = [7, 6.5, 6, 5.5, 7, 6, 5, 7.5, 6, 5.5][i];
      const workload = [2, 3, 3, 4, 3, 4, 4, 3, 4, 5][i]; // Increasing workload

      burnoutRecords.push({
        userId,
        mood,
        sleepHours: sleep,
        workloadEstimate: workload,
        pendingTasksCount: 2 + Math.floor(i / 3),
        lateNightSpending: i === 7, // One late-night spending instance
        score: Math.min(100, 25 + i * 5),
        level: i < 4 ? 'low' : i < 7 ? 'medium' : 'high',
        date: daysAgo(i),
      });
    }
    await BurnoutRecord.insertMany(burnoutRecords);
    console.log(`Burnout records seeded: ${burnoutRecords.length}`);

    // --- Notifications ---
    await Notification.deleteMany({ userId });
    await Notification.insertMany([
      {
        userId,
        title: 'DSA Assignment Due Soon',
        message: 'DSA Assignment 3 (Trees and Graphs) is due in 3 days.',
        type: 'deadline',
        priority: 'urgent',
        isRead: false,
        relatedEntity: { type: 'document', id: null },
      },
      {
        userId,
        title: 'OS Mid-Sem Next Week',
        message: 'Operating Systems mid-semester exam is in 7 days. Start revising!',
        type: 'deadline',
        priority: 'normal',
        isRead: false,
        relatedEntity: { type: 'document', id: null },
      },
      {
        userId,
        title: 'TCS Registration Closing',
        message: 'TCS NQT placement drive registration closes in 5 days.',
        type: 'deadline',
        priority: 'normal',
        isRead: false,
        relatedEntity: { type: 'document', id: null },
      },
      {
        userId,
        title: 'Attendance Warning',
        message: 'Your Operating Systems attendance is approaching the 75% threshold.',
        type: 'attendance',
        priority: 'normal',
        isRead: true,
      },
      {
        userId,
        title: 'Food Budget Alert',
        message: 'You have used 80% of your monthly food budget.',
        type: 'budget',
        priority: 'low',
        isRead: true,
      },
    ]);
    console.log('Notifications seeded: 5 alerts');

    console.log('\n✅ Demo data seeded successfully!');
    console.log('Demo login email: demo@campusos.app');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
