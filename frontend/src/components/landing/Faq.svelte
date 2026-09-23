<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Accordion from "../../ui/Accordion.svelte";
  import GithubIcon from "../GithubIcon.svelte";
  import BookText from "@lucide/svelte/icons/book-text";
  import Lien from "../Lien.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { DISCORD_URL, getProject } from "../../lib/site";
  import type { NomDePage } from "../../lib/routes";

  /**
   * Le titre et l'aide à gauche, les questions à droite.
   *
   * La colonne de gauche donne une suite à qui n'a pas trouvé sa réponse :
   * la communauté, le suivi des problèmes, la documentation. Chaque lien porte
   * la marque du lieu où il mène, comme les frameworks du bandeau. La
   * documentation n'est pas un autre site mais celle de piighost : elle prend
   * un pictogramme neutre, un manuel, à la couleur du texte.
   *
   * Une réponse se lit en trois sortes de morceaux : du texte, un jeton de
   * code, un lien interne. Le dictionnaire les donne dans cet ordre.
   */
  const faq = $derived(i18n.t.faq);
  const piighost = getProject("piighost");

  const DISCORD =
    "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z";

  const aides = $derived([
    {
      cle: "discord",
      nom: faq.help.discord,
      detail: "discord.gg",
      href: DISCORD_URL,
    },
    {
      cle: "github",
      nom: faq.help.issue,
      detail: "GitHub",
      href: `${piighost.repo}/issues`,
    },
    {
      cle: "docs",
      nom: faq.help.docs,
      detail: "athroniaeth.github.io",
      href: piighost.docs ?? piighost.repo,
    },
  ]);

  const estChaine = (s: unknown): s is string => typeof s === "string";
  const estCode = (s: object): s is { code: string } => "code" in s;
</script>

<section
  id="faq"
  class="flex min-h-[calc(100dvh-4rem)] scroll-mt-16 flex-col justify-center"
>
  <div
    class="mx-auto grid w-full max-w-7xl items-start gap-12 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"
  >
    <div>
      <p
        class="mb-2 text-sm font-semibold uppercase tracking-wide text-primary"
      >
        {faq.eyebrow}
      </p>
      <h2 class="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {faq.heading}
      </h2>
      <p class="mt-4 max-w-md text-muted-foreground">{faq.helpIntro}</p>
      <ul class="mt-8 grid max-w-md gap-2.5">
        {#each aides as aide (aide.cle)}
          <li>
            <a
              href={aide.href}
              target="_blank"
              rel="noreferrer"
              class="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 font-medium transition-colors hover:border-primary"
            >
              {#if aide.cle === "discord"}
                <svg
                  viewBox="0 0 24 24"
                  class="size-5 shrink-0"
                  aria-hidden="true"
                  ><path d={DISCORD} fill="var(--logo-discord)" /></svg
                >
              {:else if aide.cle === "github"}
                <GithubIcon class="size-5 shrink-0" />
              {:else}
                <BookText class="size-5 shrink-0" aria-hidden="true" />
              {/if}
              {aide.nom}
              <span
                class="ml-auto hidden text-sm font-normal text-muted-foreground sm:inline"
                >{aide.detail}</span
              >
              <ArrowUpRight
                class="size-4 shrink-0 text-muted-foreground transition-transform max-sm:ml-auto group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <Accordion
      items={faq.items}
      ouvert={0}
      triggerClass="text-[1.0625rem] font-semibold"
      contentClass="max-w-[68ch] text-muted-foreground"
    >
      {#snippet contenu(i)}
        {#each faq.items[i].answer as morceau, j (j)}
          {#if estChaine(morceau)}{morceau}{:else if estCode(morceau)}<code
              class="whitespace-nowrap rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
              >{morceau.code}</code
            >{:else}<Lien
              vers={morceau.link.href.replace(/^\//, "") as NomDePage}
              class="underline hover:text-foreground">{morceau.link.text}</Lien
            >{/if}
        {/each}
      {/snippet}
    </Accordion>
  </div>
</section>
