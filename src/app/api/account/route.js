import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import User from '@/models/User';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const user = await User.findById(session.userId).select('-password').lean();
  return NextResponse.json(user || {});
}

export async function PUT(req) {
  const session = await verifySession();
  await withDB();

  const { name, currentPassword, newPassword } = await req.json();
  const user = await User.findById(session.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (name) user.name = name;

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  return NextResponse.json({ success: true, name: user.name, email: user.email });
}
