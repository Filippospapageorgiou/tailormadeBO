<!-- +page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Navbar from '$lib/components/Navbar.svelte';
  
  const images : string[] = $state([
    '/TAILOR MADE PRESENTATION 2024_page-0002.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0003.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0004.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0005.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0006.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0007.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0008.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0009.jpg',
    '/TAILOR MADE PRESENTATION 2024_page-0010.jpg',
  ]);
  
  let currentImageIndex:number = $state(0);
  let isTransitioning:boolean = $state(false);
  
  onMount(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000);
    
    return () => clearInterval(interval);
  });
  
  function nextImage() {
    if (!isTransitioning) {
      isTransitioning = true;
      currentImageIndex = (currentImageIndex + 1) % images.length;
      setTimeout(() => {
        isTransitioning = false;
      }, 4000); // Αυξήθηκε στα 2000ms για πιο ομαλή μετάβαση
    }
  }
</script>

<Navbar />
<div class="relative h-screen overflow-hidden">
  <!-- Background Images -->
  {#each images as image, index}
    {#if index === currentImageIndex}
      <div
        in:fade={{ duration: 2000 }} 
        out:fade={{ duration: 2000 }}
        class="absolute inset-0 transition-all duration-2000 ease-in-out"
        class:opacity-100={index === currentImageIndex}
        class:opacity-0={index !== currentImageIndex}
      >
        <img
          src={image}
          alt="Background"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/30"></div>
      </div>
    {/if}
  {/each}
  
  <!-- Central Content -->
  <main class="absolute inset-0 flex flex-col items-center justify-center text-white z-40">
    <div class="text-center px-4 max-w-4xl mx-auto">
      <h1 class="text-5xl font-light mb-8 tracking-widest transform translate-y-0 font-display">
        TAILOR MADE COFFEE ROASTERS
      </h1>
      <p class="text-2xl tracking-wider mb-12 font-light font-display text-white">
        SEE THE WORLD THROUGH COFFEE 
      </p>
    </div>
  </main>
  
  <!-- Bottom Text -->
  <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white z-40">
    <p class="text-base tracking-widest font-light text-center">ⓒTAILORMADE</p>
    <p class="text-base tracking-widest font-light">
      CRAFTING EXCEPTIONAL COFFEE EXPERIENCES
    </p>
  </div>
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
  
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>