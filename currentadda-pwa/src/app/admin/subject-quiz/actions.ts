'use server';

import { createClient } from '@supabase/supabase-js';

// Helper to get admin client to avoid top-level crashes if env vars are missing
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error('Server Error: NEXT_PUBLIC_SUPABASE_URL is not defined in Vercel dashboard.');
    }
    if (!key) {
        throw new Error('Server Error: SUPABASE_SERVICE_ROLE_KEY is not defined in Vercel dashboard. Please check your Environment Variables.');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export async function checkAdminCredentials(username: string, password: string) {
    try {
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
            console.error('Admin credentials not configured in environment variables');
            return false;
        }

        return username === adminUser && password === adminPass;
    } catch (error) {
        console.error('Error checking admin credentials:', error);
        return false;
    }
}

export async function addSubjectAction(name: string, slug: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('subjects')
            .insert({ name, slug })
            .select();

        if (error) return { error: error.message };
        return { data };
    } catch (error: any) {
        return { error: error.message || 'An unexpected error occurred' };
    }
}

export async function addMainTopicAction(subjectId: string, name: string, slug: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('main_topics')
            .insert({ subject_id: subjectId, name, slug })
            .select();

        if (error) return { error: error.message };
        return { data };
    } catch (error: any) {
        return { error: error.message || 'An unexpected error occurred' };
    }
}

export async function addSubTopicAction(mainTopicId: string, name: string, slug: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('sub_topics')
            .insert({ main_topic_id: mainTopicId, name, slug })
            .select();

        if (error) return { error: error.message };
        return { data };
    } catch (error: any) {
        return { error: error.message || 'An unexpected error occurred' };
    }
}

export async function importQuizDataAction(baseTitle: string, baseSlug: string, subTopicId: string, allQuestions: any[]) {
    try {
        const supabase = getSupabaseAdmin();
        const CHUNK_SIZE = 10;
        const results = [];

        for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
            const chunk = allQuestions.slice(i, i + CHUNK_SIZE);
            const setNumber = Math.floor(i / CHUNK_SIZE) + 1;
            const quizTitle = allQuestions.length > CHUNK_SIZE ? `${baseTitle} - Set ${setNumber}` : baseTitle;
            const quizSlug = `${baseSlug}-set-${setNumber}-${Date.now()}`;

            // 1. Create Quiz Set
            const { data: quiz, error: quizError } = await supabase
                .from('subject_quizzes')
                .insert({
                    title: quizTitle,
                    slug: quizSlug,
                    sub_topic_id: subTopicId
                })
                .select()
                .single();

            if (quizError) return { error: `Error creating ${quizTitle}: ${quizError.message}` };
            if (!quiz) return { error: `Failed to create quiz ${quizTitle}` };

            // 2. Attach quiz_id and fix q_index for this set
            const questionsWithId = chunk.map((q, idx) => ({
                ...q,
                quiz_id: quiz.id,
                q_index: idx + 1
            }));

            // 3. Insert Questions for this set
            const { error: questionsError } = await supabase
                .from('subject_questions')
                .insert(questionsWithId);

            if (questionsError) return { error: `Error inserting questions for ${quizTitle}: ${questionsError.message}` };

            results.push({ title: quizTitle, count: chunk.length });
        }

        return { success: true, totalSets: results.length, totalQuestions: allQuestions.length };
    } catch (error: any) {
        return { error: error.message || 'An unexpected error occurred during import' };
    }
}

export async function sendNotificationAction(title: string, message: string, url?: string, image?: string) {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        return { error: 'OneSignal credentials not found in environment' };
    }

    try {
        const body: any = {
            app_id: appId,
            included_segments: ['All'],
            headings: { en: title },
            contents: { en: message },
            url: url || process.env.NEXT_PUBLIC_SITE_URL,
        };

        if (image) {
            body.big_picture = image;
            body.chrome_web_image = image;
        }

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.errors) {
            return { error: Array.isArray(data.errors) ? data.errors[0] : JSON.stringify(data.errors) };
        }
        return { success: true, id: data.id, recipients: data.recipients };
    } catch (err: any) {
        return { error: err.message || 'Failed to send notification' };
    }
}

export async function deleteSubjectAction(id: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) return { error: error.message };
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteMainTopicAction(id: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('main_topics').delete().eq('id', id);
        if (error) return { error: error.message };
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteSubTopicAction(id: string) {
    try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('sub_topics').delete().eq('id', id);
        if (error) return { error: error.message };
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}


