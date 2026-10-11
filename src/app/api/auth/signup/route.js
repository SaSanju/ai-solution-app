import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
    });
    return new Response(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email } }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
} 