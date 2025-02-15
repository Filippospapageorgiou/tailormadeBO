<script>
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation';
  
	let { data, children } = $props()
	let { session, supabase } = $derived(data)
  
	onMount(() => {
	  const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
		  invalidate('supabase:auth')
		}
	  })
  
	  return () => data.subscription.unsubscribe()
	})

	const logout = async () => {
  	const { error } = await supabase.auth.signOut()
  	if (error) {
    	console.error(error)
  	} else {
    	await invalidate('supabase:auth') // Ακυρώνει το cache
    	goto('/auth') // Ανακατεύθυνση στο /auth
  	}
}
</script>
  
<header>
	<nav>
	  <a href="/">Home</a>
	</nav>
	<button onclick={logout}>Logout</button>
  </header>
  <main>
	{@render children()}
</main>