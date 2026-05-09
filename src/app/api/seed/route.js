import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { withDB } from '@/lib/mongodb';

import Tenant from '@/models/Tenant';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import AIAgentConfig from '@/models/AIAgentConfig';
import Flow from '@/models/Flow';
import Template from '@/models/Template';
import Broadcast from '@/models/Broadcast';
import Subscription from '@/models/Subscription';
import WebhookEvent from '@/models/WebhookEvent';

const SEED_KEY = 'seed_demo_2024';
const DEMO_SLUG = 'glamour-hair-studio-demo';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(h, m = 0) {
  return new Date(Date.now() - (h * 60 + m) * 60 * 1000);
}

function minutesAgo(n) {
  return new Date(Date.now() - n * 60 * 1000);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== SEED_KEY) {
    return NextResponse.json({ error: 'Unauthorized. Pass ?key=seed_demo_2024' }, { status: 401 });
  }

  await withDB();

  // ── Wipe old demo data ──────────────────────────────────────────────────────
  const oldTenant = await Tenant.findOne({ slug: DEMO_SLUG });
  if (oldTenant) {
    const tid = oldTenant._id;
    await Promise.all([
      User.deleteMany({ tenantId: tid }),
      Contact.deleteMany({ tenantId: tid }),
      Conversation.deleteMany({ tenantId: tid }),
      Message.deleteMany({ tenantId: tid }),
      AIAgentConfig.deleteMany({ tenantId: tid }),
      Flow.deleteMany({ tenantId: tid }),
      Template.deleteMany({ tenantId: tid }),
      Broadcast.deleteMany({ tenantId: tid }),
      Subscription.deleteMany({ tenantId: tid }),
      WebhookEvent.deleteMany({ tenantId: tid }),
      Tenant.deleteOne({ _id: tid }),
    ]);
  }

  // ── 1. Tenant ───────────────────────────────────────────────────────────────
  const tenant = await Tenant.create({
    businessName: 'Glamour Hair Studio',
    slug: DEMO_SLUG,
    wabaId: '102938475610293',
    phoneNumberId: '567890123456789',
    accessToken: 'EAADemo_access_token_for_testing_purposes_only',
    verifiedName: 'Glamour Hair Studio',
    waConnected: true,
    plan: 'pro',
    isActive: true,
    createdAt: daysAgo(90),
  });
  const tid = tenant._id;

  // ── 2. Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo@1234', 10);

  const [owner, agentPriya, agentRahul] = await User.create([
    {
      tenantId: tid,
      name: 'Sachin (Owner)',
      email: 'demo@glamourhair.com',
      password: passwordHash,
      role: 'owner',
      isActive: true,
      onboardingComplete: true,
      createdAt: daysAgo(90),
    },
    {
      tenantId: tid,
      name: 'Priya Patel',
      email: 'priya@glamourhair.com',
      password: passwordHash,
      role: 'agent',
      isActive: true,
      onboardingComplete: true,
      createdAt: daysAgo(60),
    },
    {
      tenantId: tid,
      name: 'Rahul Mehta',
      email: 'rahul@glamourhair.com',
      password: passwordHash,
      role: 'admin',
      isActive: true,
      onboardingComplete: true,
      createdAt: daysAgo(45),
    },
  ]);

  // ── 3. AI Agent Config ──────────────────────────────────────────────────────
  await AIAgentConfig.create({
    tenantId: tid,
    isEnabled: true,
    agentName: 'Aria',
    systemPrompt: `You are Aria, a friendly and knowledgeable AI assistant for Glamour Hair Studio, a premium hair care and treatment clinic based in Mumbai. Your role is to help potential clients understand our services, answer questions about hair loss treatments, hair transplants, PRP therapy, and general hair care.

Be warm, empathetic and professional. Ask qualifying questions to understand the client's needs. Our treatments range from ₹5,000 for basic PRP to ₹1,50,000 for full hair transplant. Always encourage clients to book a free consultation. Do not make medical guarantees. If a client seems ready to book or asks to speak with someone, trigger a handover.`,
    qualifyingQuestions: [
      'What is your main hair concern today?',
      'How long have you been experiencing this issue?',
      'Have you tried any treatments before?',
      'What is your approximate budget for treatment?',
    ],
    tagRules: [
      { keyword: 'hair loss', tag: 'hair-loss', stage: 'qualified' },
      { keyword: 'bald', tag: 'hair-loss', stage: 'qualified' },
      { keyword: 'transplant', tag: 'hair-transplant', stage: 'qualified' },
      { keyword: 'prp', tag: 'interested', stage: 'qualified' },
      { keyword: 'price', tag: 'hot-lead', stage: 'qualified' },
      { keyword: 'cost', tag: 'hot-lead', stage: 'qualified' },
      { keyword: 'book', tag: 'appointment', stage: 'booked' },
      { keyword: 'appointment', tag: 'appointment', stage: 'booked' },
    ],
    handoverTriggers: ['speak to agent', 'human', 'real person', 'call me', 'speak to doctor'],
    welcomeMessage:
      'Hi! 👋 I\'m Aria from Glamour Hair Studio. I\'m here to help you with all your hair care queries. What brings you here today?',
    fallbackMessage:
      'I didn\'t quite catch that. Could you please rephrase? Or type "agent" to speak with one of our specialists.',
    contextWindow: 10,
    language: 'en',
    updatedAt: daysAgo(5),
  });

  // ── 4. Contacts (15) ────────────────────────────────────────────────────────
  const contactData = [
    {
      phone: '919820001001',
      name: 'Anjali Sharma',
      email: 'anjali.sharma@email.com',
      tags: ['hot-lead', 'hair-loss'],
      stage: 'qualified',
      isAIHandled: true,
      lastMessageAt: minutesAgo(15),
      createdAt: daysAgo(12),
    },
    {
      phone: '919820001002',
      name: 'Rohit Kumar',
      email: 'rohit.kumar@email.com',
      tags: ['interested', 'appointment'],
      stage: 'booked',
      isAIHandled: false,
      assignedAgent: agentPriya._id,
      lastMessageAt: hoursAgo(2),
      createdAt: daysAgo(18),
    },
    {
      phone: '919820001003',
      name: 'Sneha Gupta',
      email: 'sneha.gupta@email.com',
      tags: ['vip', 'premium', 'converted'],
      stage: 'converted',
      isAIHandled: false,
      assignedAgent: owner._id,
      lastMessageAt: daysAgo(3),
      createdAt: daysAgo(45),
    },
    {
      phone: '919820001004',
      name: 'Aakash Singh',
      email: 'aakash.singh@email.com',
      tags: ['cold-lead'],
      stage: 'new',
      isAIHandled: true,
      lastMessageAt: hoursAgo(5),
      createdAt: daysAgo(2),
    },
    {
      phone: '919820001005',
      name: 'Meera Joshi',
      email: 'meera.joshi@email.com',
      tags: ['cold-lead'],
      stage: 'lost',
      isAIHandled: false,
      lastMessageAt: daysAgo(20),
      createdAt: daysAgo(35),
    },
    {
      phone: '919820001006',
      name: 'Vikram Nair',
      email: 'vikram.nair@email.com',
      tags: ['hot-lead', 'hair-transplant'],
      stage: 'qualified',
      isAIHandled: true,
      lastMessageAt: minutesAgo(45),
      createdAt: daysAgo(7),
    },
    {
      phone: '919820001007',
      name: 'Pooja Reddy',
      email: 'pooja.reddy@email.com',
      tags: ['appointment', 'hair-loss'],
      stage: 'booked',
      isAIHandled: false,
      assignedAgent: agentRahul._id,
      lastMessageAt: hoursAgo(1),
      createdAt: daysAgo(10),
    },
    {
      phone: '919820001008',
      name: 'Deepak Verma',
      email: 'deepak.verma@email.com',
      tags: ['vip', 'converted'],
      stage: 'converted',
      isAIHandled: false,
      assignedAgent: owner._id,
      lastMessageAt: daysAgo(5),
      createdAt: daysAgo(60),
    },
    {
      phone: '919820001009',
      name: 'Kavya Iyer',
      email: 'kavya.iyer@email.com',
      tags: [],
      stage: 'new',
      isAIHandled: true,
      lastMessageAt: minutesAgo(5),
      createdAt: daysAgo(1),
    },
    {
      phone: '919820001010',
      name: 'Arjun Bansal',
      email: 'arjun.bansal@email.com',
      tags: ['hot-lead', 'interested'],
      stage: 'qualified',
      isAIHandled: false,
      assignedAgent: agentPriya._id,
      lastMessageAt: hoursAgo(3),
      createdAt: daysAgo(14),
    },
    {
      phone: '919820001011',
      name: 'Riya Chakraborty',
      email: 'riya.chakraborty@email.com',
      tags: ['appointment'],
      stage: 'booked',
      isAIHandled: false,
      assignedAgent: agentPriya._id,
      lastMessageAt: hoursAgo(4),
      createdAt: daysAgo(9),
    },
    {
      phone: '919820001012',
      name: 'Suresh Pillai',
      email: 'suresh.pillai@email.com',
      tags: ['vip', 'premium', 'converted'],
      stage: 'converted',
      isAIHandled: false,
      lastMessageAt: daysAgo(8),
      createdAt: daysAgo(75),
    },
    {
      phone: '919820001013',
      name: 'Neha Agarwal',
      email: 'neha.agarwal@email.com',
      tags: ['cold-lead'],
      stage: 'new',
      isAIHandled: true,
      lastMessageAt: hoursAgo(6),
      createdAt: daysAgo(3),
    },
    {
      phone: '919820001014',
      name: 'Manish Tiwari',
      email: 'manish.tiwari@email.com',
      tags: [],
      stage: 'lost',
      isAIHandled: false,
      lastMessageAt: daysAgo(25),
      createdAt: daysAgo(40),
    },
    {
      phone: '919820001015',
      name: 'Priyanka Dubey',
      email: 'priyanka.dubey@email.com',
      tags: ['hot-lead', 'hair-loss', 'interested'],
      stage: 'qualified',
      isAIHandled: true,
      lastMessageAt: minutesAgo(30),
      createdAt: daysAgo(5),
    },
  ];

  const contacts = await Contact.create(
    contactData.map((c) => ({ tenantId: tid, ...c }))
  );

  // ── 5. Conversations + Messages ─────────────────────────────────────────────
  const convDefs = [
    // Anjali — ai_active, ongoing hair loss chat
    {
      idx: 0,
      status: 'ai_active',
      unreadCount: 2,
      lastMessageAt: minutesAgo(15),
      msgs: [
        { dir: 'inbound', content: 'Hi', sentBy: 'contact', t: minutesAgo(120) },
        { dir: 'outbound', content: "Hi! 👋 I'm Aria from Glamour Hair Studio. I'm here to help you with all your hair care queries. What brings you here today?", sentBy: 'ai', t: minutesAgo(119) },
        { dir: 'inbound', content: 'I have been facing severe hair loss for the past 6 months', sentBy: 'contact', t: minutesAgo(118) },
        { dir: 'outbound', content: "I'm sorry to hear that, Anjali. Hair loss can be quite distressing. Could you tell me more — is it patchy hair loss, or thinning all over? And have you noticed any other symptoms like scalp irritation?", sentBy: 'ai', t: minutesAgo(117) },
        { dir: 'inbound', content: 'It is thinning all over, especially at the crown. No irritation', sentBy: 'contact', t: minutesAgo(60) },
        { dir: 'outbound', content: 'Thank you for sharing that. Diffuse thinning at the crown is often linked to hormonal changes or nutritional deficiencies. At Glamour Hair Studio, we offer a free scalp analysis and PRP therapy starting from ₹8,000 per session. Would you like to know more about our treatment options?', sentBy: 'ai', t: minutesAgo(59) },
        { dir: 'inbound', content: 'What is PRP and how many sessions would I need?', sentBy: 'contact', t: minutesAgo(20) },
        { dir: 'outbound', content: 'PRP (Platelet-Rich Plasma) therapy uses your own blood plasma to stimulate hair follicles. For diffuse thinning, we typically recommend 6 sessions spaced 4 weeks apart. Most clients see visible improvement by session 3! 🌟 Would you like to book a free consultation to assess your specific case?', sentBy: 'ai', t: minutesAgo(19) },
        { dir: 'inbound', content: 'Yes that sounds good. What is the total cost?', sentBy: 'contact', t: minutesAgo(16) },
        { dir: 'outbound', content: 'For a 6-session PRP package, we offer it at ₹42,000 (saving ₹6,000 vs individual sessions). We also have EMI options! 💳 To give you an exact plan and pricing, I\'d recommend a free in-person consultation. Shall I help you book one?', sentBy: 'ai', t: minutesAgo(15) },
      ],
    },
    // Rohit — human_takeover by Priya
    {
      idx: 1,
      status: 'human_takeover',
      assignedAgent: agentPriya._id,
      unreadCount: 0,
      lastMessageAt: hoursAgo(2),
      msgs: [
        { dir: 'inbound', content: 'Hello, I want to book an appointment for hair transplant', sentBy: 'contact', t: hoursAgo(5) },
        { dir: 'outbound', content: "Hello Rohit! 👋 I'm Aria. Wonderful — I can help you with that. May I ask a few questions first? How many years have you been experiencing hair loss?", sentBy: 'ai', t: hoursAgo(4, 59) },
        { dir: 'inbound', content: 'About 5 years. I am at Norwood stage 4', sentBy: 'contact', t: hoursAgo(4, 50) },
        { dir: 'outbound', content: 'Thank you for that detail. Norwood 4 is a good candidate for FUE hair transplant. Our FUE procedures start at ₹60,000 for 1500 grafts. Would you like to speak to one of our specialist doctors to discuss your case in detail?', sentBy: 'ai', t: hoursAgo(4, 49) },
        { dir: 'inbound', content: 'Yes please, I want to speak to a real person', sentBy: 'contact', t: hoursAgo(4, 30) },
        { dir: 'outbound', content: 'Of course! I\'ll connect you with our specialist right away. 🙏', sentBy: 'ai', t: hoursAgo(4, 29) },
        { dir: 'outbound', content: 'Hi Rohit! This is Priya from Glamour Hair Studio. I have reviewed your query. Can we schedule a free video consultation with Dr. Kapoor this week?', sentBy: 'agent', t: hoursAgo(3) },
        { dir: 'inbound', content: 'Yes, Thursday at 11am would be perfect', sentBy: 'contact', t: hoursAgo(2, 30) },
        { dir: 'outbound', content: 'Great! I have booked your consultation with Dr. Kapoor on Thursday at 11:00 AM. You will receive a confirmation shortly. Is there anything else I can help with?', sentBy: 'agent', t: hoursAgo(2) },
      ],
    },
    // Sneha — resolved, converted VIP client
    {
      idx: 2,
      status: 'resolved',
      assignedAgent: owner._id,
      unreadCount: 0,
      lastMessageAt: daysAgo(3),
      msgs: [
        { dir: 'inbound', content: 'Hi I had my 6th PRP session last week and my hair growth is amazing!', sentBy: 'contact', t: daysAgo(4) },
        { dir: 'outbound', content: 'That is absolutely wonderful to hear, Sneha! 🎉 We are so happy with your progress. Dr. Kapoor mentioned your last scan showed 40% density improvement!', sentBy: 'agent', t: daysAgo(4) },
        { dir: 'inbound', content: 'Yes! I am so happy. My friends have been asking what I did', sentBy: 'contact', t: daysAgo(4) },
        { dir: 'outbound', content: 'Amazing! 🌟 If any friends need hair care help, we offer a referral discount of ₹2,000 off their first treatment. Would you like to share our number with them?', sentBy: 'agent', t: daysAgo(3, 23) },
        { dir: 'inbound', content: 'Absolutely will do. Thank you so much for everything!', sentBy: 'contact', t: daysAgo(3) },
        { dir: 'outbound', content: 'Thank you for being such a wonderful client, Sneha! We look forward to seeing you for your maintenance session next month. Take care! 💚', sentBy: 'agent', t: daysAgo(3) },
      ],
    },
    // Aakash — ai_active, cold lead, just started
    {
      idx: 3,
      status: 'ai_active',
      unreadCount: 1,
      lastMessageAt: hoursAgo(5),
      msgs: [
        { dir: 'inbound', content: 'Hello', sentBy: 'contact', t: hoursAgo(6) },
        { dir: 'outbound', content: "Hi Aakash! 👋 Welcome to Glamour Hair Studio. How can I help you today? Are you looking for hair care advice, treatment information, or would you like to book an appointment?", sentBy: 'ai', t: hoursAgo(5, 59) },
        { dir: 'inbound', content: 'Just checking what services you have', sentBy: 'contact', t: hoursAgo(5) },
        { dir: 'outbound', content: "Great question! We offer:\n\n💊 PRP Therapy (from ₹8,000)\n✂️ FUE Hair Transplant (from ₹60,000)\n🧴 Scalp Treatments (from ₹3,000)\n💆 Hair Growth Laser Therapy (from ₹5,000)\n\nAll treatments are performed by certified trichologists. Would you like more details on any specific service?", sentBy: 'ai', t: hoursAgo(5) },
      ],
    },
    // Meera — resolved, lost lead
    {
      idx: 4,
      status: 'resolved',
      unreadCount: 0,
      lastMessageAt: daysAgo(20),
      msgs: [
        { dir: 'inbound', content: 'Hi how much does hair transplant cost', sentBy: 'contact', t: daysAgo(22) },
        { dir: 'outbound', content: 'Hi Meera! Our FUE hair transplant starts from ₹60,000 for 1500 grafts. The exact cost depends on your donor area and graft requirement. Would you like a free assessment?', sentBy: 'ai', t: daysAgo(22) },
        { dir: 'inbound', content: 'That seems too expensive for me right now', sentBy: 'contact', t: daysAgo(21) },
        { dir: 'outbound', content: "I completely understand! We do offer EMI options and also have more affordable treatments like PRP starting from ₹8,000 that can help slow hair loss. Would that be of interest?", sentBy: 'ai', t: daysAgo(21) },
        { dir: 'inbound', content: 'Maybe later. Thanks', sentBy: 'contact', t: daysAgo(20) },
        { dir: 'outbound', content: "No problem at all, Meera! Whenever you're ready, we're here. We'll send you occasional updates on our offers. Take care! 😊", sentBy: 'ai', t: daysAgo(20) },
      ],
    },
    // Vikram — ai_active, hair transplant inquiry
    {
      idx: 5,
      status: 'ai_active',
      unreadCount: 3,
      lastMessageAt: minutesAgo(45),
      msgs: [
        { dir: 'inbound', content: 'I need info about hair transplant', sentBy: 'contact', t: hoursAgo(3) },
        { dir: 'outbound', content: "Hi Vikram! 👋 Great, you've come to the right place. We specialize in FUE hair transplants with a 95% success rate. Could I ask a few questions to give you a better quote? How would you describe your current hair loss?", sentBy: 'ai', t: hoursAgo(2, 59) },
        { dir: 'inbound', content: 'I am completely bald at the top. Only sides and back have hair', sentBy: 'contact', t: hoursAgo(2, 30) },
        { dir: 'outbound', content: 'That sounds like Norwood stage 6-7. For this level, we typically recommend 3000-4000 grafts. Our package for that range is ₹1,20,000 - ₹1,50,000 with lifetime consultation support included. This is a one-time permanent solution! 💪', sentBy: 'ai', t: hoursAgo(2, 29) },
        { dir: 'inbound', content: 'What is the recovery time?', sentBy: 'contact', t: hoursAgo(1) },
        { dir: 'outbound', content: 'Recovery is quite straightforward:\n\n📅 Day 1-3: Minor swelling, rest advised\n📅 Day 4-10: Scabs form and fall naturally\n📅 Day 14: Return to normal work\n📅 Month 3-4: New hair starts growing\n📅 Month 12: Full result visible\n\nMost clients take just 2-3 days off work. Would you like to see before/after photos from our clients?', sentBy: 'ai', t: hoursAgo(0, 59) },
        { dir: 'inbound', content: 'Yes send me photos', sentBy: 'contact', t: minutesAgo(50) },
        { dir: 'outbound', content: 'Here are some of our recent FUE results! Our in-clinic portfolio has 200+ cases. For personalized photos matching your hair type, I\'d recommend a free consultation. Shall I book one for you? 📸', sentBy: 'ai', t: minutesAgo(49) },
        { dir: 'inbound', content: 'Ok how do I book a free consultation', sentBy: 'contact', t: minutesAgo(46) },
        { dir: 'outbound', content: 'Wonderful! 🎉 Our free consultations are available Mon-Sat, 10am-7pm at our Mumbai clinic. Just share your preferred date and time and I\'ll reserve a slot for you with Dr. Kapoor, our senior trichologist!', sentBy: 'ai', t: minutesAgo(45) },
      ],
    },
    // Pooja — open, assigned to Rahul
    {
      idx: 6,
      status: 'open',
      assignedAgent: agentRahul._id,
      unreadCount: 1,
      lastMessageAt: hoursAgo(1),
      msgs: [
        { dir: 'inbound', content: 'Hi I have an appointment tomorrow but need to reschedule', sentBy: 'contact', t: hoursAgo(2) },
        { dir: 'outbound', content: "Hi Pooja! Of course, I can help with that. Could you share your appointment time so I can look it up?", sentBy: 'agent', t: hoursAgo(1, 45) },
        { dir: 'inbound', content: 'It was for 2pm with Dr Kapoor', sentBy: 'contact', t: hoursAgo(1) },
        { dir: 'outbound', content: "Got it. Let me check available slots and get back to you shortly.", sentBy: 'agent', t: minutesAgo(55) },
      ],
    },
    // Deepak — resolved, VIP
    {
      idx: 7,
      status: 'resolved',
      assignedAgent: owner._id,
      unreadCount: 0,
      lastMessageAt: daysAgo(5),
      msgs: [
        { dir: 'inbound', content: 'My 12 month post-transplant photos are ready. Results are incredible!', sentBy: 'contact', t: daysAgo(6) },
        { dir: 'outbound', content: 'Deepak! This is fantastic news! 🎉 We would love to see your photos. Would you be comfortable letting us feature your transformation (anonymized) in our success stories?', sentBy: 'agent', t: daysAgo(6) },
        { dir: 'inbound', content: 'Happy to help. You can use my case. Best decision I ever made', sentBy: 'contact', t: daysAgo(5, 12) },
        { dir: 'outbound', content: 'Thank you so much, Deepak! Your story will inspire so many people. We will send you the consent form shortly. As a VIP client, you also have a complimentary annual scalp check due — shall we schedule that?', sentBy: 'agent', t: daysAgo(5) },
      ],
    },
    // Kavya — ai_active, brand new
    {
      idx: 8,
      status: 'ai_active',
      unreadCount: 1,
      lastMessageAt: minutesAgo(5),
      msgs: [
        { dir: 'inbound', content: 'Hello, someone recommended your clinic to me', sentBy: 'contact', t: minutesAgo(10) },
        { dir: 'outbound', content: "Hi Kavya! Welcome to Glamour Hair Studio! 🌟 We're so glad you reached out. What brought you to us — are you looking for hair loss treatment, general hair care, or something else?", sentBy: 'ai', t: minutesAgo(9) },
        { dir: 'inbound', content: 'Hair fall after pregnancy', sentBy: 'contact', t: minutesAgo(5) },
        { dir: 'outbound', content: 'Post-partum hair loss is very common and completely treatable! 💚 It usually stabilizes within 6-12 months, but we can speed up recovery with targeted nutritional therapy and PRP. How old is your baby if you don\'t mind me asking?', sentBy: 'ai', t: minutesAgo(4) },
      ],
    },
    // Arjun — human_takeover, Priya handling
    {
      idx: 9,
      status: 'human_takeover',
      assignedAgent: agentPriya._id,
      unreadCount: 0,
      lastMessageAt: hoursAgo(3),
      msgs: [
        { dir: 'inbound', content: 'I got a quote from another clinic for ₹40,000. Can you match it?', sentBy: 'contact', t: hoursAgo(5) },
        { dir: 'outbound', content: "Hi Arjun! I appreciate you sharing that. Can I ask what treatment the ₹40,000 quote is for? I want to make sure we're comparing like for like.", sentBy: 'ai', t: hoursAgo(4, 59) },
        { dir: 'inbound', content: 'FUE transplant 2000 grafts', sentBy: 'contact', t: hoursAgo(4, 30) },
        { dir: 'outbound', content: "For 2000 FUE grafts, our price starts at ₹80,000 which includes lifetime aftercare. I'd recommend speaking with our specialist who can explain the quality difference. Shall I connect you?", sentBy: 'ai', t: hoursAgo(4, 29) },
        { dir: 'inbound', content: 'Yes I need to talk to someone', sentBy: 'contact', t: hoursAgo(4) },
        { dir: 'outbound', content: 'Hi Arjun! This is Priya. I understand you have a competing quote. Let me explain why Glamour Hair Studio offers better long-term value...', sentBy: 'agent', t: hoursAgo(3, 30) },
        { dir: 'inbound', content: 'OK I am listening', sentBy: 'contact', t: hoursAgo(3) },
      ],
    },
    // Riya — open, booked appointment
    {
      idx: 10,
      status: 'open',
      assignedAgent: agentPriya._id,
      unreadCount: 2,
      lastMessageAt: hoursAgo(4),
      msgs: [
        { dir: 'outbound', content: 'Hi Riya! 🌟 This is Priya from Glamour Hair Studio. Your scalp treatment appointment is confirmed for tomorrow at 3:30 PM. Please arrive 10 minutes early for a quick assessment. See you then!', sentBy: 'agent', t: daysAgo(1) },
        { dir: 'inbound', content: 'Thank you! Will I need to wash my hair before coming?', sentBy: 'contact', t: hoursAgo(5) },
        { dir: 'inbound', content: 'Also should I avoid any products?', sentBy: 'contact', t: hoursAgo(4) },
      ],
    },
    // Suresh — resolved, VIP long-term
    {
      idx: 11,
      status: 'resolved',
      unreadCount: 0,
      lastMessageAt: daysAgo(8),
      msgs: [
        { dir: 'inbound', content: 'Just completed my annual maintenance package. Wonderful service as always!', sentBy: 'contact', t: daysAgo(9) },
        { dir: 'outbound', content: 'Thank you so much, Suresh! It is always a pleasure having you. Your scalp health has been exceptional this year. See you for your quarterly check in March! 🙏', sentBy: 'agent', t: daysAgo(8) },
      ],
    },
    // Neha — ai_active, cold lead
    {
      idx: 12,
      status: 'ai_active',
      unreadCount: 1,
      lastMessageAt: hoursAgo(6),
      msgs: [
        { dir: 'inbound', content: 'Do you treat dandruff?', sentBy: 'contact', t: hoursAgo(7) },
        { dir: 'outbound', content: "Hi Neha! Yes, we have an excellent Anti-Dandruff & Scalp Health program. We first identify whether it's dry scalp, seborrheic dermatitis, or fungal dandruff, then create a customized treatment plan. Sessions start from ₹2,500. Interested in learning more?", sentBy: 'ai', t: hoursAgo(6, 59) },
        { dir: 'inbound', content: 'Yes but I live in Pune. Do you have a branch there?', sentBy: 'contact', t: hoursAgo(6) },
        { dir: 'outbound', content: "Currently we only have our Mumbai clinic, but we do offer online consultations! A trichologist can review your photos and prescribe a home treatment plan. Would an online consultation work for you?", sentBy: 'ai', t: hoursAgo(6) },
      ],
    },
    // Manish — resolved, lost
    {
      idx: 13,
      status: 'resolved',
      unreadCount: 0,
      lastMessageAt: daysAgo(25),
      msgs: [
        { dir: 'inbound', content: 'Hi, is hair transplant permanent?', sentBy: 'contact', t: daysAgo(26) },
        { dir: 'outbound', content: 'Hi Manish! Yes, FUE hair transplant uses your own permanent hair follicles from the donor area, so the transplanted hair is indeed permanent and continues to grow naturally for life. Would you like to know more?', sentBy: 'ai', t: daysAgo(26) },
        { dir: 'inbound', content: 'No thank you I was just curious', sentBy: 'contact', t: daysAgo(25) },
        { dir: 'outbound', content: 'Of course! Feel free to reach out anytime. Have a great day! 😊', sentBy: 'ai', t: daysAgo(25) },
      ],
    },
    // Priyanka — ai_active, hot lead
    {
      idx: 14,
      status: 'ai_active',
      unreadCount: 2,
      lastMessageAt: minutesAgo(30),
      msgs: [
        { dir: 'inbound', content: 'My sister got PRP done here and recommended you', sentBy: 'contact', t: hoursAgo(2) },
        { dir: 'outbound', content: "Hi Priyanka! How lovely to hear from a referred client 🥰 Welcome! Are you also looking at PRP therapy, or do you have a different concern?", sentBy: 'ai', t: hoursAgo(1, 59) },
        { dir: 'inbound', content: 'Yes I have hair loss too. Started after thyroid medication', sentBy: 'contact', t: hoursAgo(1, 30) },
        { dir: 'outbound', content: 'Thyroid-related hair loss is something we treat frequently. It often improves once the thyroid is regulated, but PRP + nutritional therapy can significantly speed up recovery. Has your thyroid been stabilized?', sentBy: 'ai', t: hoursAgo(1, 29) },
        { dir: 'inbound', content: 'Yes my TSH levels are normal now but hair loss continues', sentBy: 'contact', t: minutesAgo(35) },
        { dir: 'outbound', content: 'That is actually very common — it can take 6-12 months for hair to recover even after thyroid levels normalize. PRP therapy can help accelerate regrowth significantly. For a referred client, we also offer a 10% discount on the first session! 🎁 Would you like to book a free consultation?', sentBy: 'ai', t: minutesAgo(34) },
        { dir: 'inbound', content: 'Yes! How do I book and what documents do I need to bring?', sentBy: 'contact', t: minutesAgo(30) },
        { dir: 'outbound', content: 'Great choice! 🎉 Please bring:\n✅ Recent blood reports (especially thyroid)\n✅ List of current medications\n✅ Photos of hair loss pattern (optional)\n\nJust reply with your preferred date and time — we are open Mon-Sat, 10am-7pm. I will confirm your slot right away!', sentBy: 'ai', t: minutesAgo(30) },
      ],
    },
  ];

  const conversations = [];
  const allMessages = [];

  for (const def of convDefs) {
    const contact = contacts[def.idx];
    const lastMsg = def.msgs[def.msgs.length - 1];

    const conv = await Conversation.create({
      tenantId: tid,
      contactId: contact._id,
      waConversationId: `wa_conv_${contact.phone}_demo`,
      status: def.status,
      assignedAgent: def.assignedAgent || null,
      lastMessage: lastMsg.content.substring(0, 100),
      lastMessageAt: def.lastMessageAt,
      unreadCount: def.unreadCount,
      createdAt: contact.createdAt,
    });
    conversations.push(conv);

    const msgs = def.msgs.map((m, i) => ({
      tenantId: tid,
      conversationId: conv._id,
      contactId: contact._id,
      waMessageId: `wamid.demo_${contact.phone}_${i}`,
      direction: m.dir,
      type: 'text',
      content: m.content,
      status: m.dir === 'outbound' ? 'read' : 'sent',
      sentBy: m.sentBy,
      timestamp: m.t,
    }));
    allMessages.push(...msgs);
  }

  await Message.create(allMessages);

  // ── 6. Automation Flows (5) ─────────────────────────────────────────────────
  await Flow.create([
    {
      tenantId: tid,
      name: 'Welcome New Contact',
      isEnabled: true,
      trigger: { type: 'new_contact' },
      conditions: [],
      actions: [
        { type: 'send_message', params: { message: "Hi! 👋 Welcome to Glamour Hair Studio. I'm Aria, your personal hair care assistant. How can I help you today?" } },
        { type: 'add_tag', params: { tag: 'cold-lead' } },
      ],
      executionCount: 38,
      createdAt: daysAgo(60),
    },
    {
      tenantId: tid,
      name: 'Pricing Inquiry Qualifier',
      isEnabled: true,
      trigger: { type: 'keyword', keywords: ['price', 'cost', 'how much', 'charges', 'fees', 'rate'] },
      conditions: [],
      actions: [
        { type: 'add_tag', params: { tag: 'hot-lead' } },
        { type: 'update_stage', params: { stage: 'qualified' } },
      ],
      executionCount: 27,
      createdAt: daysAgo(45),
    },
    {
      tenantId: tid,
      name: 'Appointment Flow',
      isEnabled: true,
      trigger: { type: 'keyword', keywords: ['book', 'appointment', 'schedule', 'visit', 'consultation'] },
      conditions: [],
      actions: [
        { type: 'add_tag', params: { tag: 'appointment' } },
        { type: 'update_stage', params: { stage: 'booked' } },
        { type: 'send_message', params: { message: 'Great! Our specialist will confirm your appointment slot shortly. We are open Mon-Sat, 10am-7pm.' } },
      ],
      executionCount: 19,
      createdAt: daysAgo(40),
    },
    {
      tenantId: tid,
      name: 'Human Handover Trigger',
      isEnabled: true,
      trigger: { type: 'keyword', keywords: ['agent', 'human', 'real person', 'speak to someone', 'call me', 'doctor'] },
      conditions: [],
      actions: [
        { type: 'handover', params: {} },
      ],
      executionCount: 14,
      createdAt: daysAgo(35),
    },
    {
      tenantId: tid,
      name: 'VIP Tag on Conversion',
      isEnabled: true,
      trigger: { type: 'tag_added', tagName: 'converted' },
      conditions: [
        { field: 'contact_stage', operator: 'equals', value: 'converted' },
      ],
      actions: [
        { type: 'add_tag', params: { tag: 'vip' } },
        { type: 'send_message', params: { message: '🌟 Congratulations on completing your treatment! You are now part of our VIP program with exclusive benefits. Welcome to the Glamour family!' } },
      ],
      executionCount: 8,
      createdAt: daysAgo(30),
    },
  ]);

  // ── 7. Templates (3) ────────────────────────────────────────────────────────
  await Template.create([
    {
      tenantId: tid,
      name: 'appointment_reminder',
      status: 'APPROVED',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Appointment Reminder — Glamour Hair Studio',
        },
        {
          type: 'BODY',
          text: 'Hi {{1}}, this is a reminder that your appointment with Dr. Kapoor is scheduled for *{{2}}* at *{{3}}*.\n\nPlease arrive 10 minutes early. Reply CONFIRM to confirm or RESCHEDULE to change your slot.',
          example: { body_text: [['Anjali', 'Thursday 15 May', '11:00 AM']] },
        },
        {
          type: 'FOOTER',
          text: 'Glamour Hair Studio, Andheri West, Mumbai',
        },
      ],
      createdAt: daysAgo(50),
    },
    {
      tenantId: tid,
      name: 'welcome_consultation',
      status: 'APPROVED',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Welcome to Glamour Hair Studio! 🌟',
        },
        {
          type: 'BODY',
          text: "Hi {{1}}! Thank you for your interest in Glamour Hair Studio. We specialize in advanced hair restoration and scalp treatments.\n\n✅ Free Scalp Analysis\n✅ Personalized Treatment Plans\n✅ Certified Trichologists\n\nBook your *free consultation* today!",
          example: { body_text: [['Vikram']] },
        },
        {
          type: 'BUTTONS',
          buttons: [
            { type: 'QUICK_REPLY', text: 'Book Free Consultation' },
            { type: 'QUICK_REPLY', text: 'Learn More' },
          ],
        },
      ],
      createdAt: daysAgo(45),
    },
    {
      tenantId: tid,
      name: 'seasonal_offer',
      status: 'APPROVED',
      category: 'MARKETING',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '🎉 Exclusive Offer Inside — Limited Time!',
        },
        {
          type: 'BODY',
          text: 'Hi {{1}}! This month only, enjoy *20% OFF* on all PRP sessions at Glamour Hair Studio.\n\n🗓️ Valid till: {{2}}\n💰 Save up to ₹10,000 on a 6-session package\n\nDon\'t miss this opportunity to transform your hair!',
          example: { body_text: [['Rohit', '31st May 2024']] },
        },
        {
          type: 'BUTTONS',
          buttons: [
            { type: 'QUICK_REPLY', text: 'Claim Offer' },
            { type: 'QUICK_REPLY', text: 'Not Interested' },
          ],
        },
      ],
      createdAt: daysAgo(20),
    },
  ]);

  // ── 8. Broadcasts (4) ───────────────────────────────────────────────────────
  await Broadcast.create([
    {
      tenantId: tid,
      name: 'Summer Hair Care Campaign',
      templateName: 'seasonal_offer',
      templateParams: ['', '31st May 2024'],
      targetTags: ['hot-lead', 'interested'],
      status: 'completed',
      scheduledAt: daysAgo(15),
      stats: { total: 47, sent: 47, delivered: 45, read: 38, failed: 2 },
      createdAt: daysAgo(16),
    },
    {
      tenantId: tid,
      name: 'May Appointment Reminders',
      templateName: 'appointment_reminder',
      templateParams: ['', 'your scheduled date', 'your scheduled time'],
      targetTags: ['appointment'],
      status: 'completed',
      scheduledAt: daysAgo(7),
      stats: { total: 12, sent: 12, delivered: 12, read: 10, failed: 0 },
      createdAt: daysAgo(8),
    },
    {
      tenantId: tid,
      name: 'New Lead Welcome Blast',
      templateName: 'welcome_consultation',
      templateParams: [''],
      targetTags: ['cold-lead'],
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      stats: { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
      createdAt: daysAgo(1),
    },
    {
      tenantId: tid,
      name: 'VIP Loyalty Reward',
      templateName: 'seasonal_offer',
      templateParams: ['', '30th June 2024'],
      targetTags: ['vip'],
      status: 'draft',
      stats: { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
      createdAt: daysAgo(0),
    },
  ]);

  // ── 9. Subscription ─────────────────────────────────────────────────────────
  await Subscription.create({
    tenantId: tid,
    razorpaySubscriptionId: 'sub_demo_NxK9PlQd83',
    razorpayCustomerId: 'cust_demo_MwH7AbCd12',
    plan: 'pro',
    status: 'active',
    currentPeriodStart: daysAgo(15),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: daysAgo(90),
  });

  // ── 10. Webhook Events (12) ─────────────────────────────────────────────────
  const webhookDefs = [
    { eventType: 'message.inbound', phone: '919820001001', status: 'processed', t: minutesAgo(15) },
    { eventType: 'status.delivered', phone: '919820001001', status: 'processed', t: minutesAgo(14) },
    { eventType: 'status.read', phone: '919820001001', status: 'processed', t: minutesAgo(13) },
    { eventType: 'message.inbound', phone: '919820001006', status: 'processed', t: minutesAgo(46) },
    { eventType: 'status.delivered', phone: '919820001006', status: 'processed', t: minutesAgo(44) },
    { eventType: 'message.inbound', phone: '919820001009', status: 'processed', t: minutesAgo(5) },
    { eventType: 'message.inbound', phone: '919820001015', status: 'processed', t: minutesAgo(30) },
    { eventType: 'status.read', phone: '919820001015', status: 'processed', t: minutesAgo(29) },
    { eventType: 'message.inbound', phone: '919820001002', status: 'processed', t: hoursAgo(2, 30) },
    { eventType: 'status.delivered', phone: '919820001002', status: 'processed', t: hoursAgo(2) },
    { eventType: 'message.inbound', phone: '919820001004', status: 'failed', error: 'AI response timeout', t: hoursAgo(5) },
    { eventType: 'status.delivered', phone: '919820001007', status: 'processed', t: hoursAgo(1) },
  ];

  await WebhookEvent.create(
    webhookDefs.map((w, i) => ({
      tenantId: tid,
      eventType: w.eventType,
      phone: w.phone,
      messageId: `wamid.demo_event_${i}`,
      payload: { messaging_product: 'whatsapp', type: w.eventType, phone: w.phone },
      status: w.status,
      error: w.error || undefined,
      receivedAt: w.t,
    }))
  );

  // ── Summary ─────────────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    message: 'Demo data seeded successfully!',
    login: {
      email: 'demo@glamourhair.com',
      password: 'Demo@1234',
    },
    summary: {
      tenant: 'Glamour Hair Studio (Pro plan)',
      users: 3,
      contacts: contacts.length,
      conversations: conversations.length,
      messages: allMessages.length,
      flows: 5,
      templates: 3,
      broadcasts: 4,
      webhookEvents: webhookDefs.length,
    },
  });
}
