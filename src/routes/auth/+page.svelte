<!-- LoginForm.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { type SubmitFunction } from "@sveltejs/kit";
  import Button from '$lib/components/ui/Button.svelte';
  import type { ActionResult } from "@sveltejs/kit";
  
  let loading: boolean = $state(false);
  let error: string = $state('');
  let emailError: boolean = $state(false);
  let passwordError: boolean = $state(false);
  
  const handleLogin: SubmitFunction = () => {
    loading = true;
    emailError = false;
    passwordError = false;
    error = '';
    
    return async ({ update, result }: { update: any, result: ActionResult }) => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          update();
          resolve();
        }, 1000);
        loading = false;
        if (result.type === 'failure') {
          error = result.data?.message || 'Login failed';
          
          // Set field-specific errors if they exist in the result
          if (result.data?.fields) {
            emailError = !!result.data.fields.email;
            passwordError = !!result.data.fields.password;
          } else {
            // If no specific fields, highlight both
            emailError = true;
            passwordError = true;
          }
        }
      });
    };
  };
</script>

<div class="min-h-screen flex flex-col md:flex-row">
  <!-- Left side - Logo Section -->
  <div class="hidden md:flex md:w-1/2 bg-white items-center justify-center relative">
    <div class="max-w-96 max-h-96">
      <img
        src="/auth.jpg"
        alt="Tailor Made Coffee Roasters"
        class="w-full h-full object-contain"
      />
    </div>
  </div>

  <!-- Right side - Login Form -->
  <div class="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-neutral-50 p-4">
    <div class="w-full max-w-md space-y-8 bg-white rounded-xl shadow-lg p-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p class="mt-2 text-sm text-gray-600">Log in</p>
      </div>

      <form method="POST" action="?/login" use:enhance={handleLogin} class="mt-8 space-y-6">
        {#if error}
          <p class="text-sm text-red-600 font-medium">{error}</p>
        {/if}
        
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="mt-1 block w-full rounded-lg border 
                     {emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#C4A484] focus:ring-[#C4A484]'} 
                     px-3 py-2 shadow-sm focus:outline-none focus:ring-1
                     placeholder:text-gray-400"
              placeholder="name@company.com"
            />
            {#if emailError}
              <p class="mt-1 text-xs text-red-600">Please enter a valid email address</p>
            {/if}
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="*********"
              class="mt-1 block w-full rounded-lg border 
                     {passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#C4A484] focus:ring-[#C4A484]'} 
                     px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            />
            {#if passwordError}
              <p class="mt-1 text-xs text-red-600">Please enter your password</p>
            {/if}
          </div>
        </div>

        <div class="flex items-center justify-end">
          <a href="/reset-password" class="text-sm font-medium text-[#C4A484] hover:text-[#b39476]">
            Forgot your password?
          </a>
        </div>

        <div>
          <Button data={loading}></Button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>