import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ClientStatus } from '@prisma/client';

// GET /api/clients
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status') as ClientStatus;

  const where: any = {};

  if (status && Object.values(ClientStatus).includes(status)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { businessNameAr: { contains: search, mode: 'insensitive' } },
      { clientNameAr: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  try {
    const clients = await prisma.client.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ message: 'An error occurred while fetching clients.' }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessNameAr, phone, ...rest } = body;

    if (!businessNameAr || !phone) {
      return NextResponse.json({ message: 'businessNameAr and phone are required' }, { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        businessNameAr,
        phone,
        ...rest,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ message: 'An error occurred while creating the client.' }, { status: 500 });
  }
}
