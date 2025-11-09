import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Ensures a profile exists for the given user.
 * Creates one if it doesn't exist (fallback if trigger fails).
 */
export async function ensureProfileExists(user: User): Promise<void> {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile exists, we're done
    if (existingProfile) {
      console.log('Profile already exists for user:', user.id);
      return;
    }

    // If error is not "not found", throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Profile doesn't exist, create it
    console.log('Creating profile for user:', user.id);
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });

    if (insertError) {
      // If it's a duplicate key error, ignore it (race condition)
      if (insertError.code === '23505') {
        console.log('Profile was created by another process');
        return;
      }
      throw insertError;
    }

    console.log('Profile created successfully for user:', user.id);
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
    throw error;
  }
}

/**
 * Updates the profile with additional information
 */
export async function updateProfileData(
  userId: string, 
  data: {
    full_name?: string;
    avatar_url?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

