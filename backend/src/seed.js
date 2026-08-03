const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('🌱 Seeding database...');

  const hashedPassword = bcrypt.hashSync('Password123!', 10);

  // Clear existing tables if needed or insert default users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, department, employee_code)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name=excluded.name,
      password=excluded.password,
      role=excluded.role,
      department=excluded.department,
      employee_code=excluded.employee_code
  `);

  insertUser.run('Alex Morgan (Employee)', 'employee@abc.com', hashedPassword, 'EMPLOYEE', 'Engineering', 'EMP-1001');
  insertUser.run('Sarah Jenkins (Director)', 'director@abc.com', hashedPassword, 'DIRECTOR', 'Executive', 'DIR-5001');
  insertUser.run('Robert Chen (Accounts)', 'accounts@abc.com', hashedPassword, 'ACCOUNTS', 'Finance', 'ACC-3001');

  // Fetch created user ID for employee
  const employee = db.prepare('SELECT id FROM users WHERE email = ?').get('employee@abc.com');

  // Insert Sample Vouchers if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM vouchers');
  const { count } = countStmt.get();

  if (count === 0 && employee) {
    const insertVoucher = db.prepare(`
      INSERT INTO vouchers (
        voucher_number, user_id, employee_name, employee_code, department,
        expense_title, expense_category, expense_description, expense_date,
        voucher_date, amount, status, employee_signature, director_signature, rejection_reason, approval_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertVoucher.run(
      'VCH-2026-0001',
      employee.id,
      'Alex Morgan (Employee)',
      'EMP-1001',
      'Engineering',
      'AWS Cloud Infrastructure Server Costs',
      'Software & Tools',
      'Monthly cloud server hosting and production database instance fees for July.',
      '2026-07-28',
      '2026-08-01',
      1250.50,
      'APPROVED',
      'sample_sig_emp.png',
      'sample_sig_dir.png',
      null,
      '2026-08-02'
    );

    insertVoucher.run(
      'VCH-2026-0002',
      employee.id,
      'Alex Morgan (Employee)',
      'EMP-1001',
      'Engineering',
      'Client Tech Conference Flight & Travel',
      'Travel',
      'Round-trip flight and train tickets to attend TechCorp Summit 2026.',
      '2026-08-01',
      '2026-08-02',
      640.00,
      'PENDING_APPROVAL',
      'sample_sig_emp.png',
      null,
      null,
      null
    );

    insertVoucher.run(
      'VCH-2026-0003',
      employee.id,
      'Alex Morgan (Employee)',
      'EMP-1001',
      'Engineering',
      'Team Offsite Dinner & Refreshments',
      'Meals',
      'Q3 engineering sprint celebration dinner with 8 team members.',
      '2026-08-02',
      '2026-08-03',
      320.75,
      'DRAFT',
      'sample_sig_emp.png',
      null,
      null,
      null
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log('  Accounts available:');
  console.log('  - Employee: employee@abc.com / Password123!');
  console.log('  - Director: director@abc.com / Password123!');
  console.log('  - Accounts: accounts@abc.com / Password123!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
