import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession();

  if (!session) {
    return { profile: null, projects: null, settings: null };
  }

  const userId = session.user.id;

  // Fetch multiple tables in parallel
  const [
    { data: profile, error: profileError },
    { data: experts, error: projectsError },
    { data: account_plan, error: accountPlanError },
    { data: subscription, error: settingsError }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(),

    supabase
      .from('experts')
      .select('*')
     , // or whatever your foreign key is

    supabase
      .from('subscription')
      .select('*')
      ,
    supabase
      .from('account_plan')
      .select('*')
      
  ]);

  // Log errors but don't fail the whole load if one table errors
  if (profileError) console.error('Profile error:', profileError.message);
  if (projectsError) console.error('Projects error:', projectsError.message);
  if (settingsError) console.error('Settings error:', settingsError.message);
  if (accountPlanError) console.error('Account Plan error:', accountPlanError.message);

  if (profile.admin === true) {
		throw redirect(303, '/admin');
	}

  return {
    profile,
    experts: experts ?? [],
    subscription: subscription ?? [],
    account_plan: account_plan ?? []
  };
};