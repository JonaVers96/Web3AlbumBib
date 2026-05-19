import Router from '@koa/router';
import Joi from 'joi';
import multer from '@koa/multer';
import path from 'node:path';
import crypto from 'node:crypto';
import Role from '../core/roles';
import validate from '../core/validation';
import { makeRequireRole, requireAuthentication } from '../core/auth';
import type { AlbumAppContext, AlbumAppState, KoaContext, KoaRouter } from '../types/koa';
import ServiceError from '../core/serviceError';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads', 'covers'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.jpeg' ? '.jpg' : ext;
    const name = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype !== 'image/jpeg' || (ext !== '.jpg' && ext !== '.jpeg')) {
      return cb(ServiceError.validationFailed('Only JPEG (.jpg/.jpeg) files are allowed'));
    }
    cb(null, true);
  },
});

const uploadCover = async (ctx: KoaContext<{ url: string }>) => {
  const file = (ctx as any).file as { filename: string } | undefined;
  if (!file) {
    ctx.throw(400, 'No file uploaded', { code: 'VALIDATION_FAILED' });
  }

  ctx.body = {
    url: `/uploads/covers/${file.filename}`,
  };
  ctx.status = 201;
};
uploadCover.validationScheme = {
  // multer handles multipart; no body validation needed
  query: {},
};

export default (parent: KoaRouter) => {
  const router = new Router<AlbumAppState, AlbumAppContext>({ prefix: '/uploads' });
  const requireAdmin = makeRequireRole(Role.ADMIN);

  router.post(
    '/album-cover',
    requireAuthentication,
    requireAdmin,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    upload.single('file'),
    validate(uploadCover.validationScheme),
    uploadCover,
  );

  parent.use(router.routes()).use(router.allowedMethods());
};
