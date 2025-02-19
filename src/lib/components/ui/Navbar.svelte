<!-- Navbar.svelte -->
<script lang="ts">
    import { slide } from 'svelte/transition';
    import { Settings } from 'lucide-svelte';
    import { userStore } from '$lib/stores/userStore';
    import { onMount } from 'svelte';
    
    let logo = $state('/logo.png')
    let isMenuOpen = $state(false);
    let isMobile = $state(false);
    let isAdmin = $state(false);

    const menuItems = $state([
        { title: 'ΦΙΛΟΣΟΦΙΑ', path: '/philosophy' },
        { title: 'ΣΥΝΤΑΓΕΣ', path: '/recipes' },
        { title: 'ΕΞΟΠΛΙΣΜΟΣ', path: '/equipment' },
        { title: 'ΕΠΙΚΟΙΝΩΝΙΑ', path: '/contact' }
    ]);
    
    $effect(() => {
        isAdmin = $userStore.user?.role === 'admin';
    });

    function checkMobile() {
        isMobile = window.innerWidth < 768;
    }
    
    onMount(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.style.overflow = 'auto';
        };
    });

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    }
</script>

<nav class="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/15 to-transparent">
    <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-20">
            <a href="/" class="flex-shrink-0">
                <div class="flex items-center">
                  <div class="w-36 h-12 relative transition-all duration-300 ease-in-out hover:scale-110">
                    <img
                      src={logo}
                      alt="logo company"
                    />
                  </div>
                </div>
            </a>

            <!-- Mobile Menu Button -->
            <button
                class="md:hidden text-[#8B6B4A] p-2 hover:text-[#6F563C] shadow-md rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-300"
                onclick={toggleMenu}
                aria-label="Toggle menu"
            >
                {#if !isMenuOpen}
                    <svg class="w-6 h-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2.5} d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                {:else}
                    <svg class="w-6 h-6 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2.5} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                {/if}
            </button>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-10">
                {#each menuItems as { title, path }}
                    <a 
                        href={path}
                        class="relative text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-base font-black 
                               transition-all duration-300 ease-in-out transform hover:-translate-y-px
                               drop-shadow-sm hover:drop-shadow-lg
                               after:absolute after:w-0 after:h-0.5 after:bg-[#6F563C] 
                               after:left-0 after:bottom-[-4px] after:transition-all after:duration-300
                               hover:after:w-full"
                    >
                        {title}
                    </a>
                {/each}
                {#if isAdmin}
                    <a 
                        href="/settings"
                        class="text-[#8B6B4A] hover:text-[#6F563C] transition-colors duration-300"
                        aria-label="Settings"
                    >
                        <Settings size={24} />
                    </a>
                {/if}
            </div>
        </div>

        <!-- Mobile Menu -->
        {#if isMenuOpen && isMobile}
            <div
                class="md:hidden fixed top-23 left-0 w-full h-[calc(100vh-44rem)] bg-white/90 shadow-xl backdrop-blur-md overflow-y-auto"
                transition:slide={{ duration: 300 }}
            >
                <div class="flex flex-col space-y-4 p-6">
                    {#each menuItems as { title, path }}
                        <a
                            href={path}
                            class="relative text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase
                                   transition-all duration-300 ease-in-out transform hover:-translate-y-px
                                   drop-shadow-sm hover:drop-shadow-lg
                                   after:absolute after:w-0 after:h-0.5 after:bg-[#6F563C] 
                                   after:left-0 after:bottom-[-4px] after:transition-all after:duration-300
                                   hover:after:w-full"
                            onclick={() => {
                                isMenuOpen = false;
                                document.body.style.overflow = 'auto';
                            }}
                        >
                            {title}
                        </a>
                    {/each}
                    {#if isAdmin}
                        <a
                            href="/settings"
                            class="relative text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase
                                   transition-all duration-300 ease-in-out transform hover:-translate-y-px
                                   drop-shadow-sm hover:drop-shadow-lg
                                   after:absolute after:w-0 after:h-0.5 after:bg-[#6F563C] 
                                   after:left-0 after:bottom-[-4px] after:transition-all after:duration-300
                                   hover:after:w-full
                                   flex items-center gap-2"
                            onclick={() => {
                                isMenuOpen = false;
                                document.body.style.overflow = 'auto';
                            }}
                        >
                            <Settings size={20} />
                        </a>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</nav>