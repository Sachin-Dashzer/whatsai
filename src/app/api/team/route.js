import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withDB } from '@/lib/mongodb';
import { verifySession } from '@/lib/dal';
import User from '@/models/User';

export async function GET() {
  const session = await verifySession();
  await withDB();
  const members = await User.find({ tenantId: session.tenantId })
    .select('-password')
    .sort({ createdAt: 1 })
    .lean();
  return NextResponse.json({ members });
}

export async function POST(req) {
  const session = await verifySession();
  if (session.role !== 'owner' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners and admins can invite team members' }, { status: 403 });
  }
  await withDB();

  const { name, email, role = 'agent' } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const existing = await User.findOne({ email: email.toLowerCase(), tenantId: session.tenantId });
  if (existing) return NextResponse.json({ error: 'This email is already a member of your team' }, { status: 400 });

  const tempPassword = Math.random().toString(36).slice(-10);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    tenantId: session.tenantId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    onboardingComplete: true,
  });

  return NextResponse.json({
    member: { _id: user._id, name: user.name, email: user.email, role: user.role },
    tempPassword,
  }, { status: 201 });
}

export async function DELETE(req) {
  const session = await verifySession();
  if (session.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can remove team members' }, { status: 403 });
  }
  await withDB();

  const { userId } = await req.json();
  if (userId === session.userId) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });

  await User.findOneAndDelete({ _id: userId, tenantId: session.tenantId });
  return NextResponse.json({ success: true });
}
