<script lang="ts">
  import llamaindex from "../assets/marques/llamaindex.png";

  /**
   * La marque d'un framework, à sa couleur officielle.
   *
   * LangChain et Pydantic sont des tracés, repris de simple-icons, dont les
   * icônes sont en CC0. Leurs couleurs passent par la couche de tokens, comme
   * les drapeaux : la couleur d'une marque est fixée par elle, et l'éclaircir
   * en mode sombre en ferait une autre marque.
   *
   * LlamaIndex n'existe pas en vectoriel public. Ce qui suit est son favicon,
   * décodé depuis l'ICO. Il porte sa propre tuile, là où les deux autres sont
   * des glyphes nus : c'est visible et c'est leur dessin, pas une erreur ici.
   */
  type Marque = "langchain" | "pydantic" | "llamaindex";

  let { marque, class: extra = "" }: { marque: Marque; class?: string } =
    $props();

  const LANGCHAIN =
    "M13.796 0a6.93 6.93 0 0 0-4.91 2.019L5.451 5.455l3.273 3.27 3.432-3.432a2.284 2.284 0 0 1 3.277 0 " +
    "2.28 2.28 0 0 1 0 3.275L12 12.001l3.273 3.273 3.433-3.435c2.692-2.692 2.692-7.127 0-9.82A6.92 6.92 " +
    "0 0 0 13.796 0m-5.07 8.728-3.433 3.434c-2.692 2.693-2.692 7.126 0 9.819A6.92 6.92 0 0 0 10.203 24a6.93 " +
    "6.93 0 0 0 4.911-2.02l3.432-3.432-3.271-3.272-3.433 3.433a2.284 2.284 0 0 1-3.277 0 2.28 2.28 0 0 1 " +
    "0-3.276L12 12z";

  const PYDANTIC =
    "m23.826 17.316-4.23-5.866-6.847-9.496c-.348-.48-1.151-.48-1.497 0l-6.845 9.494-4.233 5.868a.925.925 " +
    "0 0 0 .46 1.417l11.078 3.626h.002a.92.92 0 0 0 .572 0h.002l11.077-3.626c.28-.092.5-.31.59-.592a.916.916 " +
    "0 0 0-.13-.825h.002ZM12.001 4.07l4.44 6.158-4.152-1.36c-.032-.01-.066-.008-.098-.016a.8.8 0 0 " +
    "0-.096-.016c-.032-.004-.062-.016-.094-.016s-.062.012-.094.016a.74.74 0 0 0-.096.016c-.032.006-.066.006-.096.016L7.59 " +
    "10.221l-.026.008 4.44-6.158h-.002Zm-6.273 8.7 4.834-1.583.516-.168v9.19L2.41 17.372l3.317-4.6Zm7.197 " +
    "7.437V11.02l5.35 1.752 3.316 4.598-8.666 2.838Z";
</script>

{#if marque === "llamaindex"}
  <img src={llamaindex} alt="" aria-hidden="true" class={extra} />
{:else}
  <svg
    viewBox="0 0 24 24"
    class={extra}
    role="img"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d={marque === "langchain" ? LANGCHAIN : PYDANTIC}
      fill={marque === "langchain"
        ? "var(--logo-langchain)"
        : "var(--logo-pydantic)"}
    />
  </svg>
{/if}
