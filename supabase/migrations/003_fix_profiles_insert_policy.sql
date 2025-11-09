-- Fix: Add missing INSERT policy for profiles table
-- This allows users to create their own profile if it doesn't exist

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

