import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  }
}

// GET /api/clients/[id]
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: {
            date: 'desc',
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(`Failed to fetch client ${id}:`, error);
    return NextResponse.json({ message: `An error occurred while fetching client ${id}.` }, { status: 500 });
  }
}

// PATCH /api/clients/[id]
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();

    const updatedClient = await prisma.client.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error(`Failed to update client ${id}:`, error);
    return NextResponse.json({ message: `An error occurred while updating client ${id}.` }, { status: 500 });
  }
}
