import { NextRequest, NextResponse } from 'next/server';
import { getRescueBagsCollection } from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, date, bags } = body;

    if (!merchant_id || !date || !bags) {
      return NextResponse.json(
        { error: 'merchant_id, date, and bags are required' },
        { status: 400 }
      );
    }

    const collection = await getRescueBagsCollection();

    // Save bags to MongoDB
    await collection.insertOne({
      merchant_id,
      date,
      bags,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Rescue bags saved successfully' });
  } catch (error: any) {
    console.error('Rescue bags API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
