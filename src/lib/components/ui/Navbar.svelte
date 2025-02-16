<!-- Navbar.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    
    let logo:string = $state('/logo.png')
    
    let isMenuOpen = $state(false);
    let isMobile = $state(false);

    const menuItems = $state([
        { title: 'ΦΙΛΟΣΟΦΙΑ', path: '/philosophy' },
        { title: 'ΣΥΝΤΑΓΕΣ', path: '/recipes' },
        { title: 'ΕΞΟΠΛΙΣΜΟΣ', path: '/equipment' },
        { title: 'ΕΠΙΚΟΙΝΩΝΙΑ', path: '/contact' }
    ]);
    
    onMount(() => {
      const checkMobile = () => {
        isMobile = window.innerWidth < 768;
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    });

    function toggleMenu() {
      isMenuOpen = !isMenuOpen;
    }
</script>

<nav class="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/15 to-transparent">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <a href="/" class="flex-shrink-0">
          <div class="flex items-center">
            <div class="w-36 h-12 relative">
              <img 
                src={logo} 
                alt="logo company" 
              />
            </div>
          </div>
        </a>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden text-[#8B6B4A] p-2 hover:text-[#6F563C] shadow-md rounded-lg bg-white/10 backdrop-blur-sm"
          Onclick={toggleMenu}
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
        <div class="hidden md:flex space-x-10 items-center">
            {#each menuItems as { title, path }}
                <a 
                href={path}
                class="nav-link text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-base font-black"
                >
                {title}
                </a>
            {/each}
        </div>
      </div>

      <!-- Mobile Menu -->
      {#if isMenuOpen && isMobile}
        <div
          class="md:hidden absolute top-20 left-0 w-full bg-white/90 shadow-xl backdrop-blur-md"
          transition:slide={{ duration: 300 }}
        >
          <div class="flex flex-col space-y-4 p-6">
            <a
              href="/philosophy"
              class="nav-link text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase"
              onclick={() => isMenuOpen = false}
            >
              Philosophy
            </a>
            <a
              href="/locations"
              class="nav-link text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase"
              onclick={() => isMenuOpen = false}
            >
              Locations
            </a>
            <a
              href="/shop"
              class="nav-link text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase"
              onclick={() => isMenuOpen = false}
            >
              Shop
            </a>
            <a
              href="/contact"
              class="nav-link text-[#8B6B4A] hover:text-[#6F563C] tracking-widest text-sm font-black uppercase"
              onclick={() => isMenuOpen = false}
            >
              Contact
            </a>
          </div>
        </div>
      {/if}
    </div>
</nav>

<style>
    nav {
      font-family: 'Arial', sans-serif;
    }

    .nav-link {
      position: relative;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -4px;
      left: 0;
      background-color: #6F563C;
      transition: width 0.3s ease;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .nav-link:hover {
      transform: translateY(-1px);
      text-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
</style>