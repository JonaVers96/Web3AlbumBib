import jwt from 'jsonwebtoken';
import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import { hashPassword, verifyPassword } from '../core/password';
import { generateJWT, verifyJWT } from '../core/jwt';
import { getLogger } from '../core/logging';
import Role from '../core/roles';
import type {
  AuthResponse,
  PublicUser,
  RegisterUserRequest,
  Role as RoleType,
  UpdateUserRequest,
  User,
} from '../types/user';
import type { SessionInfo } from '../types/auth';
import handleDBError from './_handleDBError';

const makeExposedUser = ({ id, firstName, lastName, email, role }: User): PublicUser => ({
  id,
  firstName,
  lastName,
  email,
  role,
});

export const checkAndParseSession = async (authHeader?: string): Promise<SessionInfo> => {
  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }

  const [type, authToken] = authHeader.split(' ');
  if (type !== 'Bearer' || !authToken) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  try {
    const { sub } = await verifyJWT(authToken);
    const userId = Number(sub);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ServiceError.unauthorized('User no longer exists');
    }

    const role = (user as unknown as User).role ?? Role.USER;

    return {
      userId,
      roles: [role],
    };
  } catch (error: any) {
    getLogger().error(error.message, { error });

    if (error instanceof ServiceError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw ServiceError.unauthorized('The token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ServiceError.unauthorized(`Invalid authentication token: ${error.message}`);
    }

    throw ServiceError.unauthorized('Invalid authentication token');
  }
};

export const checkRole = (role: string, roles: string[]): void => {
  const hasPermission = roles.includes(role);
  if (!hasPermission) {
    throw ServiceError.forbidden('You are not allowed to view this part of the application');
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  const passwordValid = await verifyPassword(password, (user as any).passwordHash);
  if (!passwordValid) {
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  const token = await generateJWT(user as any);

  return {
    token,
    user: makeExposedUser(user as any),
  };
};

export const register = async (input: RegisterUserRequest): Promise<AuthResponse> => {
  const { firstName, lastName, email, password } = input;

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: Role.USER,
      },
    });

    const token = await generateJWT(user as any);

    return {
      token,
      user: makeExposedUser(user as any),
    };
  } catch (error) {
    throw handleDBError(error);
  }
};

const normalizeUserQuery = (query: any) => {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 25)));
  const q = query.q?.trim() ? query.q.trim() : undefined;
  return { page, pageSize, q };
};

const buildWhere = (q?: string) => {
  if (!q) return {};
  return {
    OR: [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ],
  };
};

export const getAll = async (query: any) => {
  const { page, pageSize, q } = normalizeUserQuery(query);
  const where = buildWhere(q);

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { firstName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: items.map((u: any) => makeExposedUser(u as any)),
    page,
    pageSize,
    total,
  };
};

export const getById = async (id: number): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ServiceError.notFound(`User with id ${id} not found`);
  }
  return makeExposedUser(user as any);
};

export const updateById = async (id: number, input: UpdateUserRequest): Promise<PublicUser> => {
  const { firstName, lastName, email } = input;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, email },
    });

    return makeExposedUser(user as any);
  } catch (error) {
    throw handleDBError(error);
  }
};

export const updateRoleById = async (id: number, role: RoleType): Promise<PublicUser> => {
  if (![Role.ADMIN, Role.USER].includes(role)) {
    throw ServiceError.validationFailed('Invalid role');
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return makeExposedUser(user as any);
  } catch (error) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw handleDBError(error);
  }
};
