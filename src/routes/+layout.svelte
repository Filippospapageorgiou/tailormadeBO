<script>
	import "../app.css"
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	import { userStore } from "$lib/stores/userStore";
	
  
	let { data, children } = $props()
	let { session, supabase, user } = $derived(data)
	
	$effect(() => {
		if(user){
			userStore.setUser(user)
		} else {
			userStore.clearUser()
		}
	});

	onMount(() => {
	  const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
		  invalidate('supabase:auth')
		}
		if (newSession === null) {
			userStore.clearUser()
		}

	  })
  
	  return () => data.subscription.unsubscribe()
	})

	/*const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(error)
    } else {
      await invalidate('supabase:auth')
      window.location.href = '/auth' // Κάνει πλήρες reload
    }*/
</script>
  

{@render children()}
