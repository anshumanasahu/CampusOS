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
import ShoppingItem from '../src/models/shopping-item.js';
import FocusSession from '../src/models/focus-session.js';

const MONGODB_URI = process.env.MONGODB_URI;

const today = new Date();
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
const getCurrentMonth = () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // ═══ Demo User ═══
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@campusos.app' },
      { email: 'demo@campusos.app', name: 'Arjun Kumar', isDemo: true, college: 'IIT Delhi', semester: 5, branch: 'Computer Science & Engineering' },
      { upsert: true, new: true }
    );
    const userId = demoUser._id;
    console.log('Demo user:', userId.toString());

    // ═══ Timetable ═══
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
    console.log(`Timetable: ${subjects.length} entries`);

    // ═══ Attendance ═══
    await Attendance.deleteMany({ userId });
    const dsaSub = subjects.filter((s) => s.code === 'CS201');
    const osSub = subjects.filter((s) => s.code === 'CS301');
    const cnSub = subjects.filter((s) => s.code === 'CS302');
    const dbmsSub = subjects.filter((s) => s.code === 'CS303');
    const statuses = ['attended', 'attended', 'attended', 'attended', 'missed', 'attended', 'skipped'];
    const attRecords = [];
    for (let i = 1; i <= 18; i++) {
      const date = daysAgo(i);
      const dow = date.getDay();
      if ([1, 3, 5].includes(dow) && dsaSub.length) attRecords.push({ userId, subjectId: dsaSub[0]._id, date, status: statuses[i % 7] });
      if ([1, 4].includes(dow) && osSub.length) attRecords.push({ userId, subjectId: osSub[0]._id, date, status: i === 5 ? 'cancelled' : statuses[(i + 1) % 7] });
      if ([2, 4].includes(dow) && cnSub.length) attRecords.push({ userId, subjectId: cnSub[0]._id, date, status: statuses[(i + 2) % 7] });
      if ([2, 5].includes(dow) && dbmsSub.length) attRecords.push({ userId, subjectId: dbmsSub[0]._id, date, status: i === 10 ? 'holiday' : statuses[(i + 3) % 7] });
    }
    await Attendance.insertMany(attRecords);
    console.log(`Attendance: ${attRecords.length} records`);

    // ═══ Expenses (includes already-purchased items) ═══
    await Expense.deleteMany({ userId });
    await Expense.insertMany([
      // Already purchased academic items (supports shopping AI reasoning)
      { userId, amount: 1200, date: daysAgo(14), merchant: 'Amazon', description: 'Casio FX-991ES Scientific Calculator', category: 'academics', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 450, date: daysAgo(12), merchant: 'Campus Store', description: 'Engineering Drawing Kit', category: 'academics', paymentMode: 'cash', source: 'manual' },
      // Regular expenses
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
    ]);
    console.log('Expenses: 15 records');

    // ═══ Budgets ═══
    await ExpenseBudget.deleteMany({ userId });
    const month = getCurrentMonth();
    await ExpenseBudget.insertMany([
      { userId, category: 'food', limit: 5000, month },
      { userId, category: 'travel', limit: 2000, month },
      { userId, category: 'academics', limit: 5000, month },
      { userId, category: 'entertainment', limit: 1500, month },
      { userId, category: 'hostel', limit: 2000, month },
      { userId, category: 'shopping', limit: 2000, month },
    ]);
    console.log('Budgets: 6 categories');

    // ═══ Documents (including Syllabus + Hostel Guide for shopping AI) ═══
    await Document.deleteMany({ userId });
    await Document.insertMany([
      {
        userId,
        fileName: 'Semester_V_Syllabus.pdf',
        fileKey: `${userId}/documents/demo-syllabus.pdf`,
        fileType: 'application/pdf',
        fileSize: 180000,
        category: 'attendance',
        extractedData: {
          title: 'Semester V Course Requirements',
          dates: [],
          subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'DBMS'],
          keyInfo: [
            'Scientific Calculator required for practical sessions',
            'Lab Coat mandatory for laboratory courses',
            'Engineering Drawing Kit recommended',
            'DBMS Textbook (Korth) recommended for coursework',
          ],
        },
        status: 'confirmed',
        source: 'upload',
      },
      {
        userId,
        fileName: 'Hostel_Guide.pdf',
        fileKey: `${userId}/documents/demo-hostel-guide.pdf`,
        fileType: 'application/pdf',
        fileSize: 95000,
        category: 'hostel_notice',
        extractedData: {
          title: 'Hostel Move-In Essentials Guide',
          dates: [],
          subjects: [],
          keyInfo: [
            'Mattress and pillow required',
            'Bucket and mug for bathroom',
            'Extension board strongly recommended',
            'Study lamp for late-night work',
            'Water bottle (1L minimum)',
          ],
        },
        status: 'confirmed',
        source: 'upload',
      },
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
        status: 'confirmed',
        source: 'upload',
      },
    ]);
    console.log('Documents: 5 confirmed uploads');

    // ═══ Shopping Items (Amazon Marketplace) ═══
    await ShoppingItem.deleteMany({ userId });
    await ShoppingItem.insertMany([
      // Already purchased (tracked for AI awareness)
      { userId, title: 'Casio FX-991ES Scientific Calculator', category: 'electronics', source: 'ai_detected', reason: 'Required for practical sessions (Semester V Syllabus)', priority: 'high', estimatedCost: 1200, purchased: true, amazonSearchUrl: 'https://www.amazon.in/s?k=Casio+FX-991ES+Scientific+Calculator' },
      { userId, title: 'Engineering Drawing Kit', category: 'stationery', source: 'ai_detected', reason: 'Recommended by Semester V Syllabus', priority: 'medium', estimatedCost: 450, purchased: true, amazonSearchUrl: 'https://www.amazon.in/s?k=Engineering+Drawing+Kit' },
      // Still needed — high priority
      { userId, title: 'Lab Coat (White, Full Sleeve)', category: 'lab', source: 'ai_detected', reason: 'Mandatory for laboratory courses starting next week', priority: 'high', estimatedCost: 800, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=White+Lab+Coat+Full+Sleeve' },
      // Still needed — medium priority
      { userId, title: 'Database System Concepts (Korth)', category: 'books', source: 'ai_detected', reason: 'DBMS textbook recommended for coursework', priority: 'medium', estimatedCost: 900, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Database+System+Concepts+Korth' },
      { userId, title: 'Extension Board (4 socket, surge protection)', category: 'hostel', source: 'ai_detected', reason: 'Hostel essential - strongly recommended', priority: 'medium', estimatedCost: 600, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Extension+Board+4+Socket+Surge+Protection' },
      // Still needed — low priority
      { userId, title: 'Hostel Pillow (Memory Foam)', category: 'hostel', source: 'ai_detected', reason: 'Hostel move-in essential', priority: 'low', estimatedCost: 500, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Memory+Foam+Pillow+Students' },
      { userId, title: 'LED Study Lamp (USB rechargeable)', category: 'hostel', source: 'ai_detected', reason: 'Study lamp for late-night work', priority: 'low', estimatedCost: 700, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=LED+Study+Lamp+USB+Rechargeable' },
    ]);
    console.log('Shopping Items: 7 (2 purchased, 5 pending)');

    // ═══ Knowledge Resources ═══
    await KnowledgeResource.deleteMany({ userId });
    const resources = await KnowledgeResource.insertMany([
      { userId, type: 'notes', title: 'Binary Search Tree - Complete Notes', subject: 'Data Structures & Algorithms', description: 'BST operations: insertion, deletion, traversal, balancing.', content: '# BST\n- Search: O(log n)\n- Insert: O(log n)\n- Delete: O(log n)' },
      { userId, type: 'pyq', title: 'OS Mid-Sem 2024 Paper', subject: 'Operating Systems', description: 'Previous year paper with scheduling and deadlock questions.', content: 'Q1. Round Robin (quantum=4ms)\nQ2. Banker\'s algorithm\nQ3. Preemptive vs non-preemptive' },
      { userId, type: 'professor_review', title: 'Dr. Sharma - DSA', subject: 'Data Structures & Algorithms', description: 'Thorough explanations. Challenging but fair assignments. Bonus marks for creativity.', rating: 4 },
    ]);
    console.log(`Knowledge Resources: ${resources.length}`);

    // ═══ Good Senior Points ═══
    await GoodSeniorPoints.deleteMany({ userId });
    await GoodSeniorPoints.create({
      userId, totalPoints: 30,
      contributions: resources.map((r) => ({ resourceId: r._id, type: r.type, pointsEarned: 10, date: daysAgo(2) })),
    });
    console.log('Senior Points: 30');

    // ═══ Burnout Records ═══
    await BurnoutRecord.deleteMany({ userId });
    const burnouts = [];
    for (let i = 0; i < 10; i++) {
      burnouts.push({
        userId,
        mood: Math.max(1, Math.min(5, 4 - Math.floor(i / 4))),
        sleepHours: [7, 6.5, 6, 5.5, 7, 6, 5, 7.5, 6, 5.5][i],
        workloadEstimate: [2, 3, 3, 4, 3, 4, 4, 3, 4, 5][i],
        pendingTasksCount: 2 + Math.floor(i / 3),
        lateNightSpending: i === 7,
        score: Math.min(100, 25 + i * 5),
        level: i < 4 ? 'low' : i < 7 ? 'medium' : 'high',
        date: daysAgo(i),
      });
    }
    await BurnoutRecord.insertMany(burnouts);
    console.log('Burnout: 10 records');

    // ═══ Focus Session (latest) ═══
    await FocusSession.deleteMany({ userId });
    await FocusSession.create({
      userId, burnoutLevel: 'medium', workload: 4, sleepScore: 6, mood: 3,
      recommendation: 'One 90-minute deep study session with a 15-minute break.',
      playlistType: 'deep_focus', duration: 90, reason: 'Upcoming exam + medium burnout',
    });
    console.log('Focus Session: 1 recommendation');

    // ═══ Notifications ═══
    await Notification.deleteMany({ userId });
    await Notification.insertMany([
      { userId, title: 'DSA Assignment Due Soon', message: 'DSA Assignment 3 (Trees and Graphs) is due in 3 days.', type: 'deadline', priority: 'urgent', isRead: false },
      { userId, title: 'OS Mid-Sem Next Week', message: 'Operating Systems mid-semester exam is in 7 days.', type: 'deadline', priority: 'normal', isRead: false },
      { userId, title: 'TCS Registration Closing', message: 'TCS NQT placement drive registration closes in 5 days.', type: 'deadline', priority: 'normal', isRead: false },
      { userId, title: 'Lab Coat Required', message: 'Lab Coat is mandatory for next week\'s practical. Purchase it soon.', type: 'general', priority: 'normal', isRead: false },
      { userId, title: 'Attendance Warning - OS', message: 'Your Operating Systems attendance is approaching the 75% threshold.', type: 'attendance', priority: 'normal', isRead: true },
      { userId, title: 'Food Budget Alert', message: 'You have used 80% of your monthly food budget.', type: 'budget', priority: 'low', isRead: true },
    ]);
    console.log('Notifications: 6 alerts');

    console.log('\n✅ Demo data seeded successfully!');
    console.log('Demo login email: demo@campusos.app');
    console.log('\nMarketplace ready:');
    console.log('  ✓ 5 pending items (Lab Coat, DBMS Book, Extension Board, Pillow, Lamp)');
    console.log('  ✓ 2 purchased items (Calculator, Drawing Kit)');
    console.log('  ✓ Supporting documents (Syllabus, Hostel Guide)');
    console.log('  ✓ Purchase expenses tracked');
    console.log('  ✓ Amazon search links generated');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
