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
  class={cn("group relative overflow-hidden rounded-lg border bg-muted", extra)}
>
  <CopyButton value={code} class="absolute right-2 top-2 size-7" />
  <!-- On a phone the lines overflow and scroll under the copy button: the
       button gets a band of its own above the code. -->
  <pre
    class={cn(
      "overflow-x-auto p-4 font-mono text-sm leading-relaxed max-sm:pt-11",
      wrap && "whitespace-pre-wrap break-all",
    )}><code
      >{#if tokens}{#each tokens as token, index (index)}<span
            class="tok-{token.kind}">{token.text}</span
          >{/each}{:else}{code}{/if}</code
    ></pre>
</div>
