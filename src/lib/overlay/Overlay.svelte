<script>
  // @ts-nocheck

  // === Imports ===
  import { createEventDispatcher } from "svelte";
  import { XIcon } from "svelte-feather-icons";

  // === Component Props ===

  /**
   * Determines whether the overlay is open and visible.
   * @type {boolean}
   */
  export let isOpen = false;

  /**
   * The heading text displayed at the top of the overlay.
   * @type {string}
   */
  export let heading = "Overlay Heading";

  // === Component State (Variables) ===

  /**
   * Tracks whether the overlay is in the process of fading out.
   * This allows the fade-out animation to complete before the overlay is removed from the DOM.
   * @type {boolean}
   */
  let fadingOut = false;

  // === Event Dispatcher ===

  /**
   * Creates an event dispatcher to communicate with parent components.
   * Used to emit a 'close' event when the overlay is closed.
   */
  const dispatch = createEventDispatcher();

  // === Functions ===

  /**
   * Handles click events on the overlay background.
   * If the user clicks outside the overlay content, initiate fade-out and close the overlay.
   * @param {MouseEvent} event - The click event object.
   */
  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      fadeOutAndClose();
    }
  }

  /**
   * Initiates the fade-out animation and closes the overlay after the animation duration.
   * Sets `fadingOut` to true to trigger the fade-out CSS class.
   * After 475ms (matching the CSS animation duration), resets `fadingOut`, updates `isOpen`, and dispatches a 'close' event.
   */
  function fadeOutAndClose() {
    fadingOut = true;
    setTimeout(() => {
      fadingOut = false;
      isOpen = false;
      dispatch("close");
    }, 475); // Duration should match the CSS animation duration
  }
</script>

<!-- === Markup === -->

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
{#if isOpen || fadingOut}
  <!--
    Overlay Background:
    - Fixed positioning to cover the entire viewport.
    - Semi-transparent background to obscure underlying content.
    - Flexbox to center the overlay content.
    - Conditional classes to handle fade-in and fade-out animations.
  -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class={`fixed inset-0 text-white text-mono bg-bg bg-opacity-95 flex items-center justify-center z-50 p-4 md:p-10 ${
      fadingOut ? "animate-fade-out" : "animate-fade-in"
    }`}
    on:click={handleOverlayClick}
    aria-modal="true"
    role="dialog"
    aria-labelledby="overlay-heading"
  >
    <!--
      Overlay Content Container:
      - Relative positioning to contain absolutely positioned children (e.g., close button).
      - Padding and border for visual structure.
      - Flexbox for vertical stacking of elements.
      - Scrollable content area with a maximum height.
    -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="p-6 border border-white relative flex flex-col w-full max-h-[80vh] overflow-y-auto no-scrollbar"
      on:click|stopPropagation
    >
      <!--
        Close Button:
        - Positioned absolutely in the top-right corner.
        - Accessible label for screen readers.
        - Click event to trigger fade-out and close the overlay.
      -->
      <button
        class="absolute top-2 right-2 m-2 font-light text-md text-white bg-bg p-1 transform transition-transform duration-300 ease-in-out hover:scale-105"
        on:click={fadeOutAndClose}
        aria-label="Close overlay"
      >
        <XIcon strokeWidth="0.75px" size="24" />
      </button>

      <!--
        Overlay Heading:
        - Centered text to indicate the purpose of the overlay.
        - Responsive text sizing for different screen widths.
      -->
      <h1
        id="overlay-heading"
        class="text-lg md:text-xl font-mono mb-4 text-center"
      >
        {heading}
      </h1>

      <!--
        Slot for Dynamic Content:
        - Allows parent components to inject custom content into the overlay.
      -->
      <slot></slot>
    </div>
  </div>
{/if}
