/**
 * Script to create the first admin user for The Observer CMS
 *
 * Usage: node scripts/create_admin_user.js <email> <password> [full_name]
 * Example: node scripts/create_admin_user.js admin@example.com MySecurePassword123 "Admin User"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser(email, password, fullName = 'Admin') {
  console.log(`\nCreating admin user: ${email}`);
  console.log('='.repeat(50));

  try {
    // Step 1: Create the user in Supabase Auth
    console.log('\n1. Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already been registered')) {
        console.log('   User already exists in Auth, fetching user...');

        // Get the user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }

        // Update to admin role
        console.log('\n2. Updating user role to admin...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role: 'admin', full_name: fullName })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;

        console.log('\n' + '='.repeat(50));
        console.log('SUCCESS! Existing user upgraded to admin');
        console.log('='.repeat(50));
        console.log(`\nEmail: ${email}`);
        console.log(`Role: admin`);
        console.log(`\nYou can now log in at /admin/login`);
        return;
      }
      throw authError;
    }

    console.log(`   User created with ID: ${authData.user.id}`);

    // Step 2: The trigger should have created the profile, but let's update it to admin
    console.log('\n2. Setting user role to admin...');

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (updateError) {
      // Profile might not exist yet, create it
      console.log('   Profile not found, creating...');
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: 'admin'
        });

      if (insertError) throw insertError;
    }

    console.log('   Role set to admin');

    // Step 3: Verify the setup
    console.log('\n3. Verifying setup...');
    const { data: profile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (verifyError) throw verifyError;

    console.log('\n' + '='.repeat(50));
    console.log('SUCCESS! Admin user created');
    console.log('='.repeat(50));
    console.log(`\nEmail: ${profile.email}`);
    console.log(`Name: ${profile.full_name}`);
    console.log(`Role: ${profile.role}`);
    console.log(`\nYou can now log in at /admin/login`);

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('The Observer - Create Admin User');
  console.log('='.repeat(40));
  console.log('\nUsage: node scripts/create_admin_user.js <email> <password> [full_name]');
  console.log('\nExample:');
  console.log('  node scripts/create_admin_user.js admin@example.com SecurePass123 "Admin User"');
  process.exit(1);
}

const [email, password, fullName] = args;

if (password.length < 6) {
  console.error('Error: Password must be at least 6 characters');
  process.exit(1);
}

createAdminUser(email, password, fullName || email.split('@')[0]);
