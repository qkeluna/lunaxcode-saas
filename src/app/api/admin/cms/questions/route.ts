import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth/check-admin';
import { getDatabase } from '@/lib/db/client';
import { questions, serviceTypes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const allQuestions = await db
      .select({
        id: questions.id,
        serviceId: questions.serviceId,
        serviceName: serviceTypes.name,
        questionKey: questions.questionKey,
        questionText: questions.questionText,
        questionType: questions.questionType,
        required: questions.required,
        placeholder: questions.placeholder,
        sortOrder: questions.sortOrder,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .leftJoin(serviceTypes, eq(questions.serviceId, serviceTypes.id))
      .orderBy(desc(questions.createdAt));

    return NextResponse.json({ questions: allQuestions });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { isAdmin, error } = await checkIsAdmin(request);

  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }

  try {
    const db = getDatabase();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { serviceId, questionKey, questionText, questionType, required, placeholder, sortOrder } = body;

    if (!serviceId || !questionKey || !questionText || !questionType) {
      return NextResponse.json(
        { error: 'Service ID, question key, question text, and question type are required' },
        { status: 400 }
      );
    }

    const [newQuestion] = await db
      .insert(questions)
      .values({
        serviceId,
        questionKey,
        questionText,
        questionType,
        required: required !== undefined ? required : false,
        placeholder: placeholder || null,
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
