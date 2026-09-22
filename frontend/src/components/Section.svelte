<script lang="ts">
  import type { Snippet } from "svelte";

  /** Une section de vitrine : surtitre, titre, chapeau, contenu. */
  let {
    kicker = null,
    title,
    lede = null,
    children,
  }: {
    kicker?: string | null;
    title: string;
    lede?: string | null;
    children: Snippet;
  } = $props();
</script>

<section class="border-t py-16">
  <div class="mx-auto max-w-6xl px-5">
    {#if kicker}
      <p class="mb-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
        {kicker}
      </p>
    {/if}
    <h2 class="text-[1.75rem] font-semibold tracking-[-0.03em]">{title}</h2>
    {#if lede}
      <p class="mt-2.5 max-w-[62ch] text-[0.95rem] leading-relaxed text-muted-foreground">{lede}</p>
    {/if}
    <div class="mt-8">
      {@render children()}
    </div>
  </div>
</section>
