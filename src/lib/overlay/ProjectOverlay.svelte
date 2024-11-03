<script>
  import Overlay from "$lib/overlay/Overlay.svelte";
  import OverlayContent from "$lib/overlay/OverlayContent.svelte";

  export let isOpen = false;
  /**
   * @type {() => void}
   */
  export let onClose;

  function handleOverlayClose() {
    if (onClose) {
      onClose();
    }
  }
</script>

<Overlay bind:isOpen heading="Projects" on:close={handleOverlayClose}>
  <OverlayContent
    title="GreenHouse Testing"
    time="2024"
    description="A framework for browser-based front-end QA testing built with NodeJS and TypeScript. It compiles Gherkin code into Playwright/Jest test files (test.js), which can be run using Playwright/Jest."
    link="https://github.com/Alex-Hawking/GreenHouse-Testing"
  />
  <OverlayContent
    title="Proximal Policy Optimization and Super Mario Bros."
    time="2023"
    description="An implementation of the Proximal Policy Optimization (PPO) algorithm in the classic game Super Mario Bros."
    link="https://github.com/Alex-Hawking/ppo-super-mario-bros"
  />
  <OverlayContent
    title="COVID-19 Preventative Measures Simulation and Analysis"
    time="2021"
    description="A Python-based analysis exploring the effectiveness of various preventative measures introduced by the Australian government to reduce COVID-19's spread."
    link="https://alex-hawking-covid19-simulation-report.vercel.app/"
  />
  <OverlayContent
    title="NXT Editor"
    time="2020"
    description="An Electron-based app for enhanced editing of .txt files with unique features."
    link="https://github.com/Alex-Hawking/nxt-editor"
  />
  <OverlayContent
    title="Cybermore"
    time="2020"
    description="A frustrating platformer game built using the Godot game engine."
    link="https://alexhawking.itch.io/cybermore"
  />
</Overlay>
