const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const PAGEVIEW_KEY = 'portfolio:visitor:pageviews';
const VISITOR_COUNT_KEY = 'portfolio:visitor:submissions';
const VISITOR_TYPE_PREFIX = 'portfolio:visitor:type:';
const DEVICE_PAGEVIEW_PREFIX = 'portfolio:visitor:device:';
const VISITOR_TYPES = ['family', 'recruiter', 'friend', 'colleague'];

function json(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getRequestBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body);
    }
    return {};
}

function toCount(value) {
    return Number(value ?? 0) || 0;
}

async function upstashGet(key) {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
    const response = await fetch(`${KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
        headers: {
            Authorization: `Bearer ${KV_REST_API_TOKEN}`
        }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.result ?? null;
}

async function upstashIncr(key) {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
    const response = await fetch(`${KV_REST_API_URL}/incr/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${KV_REST_API_TOKEN}`
        }
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`KV incr failed: ${response.status} ${text}`);
    }
    const data = await response.json();
    return data?.result ?? null;
}

async function upstashDecrBy(key, amount) {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
    const response = await fetch(`${KV_REST_API_URL}/decrby/${encodeURIComponent(key)}/${encodeURIComponent(amount)}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${KV_REST_API_TOKEN}`
        }
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`KV decrby failed: ${response.status} ${text}`);
    }
    const data = await response.json();
    return data?.result ?? null;
}

async function upstashSet(key, value) {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
    const response = await fetch(`${KV_REST_API_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${KV_REST_API_TOKEN}`
        }
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`KV set failed: ${response.status} ${text}`);
    }
    return true;
}

async function upstashGetCounts() {
    const [pageviews, submissions, ...types] = await Promise.all([
        upstashGet(PAGEVIEW_KEY),
        upstashGet(VISITOR_COUNT_KEY),
        ...VISITOR_TYPES.map(type => upstashGet(`${VISITOR_TYPE_PREFIX}${type}`))
    ]);

    const byType = {};
    VISITOR_TYPES.forEach((type, index) => {
        byType[type] = toCount(types[index]);
    });

    return {
        pageviews: toCount(pageviews),
        submissions: toCount(submissions),
        byType
    };
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method === 'GET') {
        const counts = await upstashGetCounts();
        json(res, 200, { ok: true, ...counts, count: counts.pageviews });
        return;
    }

    if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'Method not allowed' });
        return;
    }

    let body = {};
    try {
        body = getRequestBody(req);
    } catch (error) {
        json(res, 400, { ok: false, error: 'Invalid JSON body' });
        return;
    }

    const eventType = String(body.type || 'pageview');
    const visitorType = String(body.visitorType || body.visitor_type || '');
    const clientId = String(body.clientId || body.client_id || body.deviceId || '').trim();
    const timestamp = new Date().toISOString();
    const excludedKey = clientId ? `${DEVICE_PAGEVIEW_PREFIX}${clientId}:excluded` : '';
    const deviceCountKey = clientId ? `${DEVICE_PAGEVIEW_PREFIX}${clientId}:pageviews` : '';
    const isExcludedDevice = clientId ? (String(await upstashGet(excludedKey)) === 'true') : false;

    console.log('[VISITOR]', JSON.stringify({
        eventType,
        visitorType,
        clientId: clientId ? '[redacted]' : '',
        path: body.path || body.page || '',
        timestamp
    }));

    let count = null;
    if (eventType === 'pageview') {
        if (isExcludedDevice) {
            json(res, 200, { ok: true, excluded: true, count: toCount(await upstashGet(PAGEVIEW_KEY)) });
            return;
        }
        try {
            count = await upstashIncr(PAGEVIEW_KEY);
            if (clientId) await upstashIncr(deviceCountKey);
        } catch (error) {
            console.error('[VISITOR] pageview count update failed:', error.message);
        }
    }

    if (eventType === 'visitor') {
        if (isExcludedDevice) {
            json(res, 200, { ok: true, excluded: true });
            return;
        }
        try {
            await upstashIncr(VISITOR_COUNT_KEY);
            if (visitorType) await upstashIncr(`${VISITOR_TYPE_PREFIX}${visitorType}`);
        } catch (error) {
            console.error('[VISITOR] visitor count update failed:', error.message);
        }
    }

    if (eventType === 'device-exclude') {
        if (!clientId) {
            json(res, 400, { ok: false, error: 'clientId is required' });
            return;
        }

        const countedPageviews = toCount(await upstashGet(deviceCountKey));
        if (countedPageviews > 0) {
            try {
                await upstashDecrBy(PAGEVIEW_KEY, countedPageviews);
            } catch (error) {
                console.error('[VISITOR] pageview rollback failed:', error.message);
            }
        }

        try {
            await upstashSet(excludedKey, true);
        } catch (error) {
            console.error('[VISITOR] device exclude flag save failed:', error.message);
        }

        json(res, 200, {
            ok: true,
            excluded: true,
            removed: countedPageviews
        });
        return;
    }

    if (eventType === 'device-include') {
        if (!clientId) {
            json(res, 400, { ok: false, error: 'clientId is required' });
            return;
        }

        try {
            await upstashSet(excludedKey, false);
        } catch (error) {
            console.error('[VISITOR] device include flag save failed:', error.message);
        }

        json(res, 200, { ok: true, excluded: false });
        return;
    }

    try {
        await upstashSet('portfolio:visitor:last', {
            eventType,
            visitorType,
            clientId: clientId ? '[redacted]' : '',
            path: body.path || body.page || '',
            name: body.name || body.visitor_name || '',
            reason: body.reason || body.visitor_reason || '',
            note: body.note || body.visitor_note || '',
            timestamp
        });
    } catch (error) {
        console.error('[VISITOR] last visit save failed:', error.message);
    }

    json(res, 200, {
        ok: true,
        count: count === null ? undefined : count
    });
}
