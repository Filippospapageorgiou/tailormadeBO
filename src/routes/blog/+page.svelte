<script lang="ts">
	import type { PageData } from './$types';
	import type { BlogWithAuthor } from '$lib/types/database.types';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Tag, Calendar, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { data } = $props();
	let blogs = $derived(data.blogs as BlogWithAuthor[]);

	let mounted = $state(false);
	// svelte-ignore state_referenced_locally
	let activeImageIndices = $state(blogs.map(() => 0));
	// svelte-ignore state_referenced_locally
	let transitioning = $state(blogs.map(() => false)); 
	
	// Για την καταγραφή των άρθρων που έχουν διαβαστεί
	let blogReadTimeouts = $state<ReturnType<typeof setTimeout>[]>([]);
	let readBlogs = $state<Set<number>>(new Set());
	let observerMap = $state<Map<number, IntersectionObserver>>(new Map());
	let blogRefs = $state<HTMLElement[]>([]);
	
	// Αρχικοποίηση του array με null τιμές
	$effect(() => {
		blogRefs = Array(blogs.length).fill(null);
		blogReadTimeouts = Array(blogs.length).fill(null);
	});
	
	// Η ελάχιστη διάρκεια που πρέπει να είναι ορατό ένα blog για να θεωρηθεί ως αναγνωσμένο (2 δευτερόλεπτα)
	const READ_THRESHOLD_MS = 2000;

	onMount(() => {
		setTimeout(() => {
			mounted = true;
			
			// Δημιουργία Intersection Observers για κάθε blog με μια μικρή καθυστέρηση
			// για να βεβαιωθούμε ότι τα refs έχουν συνδεθεί
			setTimeout(() => {
				setupIntersectionObservers();
			}, 500);
		}, 100);
		
		// Καθαρισμός όταν το component καταστρέφεται
		return () => {
			cleanupTimeouts();
			cleanupObservers();
		};
	});
	
	// Καθαρισμός timeouts
	function cleanupTimeouts() {
		blogReadTimeouts.forEach(timeout => {
			if (timeout) clearTimeout(timeout);
		});
	}
	
	// Καθαρισμός observers
	function cleanupObservers() {
		observerMap.forEach(observer => observer.disconnect());
		observerMap.clear();
	}
	
	// Ρύθμιση των intersection observers για κάθε blog
	function setupIntersectionObservers() {
		blogs.forEach((blog, index) => {
			const element = blogRefs[index];
			if (!element) return;
			
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							// Το blog είναι ορατό στην οθόνη
							const timeout = setTimeout(() => {
								markBlogAsRead(blog.id);
							}, READ_THRESHOLD_MS);
							
							blogReadTimeouts[index] = timeout;
						} else {
							// Το blog δεν είναι πλέον ορατό
							if (blogReadTimeouts[index]) {
								clearTimeout(blogReadTimeouts[index]);
							}
						}
					});
				},
				{
					threshold: 0.5 // Τουλάχιστον 50% του blog πρέπει να είναι ορατό
				}
			);
			
			observer.observe(element);
			observerMap.set(blog.id, observer);
		});
	}
	
	// Σημείωση ενός blog ως αναγνωσμένου
	async function markBlogAsRead(blogId: number) {
		// Αν το έχουμε ήδη σημειώσει ως αναγνωσμένο στο τρέχον session, δεν το ξανακάνουμε
		if (readBlogs.has(blogId)) return;
		
		try {
			const response = await fetch('/api/blog/read', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ blog_id: blogId })
			});
			
			if (response.ok) {
				// Προσθήκη στη λίστα των τοπικά αναγνωσμένων
				readBlogs.add(blogId);
				console.log(`Blog ${blogId} marked as read`);
			}
		} catch (error) {
			console.error(`Error marking blog ${blogId} as read:`, error);
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('el-GR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).format(date);
	}

	// Διαχείριση πολλαπλών εικόνων για ένα blog post
	async function nextImage(blogIndex: number) {
		if (transitioning[blogIndex]) return; // Αν γίνεται ήδη μετάβαση, δεν κάνουμε τίποτα

		const blog = blogs[blogIndex];
		if (blog.images && blog.images.length > 1) {
			transitioning[blogIndex] = true;
			// Ξεκινάμε τη μετάβαση

			// Περιμένουμε λίγο για το fade out
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Αλλάζουμε την εικόνα
			activeImageIndices[blogIndex] = (activeImageIndices[blogIndex] + 1) % blog.images.length;

			// Περιμένουμε λίγο και για το fade in
			await new Promise((resolve) => setTimeout(resolve, 400));

			transitioning[blogIndex] = false;
		}
	}

	async function prevImage(blogIndex: number) {
		if (transitioning[blogIndex]) return; // Αν γίνεται ήδη μετάβαση, δεν κάνουμε τίποτα

		const blog = blogs[blogIndex];
		if (blog.images && blog.images.length > 1) {
			transitioning[blogIndex] = true;
			// Ξεκινάμε τη μετάβαση

			// Περιμένουμε λίγο για το fade out
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Αλλάζουμε την εικόνα
			activeImageIndices[blogIndex] =
				(activeImageIndices[blogIndex] - 1 + blog.images.length) % blog.images.length;

			// Περιμένουμε λίγο και για το fade in
			await new Promise((resolve) => setTimeout(resolve, 400));

			transitioning[blogIndex] = false;
		}
	}
</script>

<Navbar />
{#if mounted}
	<main class="min-h-screen bg-white pt-24 pb-16" transition:fade={{ duration: 500, delay: 200 }}>
		<div class="container mx-auto px-4">
			<header class="mb-12 text-center">
				<h1
					class="font-display mb-4 text-4xl font-medium text-[#8B6B4A] md:text-5xl"
					in:fly={{ y: 20, duration: 800, delay: 300 }}
				>
					Tailormade Blog
				</h1>
			</header>
			{#if blogs.length > 0}
				<div class="mx-auto max-w-5xl space-y-12">
					{#each blogs as blog, index (blog.id)}
						<article
							bind:this={blogRefs[index]}
							class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
							in:fade={{ duration: 500, delay: 600 + index * 100 }}
							onmouseenter={() => {
								// Ξεκινάμε ένα timeout για την καταγραφή ανάγνωσης
								const timeout = setTimeout(() => {
									markBlogAsRead(blog.id);
								}, READ_THRESHOLD_MS);
								
								blogReadTimeouts[index] = timeout;
							}}
							onmouseleave={() => {
								// Ακυρώνουμε το timeout αν ο χρήστης φύγει πριν ολοκληρωθεί ο χρόνος
								if (blogReadTimeouts[index]) {
									clearTimeout(blogReadTimeouts[index]);
								}
							}}
						>
							<div class="p-6 md:p-8">
								<!-- Header με πληροφορίες συγγραφέα και ημερομηνία -->
								<div class="mb-6 flex items-center justify-between">
									<div class="flex items-center">
										<img
											src={blog.author?.image_url || '/placeholder-avatar.jpg'}
											alt={blog.author?.username || 'Anonymous'}
											class="mr-3 h-10 w-10 rounded-full object-cover"
										/>
										<span class="text-sm text-gray-600">{blog.author?.username || 'Anonymous'}</span
										>
									</div>

									<div class="flex items-center text-sm text-gray-500">
										<Calendar size={16} class="mr-1.5" />
										{formatDate(blog.created_at)}
									</div>
								</div>

								<!-- Τίτλος του άρθρου -->
								<h2
									class="font-display mb-4 text-2xl font-medium tracking-wide text-gray-900 md:text-3xl"
								>
									{blog.title}
								</h2>

								<!-- Περιγραφή (αν υπάρχει) -->
								{#if blog.description}
									<p class="mb-6 text-lg leading-relaxed text-gray-700">
										{blog.description}
									</p>
								{/if}

								{#if blog.images && blog.images.length > 0}
									<div
										class="relative mb-6 h-72 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-96"
									>
										<div class="relative h-full w-full overflow-hidden">
											<img
												src={blog.images[activeImageIndices[index]]}
												alt={blog.title}
												class="image-transition h-full w-full object-cover object-center
                                                   {transitioning[index]
													? 'image-fade-out'
													: 'image-fade-in'}"
											/>
										</div>

										{#if blog.images.length > 1}
											<!-- Βελτιωμένα κουμπιά πλοήγησης με aria-label -->
											<div
												class="pointer-events-none absolute inset-0 flex items-center justify-between"
											>
												<button
													class="nav-button pointer-events-auto ml-3 rounded-full bg-white/70 p-2 hover:bg-white"
													onclick={(e) => {
														e.preventDefault();
														prevImage(index);
													}}
													disabled={transitioning[index]}
													aria-label="Προηγούμενη εικόνα"
												>
													<ChevronLeft size={24} class="text-[#8B6B4A]" />
												</button>
												<button
													class="nav-button pointer-events-auto mr-3 rounded-full bg-white/70 p-2 hover:bg-white"
													onclick={(e) => {
														e.preventDefault();
														nextImage(index);
													}}
													disabled={transitioning[index]}
													aria-label="Επόμενη εικόνα"
												>
													<ChevronRight size={24} class="text-[#8B6B4A]" />
												</button>
											</div>

											<!-- Δείκτες εικόνων με aria-label -->
											<div class="absolute right-0 bottom-3 left-0 flex justify-center gap-2">
												{#each blog.images as _, i}
													<button
														onclick={() => {
															if (!transitioning[index] && activeImageIndices[index] !== i) {
																transitioning[index] = true;
																setTimeout(() => {
																	activeImageIndices[index] = i;
																	setTimeout(() => {
																		transitioning[index] = false;
																	}, 400);
																}, 300);
															}
														}}
														class={`h-2.5 w-2.5 cursor-pointer rounded-full transition-all duration-300 
                   ${i === activeImageIndices[index] ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
														disabled={transitioning[index]}
														aria-label={`Εικόνα ${i + 1} από ${blog.images.length}`}
													></button>
												{/each}
											</div>
										{/if}
									</div>
								{/if}

								<div class="prose prose-lg mb-6 max-w-none text-gray-700">
									{#if blog.content.includes('- ')}
										<div class="space-y-4">
											{#each blog.content.split('-') as paragraph, i}
												{#if i === 0}
													{#if paragraph.trim()}
														<p>{paragraph.trim()}</p>
													{/if}
												{:else}
													<div class="flex items-start">
														<span class="mt-1 mr-2 font-bold text-[#8B6B4A]">•</span>
														<p>{paragraph.trim()}</p>
													</div>
												{/if}
											{/each}
										</div>
									{:else}
										<p class="leading-relaxed whitespace-pre-line">{blog.content}</p>
									{/if}
								</div>

								<!-- Tags -->
								{#if blog.tags && blog.tags.length > 0}
									<div class="mt-6 flex flex-wrap gap-2">
										{#each blog.tags as tag}
											<span
												class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-[#8B6B4A]"
											>
												<Tag size={14} class="mr-1.5" />
												{tag}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center" in:fade={{ duration: 800, delay: 600 }}>
					<p class="text-lg text-gray-500">Δεν υπάρχουν διαθέσιμα άρθρα στο blog αυτή τη στιγμή.</p>
				</div>
			{/if}
		</div>
	</main>
{/if}

<style>
	.image-transition {
		transition:
			opacity 0.5s ease-in-out,
			transform 0.5s ease-in-out;
	}

	.image-fade-out {
		opacity: 0;
		transform: scale(0.98);
	}

	.image-fade-in {
		opacity: 1;
		transform: scale(1);
	}

	/* Προσθέτουμε ένα όμορφο εφέ στα κουμπιά πλοήγησης */
	.nav-button {
		transition: all 0.3s ease;
	}

	.nav-button:hover {
		transform: scale(1.1);
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
</style>