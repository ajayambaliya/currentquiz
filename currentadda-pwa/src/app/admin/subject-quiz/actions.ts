'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkAdminCredentials(username: string, password: string) {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    return username === adminUser && password === adminPass;
}

export async function addSubjectAction(name: string, slug: string) {
    const { data, error } = await supabaseAdmin
        .from('subjects')
        .insert({ name, slug })
        .select();
    if (error) return { error: error.message };
    return { data };
}

export async function addMainTopicAction(subjectId: string, name: string, slug: string) {
    const { data, error } = await supabaseAdmin
        .from('main_topics')
        .insert({ subject_id: subjectId, name, slug })
        .select();
    if (error) return { error: error.message };
    return { data };
}

export async function addSubTopicAction(mainTopicId: string, name: string, slug: string) {
    const { data, error } = await supabaseAdmin
        .from('sub_topics')
        .insert({ main_topic_id: mainTopicId, name, slug })
        .select();
    if (error) return { error: error.message };
    return { data };
}

export async function importQuizDataAction(baseTitle: string, baseSlug: string, subTopicId: string, allQuestions: any[]) {
    const CHUNK_SIZE = 10;
    const results = [];

    // Split questions into chunks of 10
    for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
        const chunk = allQuestions.slice(i, i + CHUNK_SIZE);
        const setNumber = Math.floor(i / CHUNK_SIZE) + 1;
        const quizTitle = allQuestions.length > CHUNK_SIZE ? `${baseTitle} - Set ${setNumber}` : baseTitle;
        const quizSlug = `${baseSlug}-set-${setNumber}-${Date.now()}`;

        // 1. Create Quiz Set
        const { data: quiz, error: quizError } = await supabaseAdmin
            .from('subject_quizzes')
            .insert({
                title: quizTitle,
                slug: quizSlug,
                sub_topic_id: subTopicId
            })
            .select()
            .single();

        if (quizError) return { error: `Error creating ${quizTitle}: ${quizError.message}` };

        // 2. Attach quiz_id and fix q_index for this set
        const questionsWithId = chunk.map((q, idx) => ({
            ...q,
            quiz_id: quiz.id,
            q_index: idx + 1 // Start index from 1 for each set
        }));

        // 3. Insert Questions for this set
        const { error: questionsError } = await supabaseAdmin
            .from('subject_questions')
            .insert(questionsWithId);

        if (questionsError) return { error: `Error inserting questions for ${quizTitle}: ${questionsError.message}` };

        results.push({ title: quizTitle, count: chunk.length });
    }

    return { success: true, totalSets: results.length, totalQuestions: allQuestions.length };
}

export async function sendNotificationAction(title: string, message: string, url?: string, image?: string) {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
        return { error: 'OneSignal credentials not found' };
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
        return { error: err.message };
    }
}

