<script lang="ts">
  // === Props ===
  // The wind power influences the number and behavior of particles
  export let windPower: number = 0;

  // === Types and Interfaces ===

  // Defines the structure of a Particle object
  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    rotation: number;
    char: string;
  }

  // === Component State (Variables) ===

  // Array to hold all active particles
  let particles: Particle[] = [];

  // Identifier for the current animation frame
  let animationFrame: number;

  // === Functions ===

  /**
   * Generates particles based on the current wind power.
   * The number of particles is proportional to windPower.
   */
  function generateParticles() {
    const numParticles = Math.floor(windPower / 4) + 1;
    particles = []; // Reset particles array

    // Define the vertical range where particles can appear
    const minY = 150;
    const maxY = window.innerHeight * 0.5;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        id: Date.now() + i, // Unique identifier for each particle
        x: -100, // Starting X position (off-screen to the left)
        y: Math.random() * (maxY - minY) + minY, // Random Y position within range
        size: Math.random() * 24 + 16, // Random size between 16px and 40px
        speed: (Math.random() * 2 + 2.2) * 2 * windPower, // Speed influenced by windPower
        rotation: Math.random() * 360, // Random initial rotation
        char: getRandomChar(), // Random character from predefined set
      });
    }
  }

  /**
   * Selects a random character from a predefined set of symbols.
   * These characters represent the visual particles.
   * @returns {string} A randomly selected character
   */
  function getRandomChar(): string {
    const chars = ["&", "%", "#", "@", "~", ";", ":", "=", "*", "$", "§", "¶"];
    return chars[Math.floor(Math.random() * chars.length)];
  }

  /**
   * Animates the particles by updating their positions and rotations.
   * Removes particles that have moved beyond the right edge of the viewport.
   */
  function animate() {
    particles = particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.speed * 0.1,
        rotation: particle.rotation + particle.speed * 0.1,
      }))
      .filter((particle) => particle.x < window.innerWidth + 100);

    if (particles.length > 0) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  // === Reactive Statements ===

  /**
   * Reactively responds to changes in windPower.
   * When windPower > 0, generates particles and starts the animation.
   * Resets windPower after 5 seconds to stop particle generation.
   */
  $: if (windPower > 0) {
    generateParticles(); // Create new particles based on windPower
    animate(); // Start the animation loop

    // Reset windPower after 5 seconds to stop generating new particles
    setTimeout(() => {
      windPower = 0;
    }, 5000);
  }
</script>

{#each particles as particle (particle.id)}
  <div
    class="particle transform
             translate-x-[var(--x)]
             translate-y-[var(--y)]
             rotate-[var(--rotation)]
             text-[var(--size)]
             overflow-x-hidden"
    style="
        --x: {particle.x}px;
        --y: {particle.y}px;
        --rotation: {particle.rotation}deg;
        --size: {particle.size}px;
      "
    aria-hidden="true"
  >
    {particle.char}
  </div>
{/each}
