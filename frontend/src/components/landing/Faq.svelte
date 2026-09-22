<script lang="ts">
  import Section from "../Section.svelte";
  import Accordion from "../../ui/Accordion.svelte";
  import Lien from "../Lien.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import type { NomDePage } from "../../lib/routes";

  /** Une réponse se lit en trois sortes de morceaux : du texte, un jeton de
   *  code, un lien interne. Le dictionnaire les donne dans cet ordre. */
  const items = $derived(i18n.t.faq.items);

  const estChaine = (s: unknown): s is string => typeof s === "string";
  const estCode = (s: object): s is { code: string } => "code" in s;
</script>

<Section title={i18n.t.faq.heading}>
  <Accordion
    {items}
    class="mx-auto max-w-4xl"
    triggerClass="text-lg font-semibold"
    contentClass="mx-auto max-w-3xl text-justify hyphens-auto text-muted-foreground"
  >
    {#snippet contenu(i)}
      {#each items[i].answer as morceau, j (j)}
        {#if estChaine(morceau)}{morceau}{:else if estCode(morceau)}<code
            class="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
            >{morceau.code}</code
          >{:else}<Lien
            vers={morceau.link.href.replace(/^\//, "") as NomDePage}
            class="underline hover:text-foreground">{morceau.link.text}</Lien
          >{/if}
      {/each}
    {/snippet}
  </Accordion>
</Section>
