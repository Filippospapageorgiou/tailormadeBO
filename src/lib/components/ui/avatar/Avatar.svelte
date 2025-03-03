<!-- Avatar.svelte -->
<script lang="ts">
    import { Avatar } from "bits-ui";
    import { userStore } from "$lib/stores/userStore";
    import { onMount, onDestroy } from "svelte";
    import { Settings, LogOut } from "lucide-svelte";
    import { fade } from "svelte/transition";

    let bars:number[] = $state(Array(12).fill(0));
    
    let loadingStatus = $state<Avatar.RootProps["loadingStatus"]>("loading");
    let image_url = $state("");
    let isDropdownOpen = $state(false);
    let isAdmin = $state(false);
    let avatarRef: HTMLElement;
    
    $effect(() => {
        image_url = $userStore.user?.image_url || "";
        isAdmin = $userStore.user?.role === 'admin';
    });
    
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }
    
    function closeDropdown() {
        isDropdownOpen = false;
    }
    
    async function handleLogout() {
        
        const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
        if (!response.ok) {
            throw new Error('Αποτυχία αποσύνδεσης');
        }
        userStore.clearUser();
        window.location.reload()
        closeDropdown();
    }
</script>

<div class="relative" bind:this={avatarRef}>
    <button 
        onclick={toggleDropdown}
        class="flex items-center focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
    >
        <Avatar.Root
            bind:loadingStatus
            class="h-10 w-10 rounded-full overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 
                   shadow-md hover:shadow-lg border-2 {loadingStatus === 'loaded'
                   ? 'border-[#8B6B4A]/40'
                   : 'border-transparent'} bg-white/10 backdrop-blur-sm text-[#8B6B4A] text-[17px] font-medium uppercase"
        >
            <div
                class="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
            >
                <Avatar.Image src={image_url} alt="Profile" />
                <Avatar.Fallback class="flex items-center justify-center h-full w-full bg-white/20 backdrop-blur-sm">
                    {$userStore.user?.username?.charAt(0) || "U"}
                </Avatar.Fallback>
            </div>
        </Avatar.Root>
    </button>
    
    {#if isDropdownOpen}
        <div 
            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1  ring-1 ring-black ring-opacity-5 
                   backdrop-blur-md bg-white/90 z-50 transition-all duration-300 ease-in-out"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
            transition:fade={{ duration: 200 }}
        >
            <div class="px-4 py-3 border-b border-gray-200">
                <p class="text-sm font-medium text-[#8B6B4A]">{$userStore.user?.username || "Χρήστης"}</p>
                <p class="text-xs text-gray-500 truncate">{$userStore.user?.email || ""}</p>
            </div>
            
            {#if isAdmin}
                <a 
                    href="/settings/ingredients" 
                    class="w-full text-left px-4 py-2 text-sm text-[#8B6B4A] hover:bg-[#8B6B4A]/10 flex items-center gap-2 transition-colors duration-200"
                    role="menuitem"
                    onclick={closeDropdown}
                >
                    <Settings size={16} />
                    <span>Ρυθμίσεις</span>
                </a>
            {/if}
            
            <button 
                class="w-full text-left px-4 py-2 text-sm text-[#8B6B4A] hover:bg-[#8B6B4A]/10 flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                role="menuitem"
                onclick={handleLogout}
            >
                <LogOut size={16} />
                <span>Αποσύνδεση</span>
            </button>
        </div>
    {/if}
</div>