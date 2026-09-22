<script lang="ts">
  import Logo from "./Logo.svelte";
  import Lien from "./Lien.svelte";
  import { t } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import type { NomDePage } from "../lib/routes";

  const PROJETS: NomDePage[] = ["piighost", "api", "chat", "proofreader"];
  const annee = new Date().getFullYear();
</script>

<footer class="mt-20 border-t bg-sidebar">
  <div class="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
    <div>
      <Logo size={18} />
      <p class="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
        {t("home.lede")}
      </p>
    </div>

    <nav aria-label={t("nav.projects")}>
      <p class="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
        {t("nav.projects")}
      </p>
      <ul class="flex flex-col gap-1.5">
        {#each PROJETS as projet (projet)}
          <li>
            <Lien vers={projet} class="text-sm text-muted-foreground hover:text-foreground">
              {t(`project.${projet}.title`)}
            </Lien>
          </li>
        {/each}
      </ul>
    </nav>

    <div>
      <p class="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
        piighost
      </p>
      <ul class="flex flex-col gap-1.5 text-sm">
        <li>
          <Lien vers="philosophy" class="text-muted-foreground hover:text-foreground">
            {t("nav.philosophy")}
          </Lien>
        </li>
        <li>
          <a
            href="https://athroniaeth.github.io/piighost/"
            class="text-muted-foreground hover:text-foreground"
            onclick={() => track({ name: "outbound", props: { destination: "docs", page: router.nom } })}
            >{t("nav.docs")}</a
          >
        </li>
        <li>
          <a
            href="https://github.com/Athroniaeth/piighost"
            class="text-muted-foreground hover:text-foreground"
            onclick={() => track({ name: "outbound", props: { destination: "github", page: router.nom } })}
            >{t("nav.github")}</a
          >
        </li>
      </ul>
    </div>
  </div>

  <div class="border-t">
    <p class="mx-auto flex max-w-6xl justify-between px-5 py-4 font-mono text-[0.6875rem] text-muted-foreground">
      <span>piighost {annee}</span>
      <span>{t("footer.rights")}</span>
    </p>
  </div>
</footer>
