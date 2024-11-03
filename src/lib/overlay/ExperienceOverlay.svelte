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

<Overlay bind:isOpen on:close={handleOverlayClose} heading="Work Experience">
  <OverlayContent
    title="Information Technology Administrator"
    time="Mar 2024 - Present"
    description="Co-Exist Australia"
    link="https://coexistaus.org/"
  />
  <OverlayContent
    title="Committee Member"
    time="Feb 2024 - Present"
    description="Coders for Causes"
    link="https://codersforcauses.org/"
  />
  <OverlayContent
    title="Cyber Defence Analyst"
    time="Dec 2023 - Present"
    description="Interactive Australia"
    link="https://www.slipstreamcyber.com/"
  />
  <OverlayContent
    title="Front End Developer"
    time="Nov 2023 - Feb 2024"
    description="UseVerb"
    link="https://useverb.com/"
  />
  <OverlayContent
    title="Developer and Graphic Designer"
    time="May 2023 - Dec 2023"
    description="Freelance"
    link="#"
  />
  <OverlayContent
    title="App and Game Developer, Graphic Designer"
    time="June 2019 - Jan 2022"
    description="Handmade Studios (Self-Employed)"
    link="https://alexhawking.itch.io/"
  />
</Overlay>
