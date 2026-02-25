import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@/lib/db/context';
import { drizzle } from 'drizzle-orm/d1';
import { projects, projectAnswers, serviceTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateProposalUniversal } from '@/lib/ai/universal-ai';
import { checkIsAdmin } from '@/lib/auth/check-admin';

export const runtime = 'edge';

/**
 * Admin endpoint to generate a Proposal for a project
 * POST /api/admin/projects/[id]/generate-proposal
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Check admin authentication
        const { isAdmin, error } = await checkIsAdmin(request);
        if (!isAdmin) {
            return NextResponse.json(
                { error: error || 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        // 2. Get AI config from request body
        const body = await request.json() as { aiConfig?: { provider: string; apiKey: string; model: string } };
        const aiConfig = body.aiConfig;

        if (!aiConfig || !aiConfig.provider || !aiConfig.apiKey) {
            return NextResponse.json(
                { error: 'AI configuration is required. Please configure your AI provider in Settings.' },
                { status: 400 }
            );
        }

        // 3. Get Cloudflare context and database
        const context = getCloudflareContext();
        if (!context?.env?.DB) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 503 }
            );
        }

        const db = drizzle(context.env.DB);
        const { id } = await params;
        const projectId = parseInt(id);

        // 4. Get project details
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // 5. Get service type details
        const [service] = await db
            .select()
            .from(serviceTypes)
            .where(eq(serviceTypes.id, project.serviceTypeId))
            .limit(1);

        if (!service) {
            return NextResponse.json(
                { error: 'Service type not found' },
                { status: 404 }
            );
        }

        // 6. Get project answers
        const answers = await db
            .select()
            .from(projectAnswers)
            .where(eq(projectAnswers.projectId, projectId));

        // Convert answers to key-value object
        const questionAnswers: Record<string, any> = {};
        for (const answer of answers) {
            try {
                // Try to parse as JSON first
                questionAnswers[answer.questionKey] = JSON.parse(answer.answerValue);
            } catch {
                // If not JSON, use as string
                questionAnswers[answer.questionKey] = answer.answerValue;
            }
        }

        console.log(`🤖 Admin generating Proposal for project ${projectId}...`);
        console.log(`AI Provider: ${aiConfig.provider}`);
        console.log(`AI Model: ${aiConfig.model}`);

        // 7. Generate Proposal using universal AI service
        try {
            const proposal = await generateProposalUniversal({
                projectName: project.name,
                clientName: project.clientName,
                serviceName: project.service,
                description: project.description,
                questionAnswers: questionAnswers,
                budget: project.budget || (service?.basePrice ?? 0),
                timeline: project.timeline || 30, // Default to 30 days if not set
                config: aiConfig
            });

            console.log(`✅ Proposal generated (${proposal.length} characters)`);

            // 8. Update project with Proposal
            await db
                .update(projects)
                .set({
                    proposal,
                    updatedAt: new Date()
                })
                .where(eq(projects.id, projectId));

            return NextResponse.json({
                success: true,
                message: 'Proposal generated successfully',
                proposalLength: proposal.length,
            });
        } catch (genError: any) {
            console.error('❌ AI Generation Error:', genError);
            return NextResponse.json(
                {
                    error: 'Failed to generate Proposal: ' + (genError.message || 'AI service error'),
                    details: genError.toString()
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error generating Proposal:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate Proposal',
                details: error.stack
            },
            { status: 500 }
        );
    }
}
