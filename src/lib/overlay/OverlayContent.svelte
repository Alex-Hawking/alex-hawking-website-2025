<script>
  // === Component Props ===

  /**
   * The title of the project or experience.
   * @type {string}
   */
  export let title = "Title";

  /**
   * The time or duration associated with the project or experience.
   * @type {string}
   */
  export let time = "Time";

  /**
   * A brief description of the project or experience.
   * @type {string}
   */
  export let description = "Description";

  /**
   * The URL link to learn more about the project or experience.
   * @type {string}
   */
  export let link = "#";
</script>

<div class="md:p-6 p-2 pb-6 text-white font-mono">
  <!-- Title -->
  <h2 class="text-sm mb-2 font-normal">{title}</h2>

  <!-- Date with conditional color -->
  <p class="text-xs mb-4 text-green">
    {time}
  </p>

  <!-- Description -->
  <p class="text-xs mb-4">{description}</p>

  <!-- Link -->
  <a href={link} class="text-xs text-blue hover:underline" target="_blank"
    >Learn more</a
  >
</div>
