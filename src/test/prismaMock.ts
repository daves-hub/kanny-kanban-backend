export type MockFn<T extends (...args: any[]) => any = (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;

type ModelMock<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: MockFn<T[K]>;
};

export type MockPrismaClient = {
  user: ModelMock<{
    findUnique: any;
    findFirst: any;
    create: any;
    upsert: any;
  }>;
  project: ModelMock<{
    findMany: any;
    findFirst: any;
    create: any;
    update: any;
    delete: any;
  }>;
  board: ModelMock<{
    findMany: any;
    findFirst: any;
    create: any;
    update: any;
    delete: any;
  }>;
  list: ModelMock<{
    findMany: any;
    findFirst: any;
    create: any;
    createMany: any;
    update: any;
    delete: any;
  }>;
  task: ModelMock<{
    findMany: any;
    findFirst: any;
    create: any;
    update: any;
    delete: any;
  }>;
  $transaction: MockFn<(fn: (tx: MockPrismaClient) => Promise<any>) => Promise<any>>;
};

const createModelMock = <T extends Record<string, (...args: any[]) => any>>(methods: T): ModelMock<T> => {
  return Object.keys(methods).reduce((acc, key) => {
    acc[key as keyof T] = jest.fn();
    return acc;
  }, {} as ModelMock<T>);
};

export const createMockPrisma = (): MockPrismaClient => {
  const mock = {
    user: createModelMock({
      findUnique: () => undefined,
      findFirst: () => undefined,
      create: () => undefined,
      upsert: () => undefined,
    }),
    project: createModelMock({
      findMany: () => [],
      findFirst: () => undefined,
      create: () => undefined,
      update: () => undefined,
      delete: () => undefined,
    }),
    board: createModelMock({
      findMany: () => [],
      findFirst: () => undefined,
      create: () => undefined,
      update: () => undefined,
      delete: () => undefined,
    }),
    list: createModelMock({
      findMany: () => [],
      findFirst: () => undefined,
      create: () => undefined,
      createMany: () => undefined,
      update: () => undefined,
      delete: () => undefined,
    }),
    task: createModelMock({
      findMany: () => [],
      findFirst: () => undefined,
      create: () => undefined,
      update: () => undefined,
      delete: () => undefined,
    }),
    $transaction: jest.fn(),
  } as unknown as MockPrismaClient;

  mock.$transaction.mockImplementation(async (callback: (tx: MockPrismaClient) => Promise<any>) => callback(mock));

  return mock;
};

export const resetMockPrisma = (mock: MockPrismaClient): void => {
  const reset = (target: any): void => {
    Object.values(target).forEach((value) => {
      if (value && typeof value === 'object' && !('mockReset' in value)) {
        reset(value);
      } else if (typeof value === 'function' && 'mockReset' in value) {
        (value as jest.Mock).mockReset();
      }
    });
  };

  reset(mock);
  mock.$transaction.mockImplementation(async (callback: (tx: MockPrismaClient) => Promise<any>) => callback(mock));
};
