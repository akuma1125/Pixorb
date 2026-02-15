// ══════════════════════════════════════════════
// PIXORB — Express API Server
// ══════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb, initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── POST /api/wallets — Submit a wallet ──
app.post('/api/wallets', async (req, res) => {
    try {
        const { address } = req.body;

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({
                error: 'invalid',
                message: 'Invalid Ethereum address',
            });
        }

        const normalizedAddress = address.toLowerCase();
        const sql = getDb();

        try {
            await sql`
        INSERT INTO wallets (address)
        VALUES (${normalizedAddress})
      `;
            return res.json({ success: true, message: 'Wallet added to allowlist' });
        } catch (err) {
            // Unique constraint violation
            if (err.code === '23505' || (err.message && err.message.includes('unique'))) {
                return res.status(409).json({
                    error: 'duplicate',
                    message: 'Wallet already on allowlist',
                });
            }
            throw err;
        }
    } catch (err) {
        console.error('Error submitting wallet:', err);
        res.status(500).json({ error: 'server', message: 'Internal server error' });
    }
});

// ── GET /api/wallets/csv — Export wallets as CSV ──
app.get('/api/wallets/csv', async (req, res) => {
    try {
        const sql = getDb();
        const wallets = await sql`
      SELECT address, created_at FROM wallets ORDER BY created_at ASC
    `;

        // Build CSV
        let csv = 'address,created_at\n';
        for (const w of wallets) {
            csv += `${w.address},${w.created_at}\n`;
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=pixorb_allowlist.csv');
        res.send(csv);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).json({ error: 'server', message: 'Failed to export wallets' });
    }
});

// ── GET /api/wallets — List wallets (JSON) ──
app.get('/api/wallets', async (req, res) => {
    try {
        const sql = getDb();
        const wallets = await sql`
      SELECT address, created_at FROM wallets ORDER BY created_at ASC
    `;
        res.json({ count: wallets.length, wallets });
    } catch (err) {
        console.error('Error listing wallets:', err);
        res.status(500).json({ error: 'server', message: 'Failed to list wallets' });
    }
});

// ── Start ──
async function start() {
    try {
        await initDb();
    } catch (err) {
        console.warn('⚠ Database not connected (set DATABASE_URL in .env):', err.message);
    }

    app.listen(PORT, () => {
        console.log(`\n  ✦ Pixorb API running at http://localhost:${PORT}\n`);
    });
}

start();
