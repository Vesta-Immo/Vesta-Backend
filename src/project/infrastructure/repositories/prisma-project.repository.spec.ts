import { PrismaProjectRepository } from './prisma-project.repository';

type MockProject = {
  id: string;
  userId: string;
  name: string;
  location: string | null;
  isImplicit: boolean;
  createdAt: Date;
  updatedAt: Date;
};

describe('PrismaProjectRepository', () => {
  const now = new Date('2026-04-02T12:00:00.000Z');

  const createProject = (overrides: Partial<MockProject> = {}): MockProject => ({
    id: 'project-1',
    userId: 'user-1',
    name: 'Primary project',
    location: null,
    isImplicit: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  const createRepository = () => {
    const tx = {
      project: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      project: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };

    const repository = new PrismaProjectRepository(prisma as any);

    return { repository, prisma, tx };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an implicit project when none exists', async () => {
    const { repository, tx } = createRepository();
    const created = createProject({ id: 'implicit-created' });

    tx.project.findMany.mockResolvedValue([]);
    tx.project.create.mockResolvedValue(created);

    const result = await repository.createImplicit('supabase-user-1', 'Primary project');

    expect(tx.project.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isImplicit: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
    expect(tx.project.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Primary project',
        location: null,
        isImplicit: true,
      },
    });
    expect(result.id).toBe('implicit-created');
    expect(result.isImplicit).toBe(true);
  });

  it('should reuse existing implicit project without creating a new one', async () => {
    const { repository, tx } = createRepository();
    const existing = createProject({ id: 'implicit-existing' });

    tx.project.findMany.mockResolvedValue([existing]);

    const result = await repository.createImplicit('supabase-user-1', 'Primary project');

    expect(tx.project.create).not.toHaveBeenCalled();
    expect(tx.project.updateMany).not.toHaveBeenCalled();
    expect(result.id).toBe('implicit-existing');
  });

  it('should normalize duplicate implicit projects and keep the most recent', async () => {
    const { repository, tx } = createRepository();
    const primary = createProject({ id: 'implicit-newest', updatedAt: new Date('2026-04-02T12:00:00.000Z') });
    const duplicate = createProject({
      id: 'implicit-older',
      updatedAt: new Date('2026-03-01T12:00:00.000Z'),
    });

    tx.project.findMany.mockResolvedValue([primary, duplicate]);
    tx.project.updateMany.mockResolvedValue({ count: 1 });

    const result = await repository.findImplicitByUserId('supabase-user-1');

    expect(tx.project.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['implicit-older'] } },
      data: { isImplicit: false },
    });
    expect(result?.id).toBe('implicit-newest');
    expect(result?.isImplicit).toBe(true);
  });
});
