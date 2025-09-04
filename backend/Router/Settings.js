
import {
  createUserPref, getUserPref, replaceUserPref, mergeUserPref,
  patchUserPrefPath, deleteUserPref, listUserPrefs
} from '../DB/services/UserSettingCRUD.js';
import express from 'express'

import { sequelize } from '../DB/dbconfiguration.js';

const router = express.Router();

// GET /api/user-prefs?limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const schemaName = req.header('Tenant-Schema'); 
    // console.log("setting", schemaName);
  
   

    // Run everything atomically
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO "${schemaName}"`, { transaction: t });
    const rows = await listUserPrefs({
      limit: Math.min(+req.query.limit || 50, 200),
      offset: +req.query.offset || 0,
    }, { transaction: t });
    await t.commit();
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/user-prefs/:user_id
router.get('/:user_id', async (req, res, next) => {
  try {
    const row = await getUserPref(req.params.user_id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  } catch (e) { next(e); }
});

// POST /api/user-prefs/:user_id  -> create if missing (idempotent)
router.post('/:user_id', async (req, res, next) => {
  try {
    const { row, created } = await createUserPref(req.params.user_id, req.body.value || {});
    res.status(created ? 201 : 200).json(row);
  } catch (e) { next(e); }
});

// PUT /api/user-prefs/:user_id   -> replace whole doc (optimistic)
router.put('/:user_id', async (req, res, next) => {
  try {
    const { row, conflict } = await replaceUserPref(req.params.user_id, req.body.value || {});
    if (conflict) return res.status(409).json({ error: 'conflict', message: 'version changed; reload' });
    res.json(row);
  } catch (e) { next(e); }
});

// PATCH /api/user-prefs/:user_id -> shallow merge (optimistic)
router.patch('/:user_id', async (req, res, next) => {
  try {
    const { row, conflict } = await mergeUserPref(req.params.user_id, req.body.partial || {});
    if (conflict) return res.status(409).json({ error: 'conflict', message: 'version changed; reload' });
    res.json(row);
  } catch (e) { next(e); }
});

// PATCH /api/user-prefs/:user_id/path  -> jsonb_set at path
// body: { path: ['sections','lowStock'], value: false }
router.patch('/update', async (req, res, next) => {
  try {
    const user_id = req.query.userId;  
    const { path, value } = req.body;
    const row = await patchUserPrefPath(user_id, path, value);
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  } catch (e) { next(e); }
});

// DELETE /api/user-prefs/:user_id
router.delete('/:user_id', async (req, res, next) => {
  try {
    const ok = await deleteUserPref(req.params.user_id);
    res.status(ok ? 204 : 404).end();
  } catch (e) { next(e); }
});

export {router as SettingRoute};
