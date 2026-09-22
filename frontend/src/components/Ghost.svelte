<script lang="ts">
  /**
   * Le symbole seul, en currentColor.
   *
   * Les barres à la place des yeux sont les deux points des `i` de piighost,
   * caviardés : leur entraxe reprend le rapport mesuré dans Instrument Sans,
   * 1,638 fois le diamètre du point. Voir brand/logo/README.md.
   *
   * Le tracé est unique avec `fill-rule="evenodd"`, donc les barres sont des
   * trous : la forme se pose sur n'importe quel fond sans découpe.
   */
  let { size = 20, class: extra = "" }: { size?: number; class?: string } =
    $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 32 32"
  class={extra}
  role="img"
  aria-hidden="true"
  focusable="false"
>
  <path
    fill-rule="evenodd"
    fill="currentColor"
    d="M6 27V13a10 10 0 0 1 20 0v14q-3.333 3.6-6.667 0-3.333 3.6-6.666 0-3.333 3.6-6.667 0ZM12.006 14.000h1.600a1.600 1.600 0 0 1 1.600 1.600v0.000a1.600 1.600 0 0 1 -1.600 1.600h-1.600a1.600 1.600 0 0 1 -1.600 -1.600v-0.000a1.600 1.600 0 0 1 1.600 -1.600ZM18.394 14.000h1.600a1.600 1.600 0 0 1 1.600 1.600v0.000a1.600 1.600 0 0 1 -1.600 1.600h-1.600a1.600 1.600 0 0 1 -1.600 -1.600v-0.000a1.600 1.600 0 0 1 1.600 -1.600Z"
  />
</svg>
