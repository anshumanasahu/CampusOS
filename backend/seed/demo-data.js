/**
 * CampusOS Demo Seed Script.
 *
 * Creates a seeded demo account with pre-loaded data so the app is
 * immediately understandable during a hackathon demo.
 *
 * Profile: Anshuman A Sahu, NIT Raipur, CSE, Semester 5
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

    // ═══ Demo User — Anshuman A Sahu, NIT Raipur ═══
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@campusos.app' },
      {
        email: 'demo@campusos.app',
        name: 'Anshuman A Sahu',
        isDemo: true,
        college: 'National Institute of Technology Raipur',
        semester: 5,
        branch: 'Computer Science & Engineering',
      },
      { upsert: true, new: true }
    );
    const userId = demoUser._id;
    console.log('Demo user:', userId.toString());

    // ═══ Timetable — NIT Raipur CSE Sem 5 ═══
    await Timetable.deleteMany({ userId });
    const subjects = await Timetable.insertMany([
      { userId, name: 'Data Structures & Algorithms', code: 'CS301', faculty: 'Dr. R.K. Pandey', day: 'monday', startTime: '09:00', endTime: '10:00', room: 'LHC-201', targetThreshold: 75 },
      { userId, name: 'Data Structures & Algorithms', code: 'CS301', faculty: 'Dr. R.K. Pandey', day: 'wednesday', startTime: '09:00', endTime: '10:00', room: 'LHC-201', targetThreshold: 75 },
      { userId, name: 'Data Structures & Algorithms', code: 'CS301', faculty: 'Dr. R.K. Pandey', day: 'friday', startTime: '09:00', endTime: '10:00', room: 'LHC-201', targetThreshold: 75 },
      { userId, name: 'Operating Systems', code: 'CS302', faculty: 'Prof. S.K. Jain', day: 'monday', startTime: '11:00', endTime: '12:00', room: 'CSE Dept-103', targetThreshold: 75 },
      { userId, name: 'Operating Systems', code: 'CS302', faculty: 'Prof. S.K. Jain', day: 'thursday', startTime: '11:00', endTime: '12:00', room: 'CSE Dept-103', targetThreshold: 75 },
      { userId, name: 'Computer Networks', code: 'CS303', faculty: 'Dr. Preeti Gupta', day: 'tuesday', startTime: '10:00', endTime: '11:00', room: 'LHC-105', targetThreshold: 75 },
      { userId, name: 'Computer Networks', code: 'CS303', faculty: 'Dr. Preeti Gupta', day: 'thursday', startTime: '10:00', endTime: '11:00', room: 'LHC-105', targetThreshold: 75 },
      { userId, name: 'Database Management Systems', code: 'CS304', faculty: 'Prof. A.K. Sharma', day: 'tuesday', startTime: '14:00', endTime: '15:00', room: 'CSE Dept-201', targetThreshold: 75 },
      { userId, name: 'Database Management Systems', code: 'CS304', faculty: 'Prof. A.K. Sharma', day: 'friday', startTime: '14:00', endTime: '15:00', room: 'CSE Dept-201', targetThreshold: 75 },
      { userId, name: 'DSA Lab', code: 'CS301P', faculty: 'Dr. R.K. Pandey', day: 'wednesday', startTime: '14:00', endTime: '16:00', room: 'Computer Center Lab-2', targetThreshold: 80 },
    ]);
    console.log(`Timetable: ${subjects.length} entries`);

    // ═══ Attendance ═══
    await Attendance.deleteMany({ userId });
    const dsaSub = subjects.filter((s) => s.code === 'CS301');
    const osSub = subjects.filter((s) => s.code === 'CS302');
    const cnSub = subjects.filter((s) => s.code === 'CS303');
    const dbmsSub = subjects.filter((s) => s.code === 'CS304');
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

    // ═══ Expenses — Localized to Raipur ═══
    await Expense.deleteMany({ userId });
    await Expense.insertMany([
      // Already purchased academic items
      { userId, amount: 1200, date: daysAgo(14), merchant: 'Amazon', description: 'Casio FX-991EX Scientific Calculator', category: 'academics', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 420, date: daysAgo(12), merchant: 'Raipur Book House', description: 'Engineering Drawing Kit', category: 'academics', paymentMode: 'cash', source: 'manual' },
      // Regular expenses — Raipur life
      { userId, amount: 80, date: daysAgo(0), merchant: 'NIT Canteen', description: 'Lunch - thali', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 30, date: daysAgo(0), merchant: 'Campus Chai Stall', description: 'Chai and samosa', category: 'food', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 150, date: daysAgo(1), merchant: 'Auto', description: 'Auto to GE Road market', category: 'travel', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 350, date: daysAgo(2), merchant: 'Raipur Book House', description: 'DBMS textbook (Korth)', category: 'academics', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 250, date: daysAgo(3), merchant: 'PVR Magneto Mall', description: 'Movie with friends', category: 'entertainment', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 1400, date: daysAgo(4), merchant: 'Hostel Mess', description: 'Monthly mess fee', category: 'hostel', paymentMode: 'bank_transfer', source: 'manual' },
      { userId, amount: 60, date: daysAgo(5), merchant: 'Campus Xerox', description: 'Assignment printout', category: 'academics', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 180, date: daysAgo(6), merchant: "Domino's Telibandha", description: 'Late night pizza after coding', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 40, date: daysAgo(7), merchant: 'City Bus', description: 'Bus to Pandri Market', category: 'travel', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 500, date: daysAgo(8), merchant: 'Reliance Smart', description: 'Shampoo, soap, snacks', category: 'shopping', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 299, date: daysAgo(9), merchant: 'Jio', description: 'Mobile recharge', category: 'bills', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 120, date: daysAgo(10), merchant: 'Medical Store', description: 'Crocin and cold medicine', category: 'medical', paymentMode: 'cash', source: 'manual' },
      { userId, amount: 100, date: daysAgo(11), merchant: 'Amul Parlour', description: 'Ice cream with hostel friends', category: 'food', paymentMode: 'upi', source: 'manual' },
      { userId, amount: 300, date: daysAgo(12), merchant: 'Ola', description: 'Cab to Railway Station', category: 'travel', paymentMode: 'upi', source: 'manual' },
    ]);
    console.log('Expenses: 16 records');

    // ═══ Budgets ═══
    await ExpenseBudget.deleteMany({ userId });
    const month = getCurrentMonth();
    await ExpenseBudget.insertMany([
      { userId, category: 'food', limit: 4000, month },
      { userId, category: 'travel', limit: 1500, month },
      { userId, category: 'academics', limit: 4000, month },
      { userId, category: 'entertainment', limit: 1200, month },
      { userId, category: 'hostel', limit: 1800, month },
      { userId, category: 'shopping', limit: 1500, month },
    ]);
    console.log('Budgets: 6 categories');

    // ═══ Documents — NIT Raipur context ═══
    await Document.deleteMany({ userId });
    await Document.insertMany([
      {
        userId,
        fileName: 'NIT_Raipur_Sem5_Syllabus.pdf',
        fileKey: `${userId}/documents/demo-syllabus.pdf`,
        fileType: 'application/pdf',
        fileSize: 195000,
        category: 'attendance',
        extractedData: {
          title: 'NIT Raipur CSE Semester V - Course Requirements',
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
        fileName: 'Hostel_Allotment_Guide.pdf',
        fileKey: `${userId}/documents/demo-hostel-guide.pdf`,
        fileType: 'application/pdf',
        fileSize: 88000,
        category: 'hostel_notice',
        extractedData: {
          title: 'NIT Raipur Hostel Move-In Essentials',
          dates: [],
          subjects: [],
          keyInfo: [
            'Mattress and pillow required (not provided)',
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
          keyInfo: ['Implement BFS and DFS', 'Minimum Spanning Tree problem', 'Submit on Moodle portal'],
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
          keyInfo: ['Syllabus: Processes, Threads, Scheduling, Deadlocks', 'Duration: 2 hours', 'Venue: LHC Exam Hall'],
        },
        status: 'confirmed',
        source: 'upload',
      },
      {
        userId,
        fileName: 'TnP_TCS_Notice.pdf',
        fileKey: `${userId}/documents/demo-placement-tcs.pdf`,
        fileType: 'application/pdf',
        fileSize: 92000,
        category: 'placement',
        extractedData: {
          title: 'TCS NQT Campus Drive - NIT Raipur',
          dates: [{ label: 'Registration Deadline', date: daysFromNow(5).toISOString().split('T')[0] }],
          subjects: [],
          keyInfo: ['Eligibility: 60% and above, no active backlogs', 'Register on Training & Placement portal', 'Carry college ID and updated resume'],
        },
        status: 'confirmed',
        source: 'upload',
      },
    ]);
    console.log('Documents: 5 confirmed uploads');

    // ═══ Shopping Items — Student essentials ═══
    await ShoppingItem.deleteMany({ userId });
    await ShoppingItem.insertMany([
      { userId, title: 'Casio FX-991EX Scientific Calculator', category: 'electronics', source: 'ai_detected', reason: 'Required for practical sessions (Semester V Syllabus)', priority: 'high', estimatedCost: 1200, purchased: true, amazonSearchUrl: 'https://www.amazon.in/s?k=Casio+FX-991EX+Scientific+Calculator' },
      { userId, title: 'Engineering Drawing Kit', category: 'stationery', source: 'ai_detected', reason: 'Recommended by Semester V Syllabus', priority: 'medium', estimatedCost: 420, purchased: true, amazonSearchUrl: 'https://www.amazon.in/s?k=Engineering+Drawing+Kit' },
      { userId, title: 'White Lab Coat (Full Sleeve)', category: 'lab', source: 'ai_detected', reason: 'Mandatory for laboratory courses starting next week', priority: 'high', estimatedCost: 650, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=White+Lab+Coat+Full+Sleeve+Student' },
      { userId, title: 'Database System Concepts (Korth)', category: 'books', source: 'ai_detected', reason: 'DBMS textbook recommended for coursework', priority: 'medium', estimatedCost: 850, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Database+System+Concepts+Korth' },
      { userId, title: 'Extension Board (4 socket, surge protection)', category: 'hostel', source: 'ai_detected', reason: 'Hostel essential - strongly recommended', priority: 'medium', estimatedCost: 550, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Extension+Board+4+Socket+Surge+Protection' },
      { userId, title: 'Hostel Pillow (Memory Foam)', category: 'hostel', source: 'ai_detected', reason: 'Hostel move-in essential', priority: 'low', estimatedCost: 450, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=Memory+Foam+Pillow+Students' },
      { userId, title: 'LED Study Lamp (USB rechargeable)', category: 'hostel', source: 'ai_detected', reason: 'Study lamp for late-night coding sessions', priority: 'low', estimatedCost: 600, purchased: false, amazonSearchUrl: 'https://www.amazon.in/s?k=LED+Study+Lamp+USB+Rechargeable' },
    ]);
    console.log('Shopping Items: 7 (2 purchased, 5 pending)');

    // ═══ Knowledge Resources — NIT Raipur CSE ═══
    await KnowledgeResource.deleteMany({ userId });
    const resources = await KnowledgeResource.insertMany([
      { userId, type: 'notes', title: 'Binary Search Tree - Complete Notes', subject: 'Data Structures & Algorithms', description: 'BST operations: insertion, deletion, traversal, balancing. Covers AVL trees.', content: '# Binary Search Tree\n\n## Properties\n- Left < Parent < Right\n\n## Operations\n- Search: O(log n)\n- Insert: O(log n)\n- Delete: O(log n)\n\n## AVL Rotation\n- LL, RR, LR, RL cases' },
      { userId, type: 'pyq', title: 'OS Mid-Sem 2024 - NIT Raipur', subject: 'Operating Systems', description: 'Last year mid-semester paper with process scheduling and deadlock questions.', content: 'Q1. Explain Round Robin scheduling (quantum=4ms)\nQ2. Prove Banker\'s algorithm safety\nQ3. Compare preemptive vs non-preemptive\nQ4. Dining Philosophers Problem' },
      { userId, type: 'professor_review', title: 'Dr. R.K. Pandey - DSA', subject: 'Data Structures & Algorithms', description: 'Excellent teacher. Explains concepts with real-world examples. Assignments are tough but fair. Gives bonus marks for creative solutions in lab.', rating: 4 },
    ]);
    console.log(`Knowledge Resources: ${resources.length}`);

    // ═══ Good Senior Points ═══
    await GoodSeniorPoints.deleteMany({ userId });
    await GoodSeniorPoints.create({
      userId, totalPoints: 30,
      contributions: resources.map((r) => ({ resourceId: r._id, type: r.type, pointsEarned: 10, date: daysAgo(3) })),
    });
    console.log('Senior Points: 30');

    // ═══ Burnout Records — realistic college life ═══
    await BurnoutRecord.deleteMany({ userId });
    const burnouts = [];
    // Simulates: good start → increasing pressure from assignments + placement prep → recovery attempt
    const moods = [4, 4, 3, 3, 3, 2, 2, 3, 2, 2];
    const sleeps = [7, 6.5, 6, 5.5, 7, 5, 4.5, 6, 5, 5];
    const workloads = [3, 3, 4, 5, 4, 5, 5, 4, 5, 5];
    for (let i = 0; i < 10; i++) {
      burnouts.push({
        userId,
        mood: moods[i],
        sleepHours: sleeps[i],
        workloadEstimate: workloads[i],
        pendingTasksCount: 2 + Math.floor(i / 3),
        lateNightSpending: i === 5 || i === 9, // Late night pizza/coding sessions
        score: Math.min(100, 20 + i * 6),
        level: i < 3 ? 'low' : i < 7 ? 'medium' : 'high',
        date: daysAgo(i),
      });
    }
    await BurnoutRecord.insertMany(burnouts);
    console.log('Burnout: 10 records (low → medium → high trend)');

    // ═══ Focus Session ═══
    await FocusSession.deleteMany({ userId });
    await FocusSession.create({
      userId, burnoutLevel: 'medium', workload: 6, sleepScore: 5, mood: 3,
      recommendation: 'Two 45-minute focused study sessions with a 15-minute break. Prioritize OS revision.',
      playlistType: 'deep_focus', duration: 90, reason: 'Upcoming OS midsem + assignment deadline',
    });
    console.log('Focus Session: 1 recommendation');

    // ═══ Notifications — NIT Raipur context ═══
    await Notification.deleteMany({ userId });
    await Notification.insertMany([
      { userId, title: 'DSA Assignment Due Soon', message: 'DSA Assignment 3 (Trees & Graphs) is due in 3 days. Submit on Moodle.', type: 'deadline', priority: 'urgent', isRead: false },
      { userId, title: 'OS Mid-Sem Next Week', message: 'Operating Systems mid-semester exam at LHC Exam Hall in 7 days.', type: 'deadline', priority: 'normal', isRead: false },
      { userId, title: 'TCS Registration Closing', message: 'TCS NQT campus drive registration via T&P portal closes in 5 days.', type: 'deadline', priority: 'normal', isRead: false },
      { userId, title: 'Lab Coat Required', message: 'Lab Coat is mandatory for next week\'s practical at Computer Center Lab-2.', type: 'general', priority: 'normal', isRead: false },
      { userId, title: 'Attendance Warning - OS', message: 'Your Operating Systems attendance is approaching the 75% threshold.', type: 'attendance', priority: 'normal', isRead: true },
      { userId, title: 'Food Budget Alert', message: 'You have used 75% of your monthly food budget (₹3,000/₹4,000).', type: 'budget', priority: 'low', isRead: true },
    ]);
    console.log('Notifications: 6 alerts');

    console.log('\n✅ Demo data seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo login: demo@campusos.app');
    console.log('Profile: Anshuman A Sahu, NIT Raipur');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nMarketplace:');
    console.log('  ✓ 5 pending items (Lab Coat, DBMS Book, Extension Board, Pillow, Lamp)');
    console.log('  ✓ 2 purchased items (Calculator, Drawing Kit)');
    console.log('  ✓ Supporting documents (NIT Raipur Syllabus, Hostel Guide)');
    console.log('  ✓ Purchase expenses tracked');
    console.log('  ✓ Amazon search links generated');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
