import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDatabase } from '@/lib/db/client';
import { files } from '@/lib/db/schema';

// In-memory fallback for when R2 is not available
let filesStore: any[] = [];
let fileIdCounter = 1;

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and projectId are required' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Get Cloudflare bindings
    const env = (request as any).env;
    const r2Bucket = env?.R2_BUCKET;
    const db = getDatabase(env);

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `projects/${projectId}/${timestamp}-${sanitizedFileName}`;

    let fileUrl: string;
    let useR2 = false;

    if (r2Bucket) {
      // Upload to R2
      console.log('✅ Uploading to R2 bucket');
      const arrayBuffer = await file.arrayBuffer();

      await r2Bucket.put(fileKey, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Generate public URL (adjust based on your R2 public URL configuration)
      fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '/files'}/${fileKey}`;
      useR2 = true;
    } else {
      // Fallback: store base64 in memory (not recommended for production)
      console.log('⚠️  R2 not available, using in-memory storage');
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      fileUrl = `data:${file.type};base64,${base64}`;
    }

    const userId = session.user.id || session.user.email!;
    const fileData = {
      projectId: parseInt(projectId),
      filename: file.name,
      filepath: fileUrl,
      filesize: file.size,
      mimetype: fileType || file.type,
      uploadedBy: userId,
      createdAt: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    };

    let savedFile: any;

    if (db) {
      // Save to D1 database
      const [dbFile] = await db.insert(files).values(fileData).returning();
      savedFile = dbFile;
    } else {
      // Save to in-memory store
      savedFile = {
        id: fileIdCounter++,
        ...fileData,
      };
      filesStore.push(savedFile);
    }

    return NextResponse.json({
      success: true,
      file: {
        id: savedFile.id,
        filename: savedFile.filename,
        filesize: savedFile.filesize,
        filepath: savedFile.filepath,
        mimetype: savedFile.mimetype,
        createdAt: savedFile.createdAt,
      },
      usingR2: useR2,
      usingDatabase: db !== null,
    });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Get files for a project
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const env = (request as any).env;
    const db = getDatabase(env);
    let projectFiles: any[];

    if (db) {
      // Get from D1 database
      const { eq } = await import('drizzle-orm');
      projectFiles = await db
        .select()
        .from(files)
        .where(eq(files.projectId, parseInt(projectId)));
    } else {
      // Get from in-memory store
      projectFiles = filesStore.filter(
        (f) => f.projectId === parseInt(projectId)
      );
    }

    return NextResponse.json({
      files: projectFiles,
      usingDatabase: db !== null,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
