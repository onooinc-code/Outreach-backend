import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ClientStatus } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  }
}

// POST /api/clients/[id]/followups
export async function POST(request: Request, { params }: RouteParams) {
  const clientId = params.id;
  try {
    const body = await request.json();
    const { type, notes, nextFollowUpDate } = body;

    if (!type || !notes) {
      return NextResponse.json({ message: 'type and notes are required' }, { status: 400 });
    }
    
    // If nextFollowUpDate is provided, update client and create follow-up in a transaction
    if (nextFollowUpDate) {
      const [newFollowUp] = await prisma.$transaction([
        prisma.followUp.create({
          data: {
            clientId,
            type,
            notes,
            nextFollowUpDate: new Date(nextFollowUpDate),
          },
        }),
        prisma.client.update({
          where: { id: clientId },
          data: {
            nextFollowUpDate: new Date(nextFollowUpDate),
            status: ClientStatus.FollowUp,
          },
        }),
      ]);
      return NextResponse.json(newFollowUp, { status: 201 });
    } else {
      // Otherwise, just create the follow-up and touch the parent client to update `updatedAt`
      const [newFollowUp] = await prisma.$transaction([
        prisma.followUp.create({
            data: {
              clientId,
              type,
              notes,
            },
        }),
        prisma.client.update({
            where: { id: clientId },
            data: { updatedAt: new Date() } // Explicitly update timestamp
        })
      ]);
      return NextResponse.json(newFollowUp, { status: 201 });
    }
  } catch (error) {
    console.error(`Failed to add followup to client ${clientId}:`, error);
    return NextResponse.json({ message: `An error occurred while adding follow-up for client ${clientId}.` }, { status: 500 });
  }
}
