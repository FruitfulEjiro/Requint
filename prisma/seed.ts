import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';
import {
  BudgetStatus,
  EmploymentStatus,
  ExpenseStatus,
  FeatureStatus,
  LeaveStatus,
  LeaveType,
  PolicyStatus,
  Priority,
  ReleaseStatus,
  TeamStatus,
  UserStatus,
} from '../generated/prisma/enums';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

const prisma = new PrismaClient({ adapter });

// Standard credentials for seeded users
export const DEFAULT_SEED_PASSWORD = 'Password123!';
export const DEFAULT_TEST_OTP = '123456';

const TEAMS = [
  { name: 'Admin', status: TeamStatus.active },
  { name: 'Finance', status: TeamStatus.active },
  { name: 'Engineering and Product', status: TeamStatus.active },
  { name: 'Human Resources', status: TeamStatus.active },
  { name: 'Operations', status: TeamStatus.active },
] as const;

const ROLES = [
  'SuperAdmin',
  'Admin',
  'Team_Lead',
  'Asst_Team_Lead',
  'Member',
] as const;

const PERMISSIONS = [
  // Budget
  'budget:create',
  'budget:read:all',
  'budget:read:team',
  'budget:read',
  'budget:update',
  'budget:allocate',
  // Expense
  'expense:create',
  'expense:read:all',
  'expense:read',
  'expense:update',
  'expense:approve:reject',
  // Employee
  'employee:read:all',
  'employee:read',
  'employee:update',
  // Membership
  'member:create',
  'member:remove',
  // Role
  'role:read:all',
  'role:assign:permission',
] as const;

async function seedTeams(): Promise<Record<string, string>> {
  console.log('Seeding teams...');
  const teamMap: Record<string, string> = {};

  for (const t of TEAMS) {
    let team = await prisma.team.findFirst({ where: { name: t.name } });
    if (!team) {
      team = await prisma.team.create({
        data: {
          name: t.name,
          status: t.status,
        },
      });
      console.log(`  ✓ Created team: "${t.name}"`);
    } else {
      console.log(`  - Team already exists: "${t.name}"`);
    }
    teamMap[t.name] = team.id;
  }

  return teamMap;
}

