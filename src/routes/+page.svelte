<script lang="ts">
  // === Imports ===
  import { onMount, onDestroy } from "svelte";
  import BonsaiTree from "$lib/BonsaiTree.svelte";
  import WindParticles from "$lib/weather/WindParticles.svelte";
  import Weather from "$lib/weather/Weather.svelte";

  import {
    RefreshCwIcon,
    GithubIcon,
    LinkedinIcon,
    InstagramIcon,
  } from "svelte-feather-icons";

  import ProjectOverlay from "$lib/overlay/ProjectOverlay.svelte";
  import ExperienceOverlay from "$lib/overlay/ExperienceOverlay.svelte";

  // === Component State (Variables) ===

  // Overlay visibility states
  let showProjectOverlay = false;
  let showExperienceOverlay = false;

  // References to tree and weather child components
  let treeRef: any;
  let weatherRef: any;

  // Animation state for entire site (for fade in animation)
  let animationClass = "animate-site-fade-in";

  // Tree and wind power levels
  let windPower = 0;
  let treePower = 0;

  // Timeout identifiers for managing events
  let masterTimeoutId: number | null = null;
  let leafTimeoutId: number | null = null;

  // Page visibility and event state
  let isPageVisible = true;
  let isEventActive = false;

  // Tracking the last event type and time
  let lastEvent: "wind" | "rain" | "snow" | null = null;
  let lastEventTime = 0;

  // Reference to the refresh icon element
  let iconRef: HTMLElement;

  // Reactive variable to track screen size
  let isMobile = false;

  // === Functions ===

  // Function to check if the screen is mobile
  function checkScreenSize() {
    isMobile = window.innerWidth < 768;
  }

  // Open and close functions for Project Overlay
  function openProjectOverlay() {
    showProjectOverlay = true;
  }

  function closeProjectOverlay() {
    showProjectOverlay = false;
  }

  // Open and close functions for Experience Overlay
  function openExperienceOverlay() {
    showExperienceOverlay = true;
  }

  function closeExperienceOverlay() {
    showExperienceOverlay = false;
  }

  // Regenerate the bonsai tree
  function newTree() {
    treeRef.regenerateTree();
  }

  // Start the spin animation on the refresh icon
  function startSpin() {
    iconRef.classList.add("spin");
  }

  // Stop the spin animation on the refresh icon
  function stopSpin() {
    iconRef.classList.remove("spin");
  }

  // === Weather Event Handlers ===

  // Trigger a wind event
  function triggerWind() {
    if (isEventActive) return;
    windPower = Math.floor(Math.random() * 20) + 10;
    treePower = windPower * 3;
    isEventActive = true;

    setTimeout(() => {
      treeRef.windGust(windPower);
      treeRef.leafFall();
      treeRef.leafFall();

      // Gradually decrease tree power
      const windDecreaseInterval = setInterval(() => {
        treePower -= 5;
        if (treePower <= 0) {
          treePower = 0;
          clearInterval(windDecreaseInterval);
          isEventActive = false;
          scheduleNextEvent();
        }
      }, 100);
    }, windPower * 7.5);
    lastEvent = "wind";
    lastEventTime = Date.now();
  }

  // Trigger a rain event
  function triggerRain() {
    if (isEventActive) return;
    isEventActive = true;
    weatherRef.rain(true);
    setTimeout(() => {
      treeRef.growLeaves();
    }, 2000);

    setTimeout(() => {
      weatherRef.stopRain();
      isEventActive = false;
      scheduleNextEvent();
    }, 15000);
    lastEvent = "rain";
    lastEventTime = Date.now();
  }

  // Trigger a snow event
  function triggerSnow() {
    if (isEventActive) return;
    isEventActive = true;
    weatherRef.snow(true);

    setTimeout(() => {
      treeRef.applySnowEffect();
    }, 2500);

    setTimeout(() => {
      weatherRef.stopSnow();
      isEventActive = false;
      scheduleNextEvent();
    }, 20000);
    lastEvent = "snow";
    lastEventTime = Date.now();
  }

  // Schedule the next weather event based on timing and randomness
  function scheduleNextEvent() {
    if (!isPageVisible || isEventActive) return;
    const minIntervalBetweenEvents = 5000;
    const timeSinceLastEvent = Date.now() - lastEventTime;
    const baseInterval = Math.random() * (12000 - 5000) + 5000;

    const interval =
      timeSinceLastEvent < minIntervalBetweenEvents
        ? minIntervalBetweenEvents
        : baseInterval;

    masterTimeoutId = window.setTimeout(() => {
      masterTimeoutId = null;

      let event: "wind" | "rain" | "snow";
      // Probability distribution: 50% wind, 30% rain, 20% snow
      const random = Math.random();
      if (random < 0.5) {
        event = "wind";
      } else if (random < 0.8) {
        event = "rain";
      } else {
        event = "snow";
      }

      if (event === "wind") triggerWind();
      else if (event === "rain") triggerRain();
      else triggerSnow();
    }, interval);
  }

  // Start scheduling leaf falls
  function startLeafFall() {
    if (leafTimeoutId) return;
    leafFallScheduler();
  }

  // Recursive scheduler for leaf falls at random intervals
  function leafFallScheduler() {
    const interval = Math.random() * 5000 + 3000;
    leafTimeoutId = setTimeout(() => {
      if (isPageVisible) treeRef.leafFall();
      leafFallScheduler();
    }, interval);
  }

  // Handle page visibility changes to pause/resume events
  function handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      isPageVisible = true;
      scheduleNextEvent();
      startLeafFall();
    } else {
      isPageVisible = false;
      if (masterTimeoutId) clearTimeout(masterTimeoutId);
      if (leafTimeoutId) clearTimeout(leafTimeoutId);
      // Stop ongoing weather animations
      weatherRef.stopRain();
      weatherRef.stopSnow();
    }
  }

  // === Lifecycle Methods ===
  onMount(() => {
    // Remove the initial fade-in animation after 1.5 seconds
    setTimeout(() => {
      animationClass = "";

      console.clear();
      console.log(
        "%cHello Nerd!\n%cWelcome to my website.\nThe source code is on GitHub:%c https://github.com/Alex-Hawking/. %c\nThe bonsai tree is also inspired by cbonsai (to give credit): %c https://gitlab.com/jallbrit/cbonsai%c. \nThis website was built with Svelte and Tailwind.",
        "color: #FFD23F; font-size: 16px; font-weight: bold;", // "Hello Nerd!"
        "color: #FFFFFF; font-size: 14px;", // " Welcome to my website. The source code is on "
        "color: #009FFD; font-size: 14px;", // " https://github.com/Alex-Hawking/. "
        "color: #FFFFFF; font-size: 14px; font-style: italic;",
        "color: #009FFD; font-size: 14px;", // "The bonsai tree is also inspired by cbonsai (to give credit)."
        "color: #51CB20; font-size: 14px;", // " This website was built with Svelte and Tailwind."
      );
    }, 1500);

    // Initialize event scheduling and leaf fall
    scheduleNextEvent();
    startLeafFall();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Check screen size
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Cleanup on component destroy
    onDestroy(() => {
      if (masterTimeoutId) clearTimeout(masterTimeoutId);
      if (leafTimeoutId) clearTimeout(leafTimeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", checkScreenSize);
    });
  });
</script>

<svelte:head>
  <title>Alex Hawking</title>
  <meta
    name="description"
    content="Alex Hawking is an extremely good description writer and fairly average at everything else."
  />
</svelte:head>

<div
  class={`relative flex flex-col items-center justify-center min-h-screen bg-bg overflow-x-hidden font-light text-sm ${animationClass}`}
>
  <!-- Weather and Tree Components -->
  <Weather bind:this={weatherRef} {windPower} />
  <BonsaiTree bind:this={treeRef} {treePower} />
  <WindParticles {windPower} />

  <!-- Regen Tree Button -->
  <div class="opacity-1">
    <button
      on:click={newTree}
      class="mt-10 mb-4 text-bg transform transition-all duration-1000 bg-white p-2 hover:animate-spin rounded-full hover:bg-bg hover:text-white hover:scale-110"
      on:mouseenter={startSpin}
      on:mouseleave={stopSpin}
    >
      <RefreshCwIcon class="" size="0.75x" bind:this={iconRef} />
    </button>
  </div>

  <!-- Headings -->
  <h3
    class="text-center text-white font-light font-mono text-sm my-4 md:text-lg"
  >
    Hello World!
  </h3>
  <h3
    class="text-center text-white font-light font-mono my-4 text-xs md:text-md"
  >
    <span class="text-yellow">$ whoami</span> Alex Hawking
  </h3>

  <!-- Sub Headings -->
  <h5 class="font-mono text-white font-light mt-6 text-xs">
    <span class="hidden md:inline">
      <span class="text-blue">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cybersecurity
      </span>
      <span class="px-5">&</span>
      <span class="text-orange">Fullstack Development</span>
      <span class="px-5">&</span>
      <span class="text-green">
        Going Outside&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </span>
    </span>
    <span class="md:hidden">
      <span class="text-blue"
        >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cyber</span
      >
      <span class="px-4">&</span>
      <span class="text-orange">Development</span>
      <span class="px-4">&</span>
      <span class="text-green">Exploring&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </span>
  </h5>

  <!-- Buttons for Overlays -->
  <div
    class="text-white font-mono text-xs md:text-sm flex items-center justify-center mt-6"
  >
    <button
      on:click={openProjectOverlay}
      class="
    text-white px-4 py-2 rounded
    transform transition-transform duration-300 ease-in-out
    hover:scale-105
  "
    >
      &nbsp;&nbsp;Projects
    </button>
    <span class="px-4">||</span>
    <button
      on:click={openExperienceOverlay}
      class="
    text-white px-4 py-2 rounded
    transform transition-transform duration-300 ease-in-out
    hover:scale-105
  "
    >
      Experience
    </button>
  </div>

  <!-- Social Icons -->
  <div class="text-white mt-6 inline-flex space-x-6">
    <a
      href="https://github.com/Alex-Hawking/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      class="
        transform transition-transform duration-300 ease-in-out
        hover:scale-110
      "
    >
      <GithubIcon size={isMobile ? "16" : "20"} />
    </a>

    <a
      href="https://www.instagram.com/ah33803/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      class="
        transform transition-transform duration-300 ease-in-out
        hover:scale-110
      "
    >
      <InstagramIcon size={isMobile ? "16" : "20"} />
    </a>

    <a
      href="https://www.linkedin.com/in/alex-hawking/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      class="
        transform transition-transform duration-300 ease-in-out
        hover:scale-110
      "
    >
      <LinkedinIcon size={isMobile ? "16" : "20"} />
    </a>
  </div>

  <!-- Overlays -->
  <ProjectOverlay
    bind:isOpen={showProjectOverlay}
    on:close={closeProjectOverlay}
    heading="Projects"
    type="project"
  />

  <ExperienceOverlay
    bind:isOpen={showExperienceOverlay}
    on:close={closeExperienceOverlay}
    heading="Experience"
    type="experience"
  />
</div>
