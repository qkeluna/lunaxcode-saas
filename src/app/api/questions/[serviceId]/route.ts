import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const context = getCloudflareContext();

    if (!context) {
      return NextResponse.json(
        { error: 'Database context not available' },
        { status: 503 }
      );
    }

    const serviceId = parseInt(params.serviceId);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const db = drizzle(context.env.DB);

    // Fetch all questions for this service type
    const serviceQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.serviceId, serviceId));

    // Fetch options for each question
    const questionsWithOptions = await Promise.all(
      serviceQuestions.map(async (question) => {
        const options = await db
          .select()
          .from(questionOptions)
          .where(eq(questionOptions.questionId, question.id))
          .orderBy(questionOptions.sortOrder);

        return {
          id: question.id,
          serviceId: question.serviceId,
          questionKey: question.questionKey,
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          placeholder: question.placeholder,
          sortOrder: question.sortOrder,
          options: options.map(opt => opt.optionValue),
        };
      })
    );

    return NextResponse.json({ questions: questionsWithOptions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
