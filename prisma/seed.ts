import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created user:', user1.email);

  // Create demo project
  const project1 = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'A sample project for testing',
      ownerId: user1.id,
    },
  });

  console.log('✅ Created project:', project1.name);

  // Create demo board
  const board1 = await prisma.board.create({
    data: {
      name: 'Project Board',
      ownerId: user1.id,
      projectId: project1.id,
    },
  });

  console.log('✅ Created board:', board1.name);

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      title: 'Todo',
      position: 0,
      boardId: board1.id,
    },
  });

  const inProgressList = await prisma.list.create({
    data: {
      title: 'In Progress',
      position: 1,
      boardId: board1.id,
    },
  });

  const completeList = await prisma.list.create({
    data: {
      title: 'Complete',
      position: 2,
      boardId: board1.id,
    },
  });

  console.log('✅ Created lists:', todoList.title, inProgressList.title, completeList.title);

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up development environment',
        description: 'Install Node.js, PostgreSQL, and other dependencies',
        position: 0,
        listId: completeList.id,
      },
      {
        title: 'Design database schema',
        description: 'Create ERD and define relationships',
        position: 1,
        listId: completeList.id,
      },
      {
        title: 'Implement authentication',
        description: 'Set up JWT-based authentication',
        position: 0,
        listId: inProgressList.id,
      },
      {
        title: 'Create API endpoints',
        description: 'Build REST API for all resources',
        position: 1,
        listId: inProgressList.id,
      },
      {
        title: 'Write tests',
        description: 'Add unit and integration tests',
        position: 0,
        listId: todoList.id,
      },
      {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline',
        position: 1,
        listId: todoList.id,
      },
    ],
  });

  console.log('✅ Created sample tasks');

  // Create standalone board
  const board2 = await prisma.board.create({
    data: {
      name: 'Personal Tasks',
      ownerId: user1.id,
      projectId: null,
    },
  });

  console.log('✅ Created standalone board:', board2.name);

  console.log('🎉 Database seed completed!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