async function seedRoles(): Promise<Record<string, string>> {
  console.log('Seeding roles...');
  const roleMap: Record<string, string> = {};

  for (const name of ROLES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ Role ready: "${name}"`);
    roleMap[name] = role.id;
  }

  return roleMap;
}

async function seedPermissions(
  adminTeamId: string,
): Promise<Record<string, string>> {
  console.log('Seeding permissions...');
  const permissionMap: Record<string, string> = {};

  for (const name of PERMISSIONS) {
    const permission = await prisma.permissions.upsert({
      where: { name },
      update: {},
      create: {
        name,
        teamId: adminTeamId,
      },
    });
    permissionMap[name] = permission.id;
  }
  console.log(`  ✓ Seeded ${PERMISSIONS.length} permissions`);

  return permissionMap;
}

async function seedUsers(passwordHash: string, otpHash: string) {
  console.log('Seeding users...');

  const usersData = [
    {
      email: 'superadmin@requint.com',
      firstname: 'Super',
      lastname: 'Admin',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        public_id: 'avatar_superadmin',
      },
    },
    {
      email: 'admin@requint.com',
      firstname: 'Alex',
      lastname: 'Admin',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        public_id: 'avatar_admin',
      },
    },
    {
      email: 'finance.lead@requint.com',
      firstname: 'Fiona',
      lastname: 'Finance',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
      image: {
        secure_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        public_id: 'avatar_finance_lead',
      },
    },
    {
      email: 'finance.member@requint.com',
      firstname: 'Frank',
      lastname: 'Finley',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
    },
    {
      email: 'hr.lead@requint.com',
      firstname: 'Hannah',
      lastname: 'HumanResource',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
    },
    {
      email: 'engineering.lead@requint.com',
      firstname: 'Evan',
      lastname: 'Engineer',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
    },
    {
      email: 'dev@requint.com',
      firstname: 'David',
      lastname: 'Developer',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
    },
    {
      email: 'ops.lead@requint.com',
      firstname: 'Olivia',
      lastname: 'Operations',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.active,
    },
    {
      email: 'unverified@requint.com',
      firstname: 'Ursula',
      lastname: 'Unverified',
      password: passwordHash,
      isEmailVerified: false,
      status: UserStatus.active,
      otp: otpHash,
      otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    {
      email: 'inactive@requint.com',
      firstname: 'Ian',
      lastname: 'Inactive',
      password: passwordHash,
      isEmailVerified: true,
      status: UserStatus.inactive,
    },
  ];

  const userMap: Record<string, string> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstname: u.firstname,
        lastname: u.lastname,
        password: u.password,
        isEmailVerified: u.isEmailVerified,
        status: u.status,
        otp: u.otp ?? null,
        otpExpiresAt: u.otpExpiresAt ?? null,
        image: u.image ?? undefined,
      },
      create: {
        email: u.email,
        firstname: u.firstname,
        lastname: u.lastname,
        password: u.password,
        isEmailVerified: u.isEmailVerified,
        status: u.status,
        otp: u.otp ?? null,
        otpExpiresAt: u.otpExpiresAt ?? null,
        image: u.image ?? undefined,
      },
    });

    userMap[u.email] = user.id;
    console.log(`  ✓ User ready: ${u.email}`);
  }

  return userMap;
}

async function seedMemberships(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding memberships...');

  const superAdminId = userMap['superadmin@requint.com'];

  const membershipConfigs = [
    {
      email: 'superadmin@requint.com',
      team: 'Admin',
      role: 'SuperAdmin',
      inviterEmail: 'superadmin@requint.com',
    },
    {
      email: 'admin@requint.com',
      team: 'Admin',
      role: 'Admin',
      inviterEmail: 'superadmin@requint.com',
    },
    {
      email: 'finance.lead@requint.com',
      team: 'Finance',
      role: 'Team_Lead',
      inviterEmail: 'superadmin@requint.com',
    },
    {
      email: 'finance.member@requint.com',
      team: 'Finance',
      role: 'Member',
      inviterEmail: 'finance.lead@requint.com',
    },
    {
      email: 'hr.lead@requint.com',
      team: 'Human Resources',
      role: 'Team_Lead',
      inviterEmail: 'superadmin@requint.com',
    },
    {
      email: 'engineering.lead@requint.com',
      team: 'Engineering and Product',
      role: 'Team_Lead',
      inviterEmail: 'superadmin@requint.com',
    },
    {
      email: 'dev@requint.com',
      team: 'Engineering and Product',
      role: 'Member',
      inviterEmail: 'engineering.lead@requint.com',
    },
    {
      email: 'ops.lead@requint.com',
      team: 'Operations',
      role: 'Team_Lead',
      inviterEmail: 'superadmin@requint.com',
    },
  ];

  for (const m of membershipConfigs) {
    const userId = userMap[m.email];
    const teamId = teamMap[m.team];
    const inviterId = userMap[m.inviterEmail] ?? superAdminId;

    if (!userId || !teamId || !inviterId) continue;

    await prisma.membership.upsert({
      where: { userId },
      update: {
        teamId,
        role: m.role,
        invitedBy: inviterId,
      },
      create: {
        userId,
        teamId,
        role: m.role,
        invitedBy: inviterId,
      },
    });
    console.log(`  ✓ Membership ready for ${m.email} in ${m.team} (${m.role})`);
  }
}

async function seedRolePermissions(
  userMap: Record<string, string>,
  roleMap: Record<string, string>,
  permMap: Record<string, string>,
) {
  console.log('Seeding role permissions...');

  const assignments: Array<{
    email: string;
    roleName: string;
    permissions: string[];
  }> = [
    {
      email: 'admin@requint.com',
      roleName: 'Admin',
      permissions: [
        'budget:read:all',
        'budget:create',
        'budget:update',
        'budget:allocate',
        'expense:read:all',
        'expense:approve:reject',
        'employee:read:all',
        'employee:read',
        'employee:update',
        'member:create',
        'member:remove',
        'role:read:all',
        'role:assign:permission',
      ],
    },
    {
      email: 'finance.lead@requint.com',
      roleName: 'Team_Lead',
      permissions: [
        'budget:create',
        'budget:read:all',
        'budget:read:team',
        'budget:read',
        'budget:update',
        'budget:allocate',
        'expense:read:all',
        'expense:read',
        'expense:create',
        'expense:update',
        'expense:approve:reject',
      ],
    },
    {
      email: 'finance.member@requint.com',
      roleName: 'Member',
      permissions: [
        'expense:create',
        'expense:read',
        'expense:update',
        'budget:read:team',
        'budget:read',
      ],
    },
    {
      email: 'hr.lead@requint.com',
      roleName: 'Team_Lead',
      permissions: [
        'employee:read:all',
        'employee:read',
        'employee:update',
        'member:create',
        'member:remove',
      ],
    },
    {
      email: 'engineering.lead@requint.com',
      roleName: 'Team_Lead',
      permissions: [
        'budget:read:team',
        'budget:read',
        'expense:create',
        'expense:read',
        'employee:read',
      ],
    },
    {
      email: 'dev@requint.com',
      roleName: 'Member',
      permissions: ['expense:create', 'expense:read'],
    },
  ];

  for (const assign of assignments) {
    const userId = userMap[assign.email];
    const roleId = roleMap[assign.roleName];

    if (!userId || !roleId) continue;

    for (const permName of assign.permissions) {
      const permissionId = permMap[permName];
      if (!permissionId) continue;

      await prisma.rolePermissions.upsert({
        where: {
          roleId_permissionId_userId: {
            roleId,
            permissionId,
            userId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
          userId,
        },
      });
    }
    console.log(
      `  ✓ Assigned ${assign.permissions.length} permissions to ${assign.email}`,
    );
  }
}

async function seedEmployees(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding employees...');

  const employeeData = [
    {
      email: 'superadmin@requint.com',
      team: 'Admin',
      jobTitle: 'Chief Executive Officer',
      salary: 220000,
      startDate: new Date('2024-01-01'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'admin@requint.com',
      team: 'Admin',
      jobTitle: 'Head of Operations & Administration',
      salary: 160000,
      startDate: new Date('2024-02-01'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'finance.lead@requint.com',
      team: 'Finance',
      jobTitle: 'Finance Director',
      salary: 155000,
      startDate: new Date('2024-03-01'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'finance.member@requint.com',
      team: 'Finance',
      jobTitle: 'Senior Financial Analyst',
      salary: 95000,
      startDate: new Date('2024-06-15'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'hr.lead@requint.com',
      team: 'Human Resources',
      jobTitle: 'VP of People & Culture',
      salary: 150000,
      startDate: new Date('2024-02-15'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'engineering.lead@requint.com',
      team: 'Engineering and Product',
      jobTitle: 'Lead Software Architect',
      salary: 175000,
      startDate: new Date('2024-01-10'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'dev@requint.com',
      team: 'Engineering and Product',
      jobTitle: 'Fullstack Software Engineer',
      salary: 110000,
      startDate: new Date('2024-05-01'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'ops.lead@requint.com',
      team: 'Operations',
      jobTitle: 'Operations Manager',
      salary: 125000,
      startDate: new Date('2024-04-01'),
      employmentStatus: EmploymentStatus.active,
    },
    {
      email: 'inactive@requint.com',
      team: 'Operations',
      jobTitle: 'Former Operations Specialist',
      salary: 80000,
      startDate: new Date('2023-05-01'),
      endDate: new Date('2024-08-31'),
      employmentStatus: EmploymentStatus.offboarded,
    },
  ];

  for (const emp of employeeData) {
    const userId = userMap[emp.email];
    const teamId = teamMap[emp.team];

    if (!userId) continue;

    await prisma.employee.upsert({
      where: { userId },
      update: {
        teamId,
        jobTitle: emp.jobTitle,
        salary: emp.salary,
        startDate: emp.startDate,
        endDate: emp.endDate ?? null,
        employmentStatus: emp.employmentStatus,
      },
      create: {
        userId,
        teamId,
        jobTitle: emp.jobTitle,
        salary: emp.salary,
        startDate: emp.startDate,
        endDate: emp.endDate ?? null,
        employmentStatus: emp.employmentStatus,
      },
    });
    console.log(`  ✓ Employee record ready: ${emp.email} (${emp.jobTitle})`);
  }
}

async function seedBudgets(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding budgets...');

  const financeLeadId = userMap['finance.lead@requint.com'];
  const superAdminId = userMap['superadmin@requint.com'];

  const budgets = [
    {
      team: 'Finance',
      name: 'FY26 Q1 Auditing & Tax Compliance',
      totalAmount: 35000,
      allocatedAmount: 15000,
      remainingAmount: 20000,
      period: '2026-Q1',
      status: BudgetStatus.allocated,
      createdById: financeLeadId,
    },
    {
      team: 'Finance',
      name: 'FY26 Q2 Financial Planning & Advisory',
      totalAmount: 50000,
      allocatedAmount: 0,
      remainingAmount: 50000,
      period: '2026-Q2',
      status: BudgetStatus.draft,
      createdById: financeLeadId,
    },
    {
      team: 'Engineering and Product',
      name: 'FY26 Q1 Cloud Infrastructure & SaaS',
      totalAmount: 80000,
      allocatedAmount: 45000,
      remainingAmount: 35000,
      period: '2026-Q1',
      status: BudgetStatus.allocated,
      createdById: superAdminId,
    },
    {
      team: 'Engineering and Product',
      name: 'FY26 Q2 Dev Tooling & Testing Devices',
      totalAmount: 30000,
      allocatedAmount: 10000,
      remainingAmount: 20000,
      period: '2026-Q2',
      status: BudgetStatus.draft,
      createdById: superAdminId,
    },
    {
      team: 'Human Resources',
      name: 'FY26 Annual Team Learning & Development',
      totalAmount: 40000,
      allocatedAmount: 25000,
      remainingAmount: 15000,
      period: '2026-Annual',
      status: BudgetStatus.allocated,
      createdById: superAdminId,
    },
    {
      team: 'Operations',
      name: 'FY26 Q1 Workplace Hardware Upgrades',
      totalAmount: 25000,
      allocatedAmount: 12500,
      remainingAmount: 12500,
      period: '2026-Q1',
      status: BudgetStatus.allocated,
      createdById: superAdminId,
    },
  ];

  for (const b of budgets) {
    const teamId = teamMap[b.team];
    if (!teamId || !b.createdById) continue;

    const existing = await prisma.budget.findFirst({
      where: {
        teamId,
        name: b.name,
      },
    });

    if (!existing) {
      await prisma.budget.create({
        data: {
          teamId,
          name: b.name,
          totalAmount: b.totalAmount,
          allocatedAmount: b.allocatedAmount,
          remainingAmount: b.remainingAmount,
          period: b.period,
          status: b.status,
          createdById: b.createdById,
        },
      });
      console.log(`  ✓ Created budget: ${b.name} (${b.team})`);
    } else {
      console.log(`  - Budget already exists: ${b.name}`);
    }
  }
}

async function seedExpenses(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding expenses...');

  const devId = userMap['dev@requint.com'];
  const finMemberId = userMap['finance.member@requint.com'];
  const finLeadId = userMap['finance.lead@requint.com'];
  const adminId = userMap['admin@requint.com'];

  const expenses = [
    {
      team: 'Engineering and Product',
      submittedById: devId,
      title: 'AWS Production Cluster Hosting - October',
      amount: 1420.5,
      category: 'Cloud Services',
      receipt: {
        secure_url: 'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc',
        public_id: 'receipt_aws_october',
      },
      status: ExpenseStatus.approved,
      reviewedById: finLeadId,
      reviewedAt: new Date('2026-10-15'),
      reason: 'Approved monthly recurring cloud invoice',
    },
    {
      team: 'Engineering and Product',
      submittedById: devId,
      title: 'Ergonomic Mechanical Keyboards for QA team',
      amount: 380.0,
      category: 'Hardware',
      receipt: {
        secure_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
        public_id: 'receipt_keyboards_qa',
      },
      status: ExpenseStatus.pending,
      reason: null,
    },
    {
      team: 'Engineering and Product',
      submittedById: devId,
      title: 'First Class Flight Ticket to Tech Conference',
      amount: 4500.0,
      category: 'Travel',
      receipt: {
        secure_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
        public_id: 'receipt_flight_conference',
      },
      status: ExpenseStatus.rejected,
      reviewedById: adminId,
      reviewedAt: new Date('2026-10-20'),
      reason: 'Exceeds travel policy guidelines; economy class required',
    },
    {
      team: 'Finance',
      submittedById: finMemberId,
      title: 'Bloomberg Terminal Subscription - Monthly',
      amount: 2200.0,
      category: 'Software Subscriptions',
      receipt: {
        secure_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
        public_id: 'receipt_bloomberg_sub',
      },
      status: ExpenseStatus.approved,
      reviewedById: finLeadId,
      reviewedAt: new Date('2026-10-10'),
      reason: 'Standard analyst tooling approved',
    },
    {
      team: 'Finance',
      submittedById: finMemberId,
      title: 'Annual Accounting Standard Reference Manuals',
      amount: 245.8,
      category: 'Books & Resources',
      receipt: {
        secure_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
        public_id: 'receipt_books_reference',
      },
      status: ExpenseStatus.pending,
      reason: null,
    },
  ];

  for (const exp of expenses) {
    const teamId = teamMap[exp.team];
    if (!teamId || !exp.submittedById) continue;

    const existing = await prisma.expense.findFirst({
      where: {
        teamId,
        title: exp.title,
        submittedById: exp.submittedById,
      },
    });

    if (!existing) {
      await prisma.expense.create({
        data: {
          teamId,
          submittedById: exp.submittedById,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          receipt: exp.receipt,
          status: exp.status,
          reviewedById: exp.reviewedById ?? null,
          reviewedAt: exp.reviewedAt ?? null,
          reason: exp.reason ?? null,
        },
      });
      console.log(`  ✓ Created expense: "${exp.title}" (${exp.status})`);
    } else {
      console.log(`  - Expense already exists: "${exp.title}"`);
    }
  }
}

async function seedLeaves(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding leave requests...');

  const devId = userMap['dev@requint.com'];
  const finMemberId = userMap['finance.member@requint.com'];
  const hrLeadId = userMap['hr.lead@requint.com'];

  const leaves = [
    {
      team: 'Engineering and Product',
      requestedById: devId,
      type: LeaveType.vacation,
      startDate: new Date('2026-12-20'),
      endDate: new Date('2026-12-31'),
      reason: 'End of year family holiday',
      status: LeaveStatus.approved,
      reviewedById: hrLeadId,
      reviewedAt: new Date('2026-11-01'),
    },
    {
      team: 'Engineering and Product',
      requestedById: devId,
      type: LeaveType.sick,
      startDate: new Date('2026-11-04'),
      endDate: new Date('2026-11-06'),
      reason: 'Flu symptoms and doctor recommended rest',
      status: LeaveStatus.approved,
      reviewedById: hrLeadId,
      reviewedAt: new Date('2026-11-04'),
    },
    {
      team: 'Finance',
      requestedById: finMemberId,
      type: LeaveType.vacation,
      startDate: new Date('2027-01-15'),
      endDate: new Date('2027-01-22'),
      reason: 'Winter retreat',
      status: LeaveStatus.pending,
    },
  ];

  for (const l of leaves) {
    const teamId = teamMap[l.team];
    if (!teamId || !l.requestedById) continue;

    const existing = await prisma.leave.findFirst({
      where: {
        teamId,
        requestedById: l.requestedById,
        startDate: l.startDate,
      },
    });

    if (!existing) {
      await prisma.leave.create({
        data: {
          teamId,
          requestedById: l.requestedById,
          type: l.type,
          startDate: l.startDate,
          endDate: l.endDate,
          reason: l.reason,
          status: l.status,
          reviewedById: l.reviewedById ?? null,
          reviewedAt: l.reviewedAt ?? null,
        },
      });
      console.log(`  ✓ Created leave request: ${l.type} (${l.status})`);
    } else {
      console.log(`  - Leave request already exists`);
    }
  }
}

async function seedFeatures(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding feature requests...');

  const engTeamId = teamMap['Engineering and Product'];
  const devId = userMap['dev@requint.com'];
  const superAdminId = userMap['superadmin@requint.com'];

  if (!engTeamId) return;

  const features = [
    {
      title: 'Automated CSV and PDF Export for Quarterly Budgets',
      description:
        'Allow team leads to export complete quarterly financial statements and expense reports in one click.',
      requestedById: superAdminId,
      priority: Priority.high,
      status: FeatureStatus.in_progress,
    },
    {
      title: 'Slack and Email Notification Webhooks for Expense Approvals',
      description:
        'Instantly notify approvers when an employee submits an expense exceeding $500.',
      requestedById: devId,
      priority: Priority.medium,
      status: FeatureStatus.planned,
    },
    {
      title: 'Two-Factor Authentication via TOTP Authenticator Apps',
      description:
        'Add Google Authenticator / Authy support in addition to email OTP.',
      requestedById: superAdminId,
      priority: Priority.critical,
      status: FeatureStatus.under_review,
    },
    {
      title: 'Dark Mode UI Theme for Dashboard',
      description: 'System preference and manual dark mode toggle.',
      requestedById: devId,
      priority: Priority.low,
      status: FeatureStatus.shipped,
    },
  ];

  for (const f of features) {
    const existing = await prisma.feature.findFirst({
      where: {
        teamId: engTeamId,
        title: f.title,
      },
    });

    if (!existing) {
      await prisma.feature.create({
        data: {
          teamId: engTeamId,
          title: f.title,
          description: f.description,
          requestedById: f.requestedById,
          priority: f.priority,
          status: f.status,
        },
      });
      console.log(`  ✓ Created feature: "${f.title}" (${f.status})`);
    } else {
      console.log(`  - Feature already exists: "${f.title}"`);
    }
  }
}

async function seedReleases(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding releases...');

  const engTeamId = teamMap['Engineering and Product'];
  const engLeadId = userMap['engineering.lead@requint.com'];

  if (!engTeamId || !engLeadId) return;

  const releases = [
    {
      version: 'v1.0.0',
      title: 'Initial General Availability Release',
      changelog:
        'Features included: Multi-team management, RBAC with custom permissions, budget planning, expense reporting, and audit logs.',
      status: ReleaseStatus.published,
      publishedById: engLeadId,
      publishedAt: new Date('2026-08-01'),
    },
    {
      version: 'v1.1.0',
      title: 'Performance & Granular Permissions Enhancement',
      changelog:
        'Optimized query pipelines, added SuperAdmin auto-bypass, refreshed JWT session rotation in Redis.',
      status: ReleaseStatus.published,
      publishedById: engLeadId,
      publishedAt: new Date('2026-09-15'),
    },
    {
      version: 'v1.2.0-beta',
      title: 'Next Gen Financial Analytics Preview',
      changelog: 'Draft release for internal testing of predictive burn charts.',
      status: ReleaseStatus.draft,
      publishedById: null,
      publishedAt: null,
    },
  ];

  for (const r of releases) {
    await prisma.release.upsert({
      where: {
        teamId_version: {
          teamId: engTeamId,
          version: r.version,
        },
      },
      update: {
        title: r.title,
        changelog: r.changelog,
        status: r.status,
        publishedById: r.publishedById,
        publishedAt: r.publishedAt,
      },
      create: {
        teamId: engTeamId,
        version: r.version,
        title: r.title,
        changelog: r.changelog,
        status: r.status,
        publishedById: r.publishedById,
        publishedAt: r.publishedAt,
      },
    });
    console.log(`  ✓ Release ready: ${r.version} (${r.status})`);
  }
}

async function seedPolicies(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding policies...');

  const hrTeamId = teamMap['Human Resources'];
  const hrLeadId = userMap['hr.lead@requint.com'];

  if (!hrTeamId || !hrLeadId) return;

  const policies = [
    {
      title: 'Company Travel & Corporate Card Policy',
      content:
        'All flights under 6 hours must be booked in economy class. Receipts must be uploaded within 14 calendar days of transaction.',
      version: 1,
      status: PolicyStatus.publiched,
      publishedById: hrLeadId,
      publishedAt: new Date('2026-01-15'),
    },
    {
      title: 'Remote Work and Home Office Equipment Subsidy',
      content:
        'Eligible active employees can claim up to $750 every 24 months for approved ergonomic home workstation setups.',
      version: 2,
      status: PolicyStatus.publiched,
      publishedById: hrLeadId,
      publishedAt: new Date('2026-03-01'),
    },
    {
      title: 'Draft AI Safety & Proprietary Code Policy',
      content:
        'Internal guidelines on using generative AI assistants and protecting intellectual property.',
      version: 1,
      status: PolicyStatus.draft,
    },
  ];

  for (const p of policies) {
    const existing = await prisma.policy.findFirst({
      where: {
        teamId: hrTeamId,
        title: p.title,
      },
    });

    if (!existing) {
      await prisma.policy.create({
        data: {
          teamId: hrTeamId,
          title: p.title,
          content: p.content,
          version: p.version,
          status: p.status,
          publishedById: p.publishedById ?? null,
          publishedAt: p.publishedAt ?? null,
        },
      });
      console.log(`  ✓ Created policy: "${p.title}" (${p.status})`);
    } else {
      console.log(`  - Policy already exists: "${p.title}"`);
    }
  }
}

async function seedAnnouncements(
  userMap: Record<string, string>,
  teamMap: Record<string, string>,
) {
  console.log('Seeding announcements...');

  const adminTeamId = teamMap['Admin'];
  const superAdminId = userMap['superadmin@requint.com'];

  if (!adminTeamId || !superAdminId) return;

  const announcements = [
    {
      title: 'Welcome to Requint - Company All-Hands Q4 Kickoff',
      body: 'Join us this Thursday at 10:00 AM UTC for our quarterly town hall, financial results overview, and product roadmap unveilings.',
      postedById: superAdminId,
      pinned: true,
    },
    {
      title: 'Scheduled Maintenance Window - DB Index Optimizations',
      body: 'Maintenance will occur Saturday from 02:00 to 03:00 UTC. System services will experience momentary read-only operations.',
      postedById: superAdminId,
      pinned: false,
    },
  ];

  for (const a of announcements) {
    const existing = await prisma.announcement.findFirst({
      where: {
        teamId: adminTeamId,
        title: a.title,
      },
    });

    if (!existing) {
      await prisma.announcement.create({
        data: {
          teamId: adminTeamId,
          title: a.title,
          body: a.body,
          postedById: a.postedById,
          pinned: a.pinned,
        },
      });
      console.log(`  ✓ Created announcement: "${a.title}"`);
    } else {
      console.log(`  - Announcement already exists: "${a.title}"`);
    }
  }
}

async function seedAudits(userMap: Record<string, string>) {
  console.log('Seeding audit logs...');

  const superAdminId = userMap['superadmin@requint.com'];
  const finLeadId = userMap['finance.lead@requint.com'];

  if (!superAdminId || !finLeadId) return;

  const logs = [
    {
      actorId: superAdminId,
      action: 'TEAM_MEMBERSHIP_PROVISIONED',
      meta: {
        targetUser: 'finance.lead@requint.com',
        role: 'Team_Lead',
        team: 'Finance',
      },
    },
    {
      actorId: finLeadId,
      action: 'BUDGET_ALLOCATED',
      meta: {
        budgetName: 'FY26 Q1 Auditing & Tax Compliance',
        amount: 15000,
        currency: 'USD',
      },
    },
    {
      actorId: finLeadId,
      action: 'EXPENSE_APPROVED',
      meta: {
        expenseTitle: 'AWS Production Cluster Hosting - October',
        amount: 1420.5,
      },
    },
  ];

  for (const log of logs) {
    const existing = await prisma.audit.findFirst({
      where: {
        actorId: log.actorId,
        action: log.action,
      },
    });

    if (!existing) {
      await prisma.audit.create({
        data: {
          actorId: log.actorId,
          action: log.action,
          meta: log.meta,
        },
      });
      console.log(`  ✓ Seeded audit log: ${log.action}`);
    } else {
      console.log(`  - Audit log already exists: ${log.action}`);
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log('🚀 Starting Comprehensive Requint E2E Database Seed');
  console.log('====================================================');

  const passwordHash = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 12);
  const otpHash = await bcrypt.hash(DEFAULT_TEST_OTP, 12);

  // 1. Teams & Roles
  const teamMap = await seedTeams();
  const roleMap = await seedRoles();

  // 2. Permissions
  const adminTeamId = teamMap['Admin'];
  const permMap = await seedPermissions(adminTeamId);

  // 3. Users
  const userMap = await seedUsers(passwordHash, otpHash);

  // 4. Memberships & Role Permissions
  await seedMemberships(userMap, teamMap);
  await seedRolePermissions(userMap, roleMap, permMap);

  // 5. Employees
  await seedEmployees(userMap, teamMap);

  // 6. Budgets & Expenses
  await seedBudgets(userMap, teamMap);
  await seedExpenses(userMap, teamMap);

  // 7. Leaves, Features, Releases, Policies, Announcements, Audits
  await seedLeaves(userMap, teamMap);
  await seedFeatures(userMap, teamMap);
  await seedReleases(userMap, teamMap);
  await seedPolicies(userMap, teamMap);
  await seedAnnouncements(userMap, teamMap);
  await seedAudits(userMap);

  console.log('====================================================');
  console.log('✅ Database Seeding Completed Successfully!');
  console.log('====================================================');
  console.log('🔑 TEST ACCOUNTS FOR END-TO-END TESTING:');
  console.log('   All active accounts use password: Password123!');
  console.log('----------------------------------------------------');
  console.log('1. SuperAdmin (Bypasses all guards):');
  console.log('   Email:    superadmin@requint.com');
  console.log('   Team:     Admin');
  console.log('   Role:     SuperAdmin');
  console.log('2. Admin User (Passes AdminGuard):');
  console.log('   Email:    admin@requint.com');
  console.log('   Team:     Admin');
  console.log('   Role:     Admin');
  console.log('3. Finance Lead:');
  console.log('   Email:    finance.lead@requint.com');
  console.log('   Team:     Finance');
  console.log('   Role:     Team_Lead');
  console.log('4. Finance Member:');
  console.log('   Email:    finance.member@requint.com');
  console.log('   Team:     Finance');
  console.log('   Role:     Member');
  console.log('5. HR Lead:');
  console.log('   Email:    hr.lead@requint.com');
  console.log('   Team:     Human Resources');
  console.log('   Role:     Team_Lead');
  console.log('6. Engineering Lead:');
  console.log('   Email:    engineering.lead@requint.com');
  console.log('   Team:     Engineering and Product');
  console.log('   Role:     Team_Lead');
  console.log('7. Engineering Developer:');
  console.log('   Email:    dev@requint.com');
  console.log('   Team:     Engineering and Product');
  console.log('   Role:     Member');
  console.log('8. Operations Lead:');
  console.log('   Email:    ops.lead@requint.com');
  console.log('   Team:     Operations');
  console.log('   Role:     Team_Lead');
  console.log('9. Unverified User (For OTP verification flow testing):');
  console.log('   Email:    unverified@requint.com');
  console.log('   OTP:      123456');
  console.log('10. Inactive User (For status restriction testing):');
  console.log('   Email:    inactive@requint.com');
  console.log('====================================================');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
