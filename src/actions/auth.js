'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { withDB } from '@/lib/mongodb';
import { createSession, deleteSession } from '@/lib/session';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  await withDB();
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) return { error: 'Invalid email or password' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: 'Invalid email or password' };

  await createSession({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId.toString(),
  });

  redirect('/dashboard');
}

export async function register(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const businessName = formData.get('businessName');

  if (!name || !email || !password || !businessName) {
    return { error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  await withDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return { error: 'An account with this email already exists' };

  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();

  const tenant = await Tenant.create({ businessName, slug });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    tenantId: tenant._id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'owner',
  });

  await createSession({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: tenant._id.toString(),
  });

  redirect('/onboarding');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
