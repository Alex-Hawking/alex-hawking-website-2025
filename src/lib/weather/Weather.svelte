<script lang="ts">
  // === Imports ===
  import { onDestroy } from "svelte";

  // === Component State (Variables) ===

  // Reference to the weather container element
  let weatherContainer: HTMLElement;

  // Animation frame identifier for managing the animation loop
  let animationFrameId: number | null = null;

  // Intensity counters for rain and snow
  let rainIntensity = 0;
  let snowIntensity = 0;

  // === Functions ===

  /**
   * Creates and animates a single weather drop (rain or snow).
   * @param dropType - The type of drop to create ("rain" or "snow").
   */
  function createWeather(dropType: "rain" | "snow") {
    const drop = document.createElement("div");
    drop.classList.add(dropType === "rain" ? "rain-drop" : "snow-drop");
    drop.classList.add(
      dropType === "rain" ? "animate-rain-fall" : "animate-snow-fall",
    );

    // Assign a random character based on drop type for visual representation
    drop.textContent =
      dropType === "rain"
        ? ["'", '"'][Math.floor(Math.random() * 2)]
        : ["*", "#"][Math.floor(Math.random() * 2)];

    // Determine the drop's initial position within the container
    const containerRect = weatherContainer.getBoundingClientRect();
    const xPosition = Math.random() * containerRect.width;
    drop.style.left = `${xPosition}px`;
    drop.style.top = `-20px`; // Start slightly above the visible area

    // Apply a random animation delay to stagger drop appearances
    const weatherDelay = dropType === "rain" ? 5 : 12; // seconds
    const delay = Math.random() * weatherDelay + "s";
    drop.style.animationDelay = delay;

    // Append the drop to the weather container
    weatherContainer.appendChild(drop);

    // Remove the drop element after its animation ends to clean up the DOM
    drop.addEventListener("animationend", () => {
      drop.remove();
    });
  }

  /**
   * Animates the weather by creating drops based on current intensity levels.
   * Continuously requests animation frames to sustain the animation loop.
   */
  function animateWeather() {
    if (rainIntensity > 0) {
      createWeather("rain");
      rainIntensity--;
    }
    if (snowIntensity > 0) {
      createWeather("snow");
      snowIntensity--;
    }

    // Continue the animation loop if either intensity is above zero
    if (rainIntensity > 0 || snowIntensity > 0) {
      animationFrameId = requestAnimationFrame(animateWeather);
    } else {
      animationFrameId = null; // Reset when no animations are active
    }
  }

  /**
   * Initiates a rain event by setting the rain intensity.
   * Starts the animation loop if it's not already running.
   */
  export function rain() {
    console.log("Rain triggered");
    rainIntensity = 600; // Increased intensity for longer rain duration
    if (animationFrameId === null) animateWeather(); // Start animation loop if not active
  }

  /**
   * Initiates a snow event by setting the snow intensity.
   * Starts the animation loop if it's not already running.
   */
  export function snow() {
    console.log("Snow triggered");
    snowIntensity = 150; // Increased intensity for longer snow duration
    if (animationFrameId === null) animateWeather(); // Start animation loop if not active
  }

  /**
   * Stops the rain by resetting the rain intensity and clearing existing drops.
   */
  export function stopRain() {
    rainIntensity = 0;
    clearWeather();
  }

  /**
   * Stops the snow by resetting the snow intensity and clearing existing drops.
   */
  export function stopSnow() {
    snowIntensity = 0;
    clearWeather();
  }

  /**
   * Clears all weather drops from the container.
   */
  function clearWeather() {
    if (weatherContainer) weatherContainer.innerHTML = "";
  }

  // === Lifecycle Methods ===

  /**
   * Ensures that any ongoing animations are canceled and the weather container is cleared when the component is destroyed.
   */
  onDestroy(() => {
    if (typeof window !== "undefined" && animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    clearWeather(); // Clean up any remaining drops
  });
</script>

<div
  class="fixed inset-0 pointer-events-none overflow-x-hidden z-40"
  bind:this={weatherContainer}
></div>
