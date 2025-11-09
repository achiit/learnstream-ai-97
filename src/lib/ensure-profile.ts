/**
 * Utility to ensure user profile exists in database
 * This helps prevent foreign key constraint errors when the profile creation trigger fails
 */

import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Ensures a user profile exists in the profiles table
 * Creates one if it doesn't exist
 */
export async function ensureProfileExists(user: User): Promise<boolean> {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile exists, we're good
    if (existingProfile && !fetchError) {
      return true;
    }

    // If error is not "not found", throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking profile:', fetchError);
      return false;
    }

    // Profile doesn't exist, create it
    console.log('Profile not found, creating one for user:', user.id);
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    console.log('Profile created successfully for user:', user.id);
    return true;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    return false;
  }
}

