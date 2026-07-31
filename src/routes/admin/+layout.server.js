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
    { data: user, error: userError },
    { data: profile, error: profileError },
    { data: experts, error: projectsError },
    { data: subscription, error: settingsError },
     { data: card, error: cardError }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(),

    supabase
      .from('profiles')
      .select('*')
      .eq('admin', false),

    supabase
      .from('experts')
      .select('*')
     , // or whatever your foreign key is

    supabase
      .from('subscription')
      .select('*')
      ,
    supabase
      .from('card')
      .select('*')
    
  ]);

  // Log errors but don't fail the whole load if one table errors
  if (userError) console.error('User error:', userError.message);
  if (profileError) console.error('Profile error:', profileError.message);
  if (projectsError) console.error('Projects error:', projectsError.message);
  if (settingsError) console.error('Settings error:', settingsError.message);
  if (cardError) console.error('Settings error:', cardError.message);


if (user.admin === false) {
    throw redirect(303, '/dashboard');
  }
  return {
    user,
    profile: profile ?? [],
    experts: experts ?? [],
    subscription: subscription ?? [],
    card: card ?? []
  };
};
