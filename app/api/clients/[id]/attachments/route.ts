import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  }
}

// POST /api/clients/[id]/attachments
export async function POST(request: Request, { params }: RouteParams) {
  const clientId = params.id;
  try {
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json({ message: 'type and content are required' }, { status: 400 });
    }
    
    // Use a transaction to create the attachment and update the parent client's `updatedAt` timestamp
    // This ensures the client list remains sorted correctly.
    const [, newAttachment] = await prisma.$transaction([
        prisma.client.update({
            where: { id: clientId },
            data: { updatedAt: new Date() }
        }),
        prisma.attachment.create({
            data: {
                clientId,
                type,
                content,
            },
        })
    ]);

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error) {
    console.error(`Failed to add attachment to client ${clientId}:`, error);
    return NextResponse.json({ message: `An error occurred while adding attachment for client ${clientId}.` }, { status: 500 });
  }
}
