const lessonBank = require('../lesson-bank.js');

const learnerIdPattern = /^[A-Z0-9]{4,24}$/;
const allowedStatuses = new Set(['green', 'yellow', 'red']);

function respond(res, status, body) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(status).json(body);
}

function fail(status, message) {
    const error = new Error(message);
    error.status = status;
    throw error;
}

async function supabaseRequest(path, options = {}) {
    const url = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const body = await response.text();
    if (!response.ok) {
        console.error('Supabase request failed:', response.status, body.slice(0, 500));
        fail(502, 'Kunde inte läsa eller spara i lektionsdatabasen. Försök igen senare.');
    }

    return body ? JSON.parse(body) : null;
}

function getLesson(code) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode || normalizedCode.length > 24) {
        fail(400, 'Ange en giltig lektionskod.');
    }

    const lesson = lessonBank.find(item => String(item.code || '').trim().toUpperCase() === normalizedCode);
    if (!lesson) {
        fail(404, 'Lektionskoden känns inte igen.');
    }
    return { lesson, code: normalizedCode };
}

function getLearnerId(value) {
    const learnerId = String(value || '').trim().toUpperCase();
    if (!learnerIdPattern.test(learnerId)) {
        fail(400, 'Elev-ID ska vara 4–24 tecken och bara innehålla bokstäver eller siffror.');
    }
    return learnerId;
}

async function findProfile(lessonCode, learnerId) {
    const query = new URLSearchParams({
        select: 'id',
        lesson_code: `eq.${lessonCode}`,
        learner_id: `eq.${learnerId}`,
        limit: '1'
    });
    const profiles = await supabaseRequest(`student_profiles?${query}`);
    return profiles[0] || null;
}

async function readProgress(profileId) {
    const query = new URLSearchParams({
        select: 'task_lection_id,status',
        student_id: `eq.${profileId}`
    });
    const rows = await supabaseRequest(`student_progress?${query}`);
    return Object.fromEntries(rows.map(row => [row.task_lection_id, row.status]));
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return respond(res, 405, { error: 'Metoden stöds inte.' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return respond(res, 503, { error: 'Lektionsdatabasen är inte konfigurerad ännu.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            fail(400, 'Begäran saknar giltiga data.');
        }

        const { lesson, code } = getLesson(body.lessonCode);
        const learnerId = getLearnerId(body.learnerId);

        let profile;
        if (body.action === 'create-profile') {
            const createdProfiles = await supabaseRequest(`student_profiles?on_conflict=${encodeURIComponent('lesson_code,learner_id')}`, {
                method: 'POST',
                headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
                body: JSON.stringify({ lesson_code: code, learner_id: learnerId })
            });
            profile = createdProfiles[0];
            if (!profile) {
                fail(409, 'Elev-ID:t används redan i den här lektionen. Välj ett annat ID eller fortsätt med ditt befintliga ID.');
            }
        } else if (body.action === 'resume-profile') {
            profile = await findProfile(code, learnerId);
            if (!profile) {
                fail(404, 'Elev-ID:t hittades inte i den här lektionen. Välj att skapa ett nytt elev-ID.');
            }
        }

        if (body.action === 'create-profile' || body.action === 'resume-profile') {
            return respond(res, 200, {
                learnerId,
                progress: await readProgress(profile.id)
            });
        }

        if (body.action === 'set-status') {
            const taskLectionId = String(body.taskLectionId || '');
            const validTaskIds = (lesson.taskLectionIds || []).map(String);
            if (!validTaskIds.includes(taskLectionId)) {
                fail(400, 'Uppgiften tillhör inte den här lektionen.');
            }

            const profile = await findProfile(code, learnerId);
            if (!profile) {
                fail(404, 'Elevprofilen kunde inte hittas. Anslut till lektionen igen.');
            }

            const filter = new URLSearchParams({
                student_id: `eq.${profile.id}`,
                task_lection_id: `eq.${taskLectionId}`
            });
            if (body.status === null) {
                await supabaseRequest(`student_progress?${filter}`, { method: 'DELETE' });
            } else {
                if (!allowedStatuses.has(body.status)) {
                    fail(400, 'Markeringen är ogiltig.');
                }
                await supabaseRequest(`student_progress?on_conflict=${encodeURIComponent('student_id,task_lection_id')}`, {
                    method: 'POST',
                    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                    body: JSON.stringify({
                        student_id: profile.id,
                        task_lection_id: taskLectionId,
                        status: body.status
                    })
                });
            }
            return respond(res, 200, { saved: true });
        }

        fail(400, 'Åtgärden stöds inte.');
    } catch (error) {
        if (error instanceof SyntaxError) {
            return respond(res, 400, { error: 'Begäran innehåller ogiltig JSON.' });
        }
        if (error.status) {
            return respond(res, error.status, { error: error.message });
        }
        console.error('Progress API error:', error);
        return respond(res, 500, { error: 'Ett oväntat fel inträffade. Försök igen senare.' });
    }
};
