const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    // Create admin user
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@airalabs.com" },
        update: {},
        create: {
            email: "admin@airalabs.com",
            name: "AIRA Admin",
            password: hashedPassword,
            role: "ADMIN",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        },
    });

    console.log('✅ Admin seeded:', adminUser.email);

    // Default lab settings
    await prisma.labSetting.upsert({
        where: { key: 'lab_main_image' },
        update: {},
        create: {
            key: 'lab_main_image',
            value: '/images/aira-lab-default.png',
        },
    });

    await prisma.labSetting.upsert({
        where: { key: 'lab_about_text' },
        update: {},
        create: {
            key: 'lab_about_text',
            value: 'AIRA Labs is a premier innovation and research laboratory at our college, fostering creativity, technology, and excellence.',
        },
    });

    // Sample achievement
    await prisma.achievement.upsert({
        where: { id: 'sample-achievement-1' },
        update: {},
        create: {
            id: 'sample-achievement-1',
            title: 'Best Innovation Lab 2024',
            description: 'Recognized as the best innovation lab in the university for outstanding research and student engagement.',
            date: new Date('2024-01-15'),
            category: 'Recognition',
            icon: '🏆',
        },
    });

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
