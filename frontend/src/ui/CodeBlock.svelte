<script lang="ts">
  import CopyButton from "./CopyButton.svelte";
  import {
    pythonTokens,
    regexTokens,
    shellTokens,
    tomlTokens,
  } from "../lib/highlight";
  import { cn } from "../lib/cn";

  /**
   * The studio's code block: bordered, muted tint, copy icon top right. Tokens
   * are classes, never inline styles, so the production CSP accepts them.
   */
  let {
    code,
    language = "plain",
    wrap = false,
    class: extra = "",
  }: {
    code: string;
    language?: "toml" | "regex" | "python" | "bash" | "plain";
    wrap?: boolean;
    class?: string;
  } = $props();

  const TOKENISEURS = {
    toml: tomlTokens,
    regex: regexTokens,
    python: pythonTokens,
    bash: shellTokens,
  };

  const tokens = $derived(
    language === "plain" ? null : TOKENISEURS[language](code),
  );
</script>

<div
  class={cn(
    "group relative overflow-hidden rounded-lg border bg-muted/30",
    extra,
  )}
>
  <CopyButton value={code} class="absolute right-2 top-2 size-7" />
  <pre
    class={cn(
      "overflow-x-auto p-4 font-mono text-sm leading-relaxed",
      wrap && "whitespace-pre-wrap break-all",
    )}><code
      >{#if tokens}{#each tokens as token, index (index)}<span
            class="tok-{token.kind}">{token.text}</span
          >{/each}{:else}{code}{/if}</code
    ></pre>
</div>
