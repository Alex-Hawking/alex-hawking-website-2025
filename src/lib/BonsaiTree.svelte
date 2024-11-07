<script lang="ts">
  // === Imports ===
  import { onMount, onDestroy, tick } from "svelte";
  import { get } from "svelte/store";
  import "../app.css";
  import type { NumericRange } from "@sveltejs/kit";
  import Page from "../routes/+page.svelte";

  // === Types and Interfaces ===

  /**
   * Represents a single leaf on the tree.
   */
  interface Leaf {
    x: number;
    y: number;
    char: string;
    id: string;
  }

  /**
   * Represents a vector with x and y coordinates.
   */
  interface Vector {
    x: number;
    y: number;
  }

  // === Component Props ===

  /**
   * Reference to the container element where the tree is rendered.
   */
  export let container: HTMLDivElement;

  // === Component State (Variables) ===

  // Mount status flag
  let isMounted = false;

  // Canvas dimensions and grid
  let canvas: string[][] = [];
  let canvasHeight: number = 0;
  let canvasWidth: number = 0;

  // Array to hold leaf objects
  let leaves: Leaf[] = [];

  // Interval identifier for leaf falling animations
  let fallInterval: number;

  // Palette configurations

  // Default colour pallete = green leaves
  let palette = "summer";
  const maxFallingLeaves = 25;
  const palettes = ["summer", "autumn", "winter"];
  const colorsPerPalette = 4;
  let selectedPalette: string;

  // Track cloned leaves for cleanup
  let clonedLeaves: HTMLElement[] = [];

  // Rendered tree as an HTML string
  let tree: string = "";

  // Shared wind power variable
  export let treePower = 0;
  $: currentWindPower = treePower;

  // === Functions ===

  /**
   * Initializes the canvas with default dimensions and empty grid.
   */
  function initCanvas() {
    canvasWidth = 81;
    canvasHeight = 20;

    // Create a 2D array representing the canvas grid, filled with spaces
    canvas = Array.from({ length: canvasHeight }, () =>
      Array.from({ length: canvasWidth }, () => " "),
    );

    leaves = [];
  }

  /**
   * Generates the bonsai tree structure on the canvas.
   */
  function generateTree() {
    initCanvas();

    // Randomly select a palette for this tree
    selectedPalette = palettes[Math.floor(Math.random() * palettes.length)];

    const centerX = Math.floor(canvasWidth / 2);
    const baseBottomY = canvasHeight - 1;

    // Draw the base of the tree and get the top Y position of the base
    const baseTopY = drawBase({ x: centerX, y: baseBottomY });
    const rootPos = { x: centerX, y: baseTopY };

    // Randomize tree properties for natural variation
    let height = Math.floor(Math.random() * 2) + 4;
    // Higher chance of skinny tree (could probably have done this better)
    let trunks = [1, 1, 1, 1, 1, 1, 3, 3];
    let trunk = trunks[Math.floor(Math.random() * trunks.length)];
    let layer = Math.floor(Math.random() * 2);
    let angle = Math.floor(Math.random() * 30) - 15;

    palette = palettes[Math.floor(Math.random() * palettes.length)];

    // Recursively draw branches
    drawBranch(rootPos, height, angle, trunk, layer);
    renderCanvas();
  }

  /**
   * Plots a character on the canvas at the specified coordinates with styling.
   * @param x - X-coordinate on the canvas.
   * @param y - Y-coordinate on the canvas.
   * @param char - Character to plot.
   * @param type - Type of element ("branch", "leaf", "base").
   */
  function plot(x: number, y: number, char: string, type: string) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix >= 0 && ix < canvasWidth && iy >= 0 && iy < canvasHeight) {
      const escapedChar = char
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

      let classes = type;
      if (type === "branch" || type === "leaf" || type === "base") {
        if (type === "leaf") {
          classes += " can-hold-leaf leaf transition-leaf duration-leaf";
          const colorClass = `text-${palette}-leaf${
            Math.floor(Math.random() * colorsPerPalette) + 1
          }`;
          classes += ` ${colorClass}`;
        } else if (type === "branch") {
          classes += " text-brown pulse";
        } else if (type === "base") {
          classes += " text-white";
        }
      }

      const randomDelay = Math.random() * 3;
      const span = `<span class="${classes}" style="animation-delay: ${randomDelay}s;">${escapedChar}</span>`;
      canvas[iy][ix] = span;
    }
  }

  /**
   * Draws the base of the tree on the canvas.
   * @param rootPos - Starting position of the base.
   * @returns The top Y-coordinate of the base.
   */
  function drawBase(rootPos: Vector): number {
    const baseHeight = 2;
    const baseWidth = Math.min(Math.floor(canvasWidth / 3), 11);

    const startX = rootPos.x - Math.floor(baseWidth / 2);
    const startY = rootPos.y;

    for (let i = 0; i < baseHeight; i++) {
      const lineWidth = baseWidth - i * 2;
      const lineStartX = startX + i;
      const lineY = startY - i;
      for (let x = 0; x < lineWidth; x++) {
        const char =
          i === 0
            ? "_"
            : x === 0
              ? "\\"
              : x === lineWidth - 1
                ? "/"
                : i === baseHeight - 1
                  ? "_"
                  : " ";
        plot(lineStartX + x, lineY, char, "base");
      }
    }

    return startY - baseHeight;
  }

  /**
   * Recursively draws branches of the tree.
   * @param pos - Current position on the canvas.
   * @param length - Length of the branch.
   * @param angle - Angle of the branch from the vertical.
   * @param width - Width of the branch.
   * @param layer - Current recursion depth.
   */
  function drawBranch(
    pos: Vector,
    length: number,
    angle: number,
    width: number,
    layer: number,
  ) {
    if (layer > 5 || length < 2) {
      drawLeaves(pos);
      return;
    }

    const angleRad = (angle * Math.PI) / 180;
    const endX = pos.x + length * Math.sin(angleRad);
    const endY = pos.y - length * Math.cos(angleRad);

    const endPos = { x: endX, y: endY };
    drawLine(pos, endPos, width, "branch");

    const numBranches = Math.max(2, Math.round(randomNormal(3, 0.5)));
    const newLength = length * 0.75;
    const newWidth = Math.max(1, width - 1);

    let sign = 1;

    for (let i = 0; i < numBranches; i++) {
      const branchAngle = angle + sign * randomNormal(30, 8);
      sign *= -1;
      drawBranch(endPos, newLength, branchAngle, newWidth, layer + 1);
    }
  }

  /**
   * Draws leaves at the specified position.
   * @param pos - Position to draw leaves.
   */
  function drawLeaves(pos: Vector) {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const length = Math.random() * 3;

      const x = pos.x + length * Math.cos(angle);
      const y = pos.y + length * Math.sin(angle);

      plot(x, y, "&%#@"[Math.floor(Math.random() * 4)], "leaf");
    }
  }

  /**
   * Draws a line between two points on the canvas.
   * @param start - Starting vector.
   * @param end - Ending vector.
   * @param width - Width of the line.
   * @param type - Type of the line ("branch" or "base").
   */
  function drawLine(
    start: Vector,
    end: Vector,
    width: number,
    type: "branch" | "base",
  ) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    const xInc = dx / steps;
    const yInc = dy / steps;

    let x = start.x;
    let y = start.y;

    for (let i = 0; i <= steps; i++) {
      for (let w = -Math.floor(width / 2); w <= Math.floor(width / 2); w++) {
        plot(x + w, y, "~;:="[Math.floor(Math.random() * 4)], type);
      }
      x += xInc;
      y += yInc;
    }
  }

  /**
   * Renders the canvas by converting the grid to HTML and applying animations.
   */
  function renderCanvas() {
    tree = canvas
      .map((row, rowIndex) => {
        const content = row.join("");
        const hasTree = content.trim().length > 0;
        const className = hasTree
          ? "tree-row has-tree opacity-0"
          : "tree-row opacity-0";
        return `<div class="${className}" data-row="${rowIndex}">${content}</div>`;
      })
      .join("");

    // Apply staggered fade-in to each tree row
    setTimeout(() => {
      const treeRows = document.querySelectorAll(".tree-row.has-tree");
      treeRows.forEach((row, index) => {
        setTimeout(
          () => {
            row.classList.add("tree-fade-in");
            row.classList.remove("opacity-0");
            setTimeout(() => {
              row.classList.remove("tree-fade-in");
            }, index * 100);
          },
          treeRows.length * 50 - index * 50,
        );
      });
    }, 0);
  }

  /**
   * Updates the canvas dimensions and regenerates the tree.
   */
  function updateDimensions() {
    initCanvas();
    generateTree();
  }

  /**
   * Applies a wind gust effect to the tree by animating its rows.
   * @param power - The intensity of the wind gust.
   */
  export function windGust(power: number) {
    const treeRows = Array.from(
      document.getElementsByClassName("has-tree"),
    ) as HTMLElement[];
    const height = treeRows.length;
    const numRows = Math.floor((2 * height) / 3);
    const firstTwoThirds = treeRows.slice(0, numRows);

    const totalRows = firstTwoThirds.length;
    const baseDuration = 250;
    const maxDuration = 750;
    const delayIncrement = 125;

    // Define minimum and maximum wind distances
    const minDistance = power - 10;
    const maxDistance = power + 10;

    firstTwoThirds.forEach((row, i) => {
      const delay = i * delayIncrement;
      row.style.setProperty("animation-delay", `${delay}ms`);
      const reverseIndex = totalRows - 1 - i;
      const duration =
        baseDuration +
        ((maxDuration - baseDuration) * reverseIndex) / (totalRows - 1);
      row.style.setProperty("--wind-duration", `${duration}ms`);
      const distance =
        minDistance +
        ((maxDistance - minDistance) * reverseIndex) / (totalRows - 1);
      row.style.setProperty("--wind-distance", `${distance}px`);
      row.classList.add("animate-wind-gust");
    });

    const maxDelay = (totalRows - 1) * delayIncrement;
    const totalDuration = maxDuration + maxDelay;

    // Remove wind gust classes after the animation completes
    setTimeout(() => {
      firstTwoThirds.forEach((row) => {
        row.classList.remove("animate-wind-gust");
        row.style.removeProperty("--wind-duration");
        row.style.removeProperty("animation-delay");
        row.style.removeProperty("--wind-distance");
      });
    }, totalDuration);
  }

  /**
   * Renders the tree when the component is mounted.
   */
  onMount(async () => {
    isMounted = true;
    await tick();

    if (container) {
      updateDimensions();
    } else {
      console.warn("Container is not defined after tick.");
    }
  });

  /**
   * Cleans up intervals and cloned leaves when the component is destroyed.
   */
  onDestroy(() => {
    clearInterval(fallInterval);
    clonedLeaves.forEach((leaf) => leaf.remove());
  });

  /**
   * Highlights the top few rows of leaves when snowing.
   */
  function highlightTopForSnow() {
    const treeRows = Array.from(
      document.getElementsByClassName("has-tree"),
    ) as HTMLElement[];

    // Define the number of rows and fraction of leaves to highlight
    const numRowsToHighlight = Math.min(4, treeRows.length); 
    const highlightFraction = 0.8; 

    // Add a fade-in effect to leaves after a delay
    setTimeout(() => {
      for (let i = 0; i < numRowsToHighlight; i++) {
        const row = treeRows[i];
        const leavesInRow = Array.from(row.querySelectorAll(".leaf"));

        // Apply the snow effect to a fraction of leaves
        const numLeavesToHighlight = Math.floor(
          leavesInRow.length * highlightFraction,
        );
        for (let j = 0; j < leavesInRow.length; j++) {
          if (Math.random() < highlightFraction) {
            leavesInRow[j].classList.add("snow-highlight");
          }
        }
      }
    }, 500); 

    // Remove the highlight after the snow effect ends
    setTimeout(() => {
      for (let i = 0; i < numRowsToHighlight; i++) {
        const row = treeRows[i];
        const leavesInRow = row.querySelectorAll(".leaf");
        leavesInRow.forEach((leaf) => {
          leaf.classList.remove("snow-highlight");
        });
      }
    }, 11000); 
  }

  /**
   * Triggers the snow effect by highlighting top leaves.
   */
  export function applySnowEffect() {
    highlightTopForSnow();
  }

  /**
   * Animates a cloned leaf falling with rotation and opacity changes.
   * @param clonedLeaf - The cloned leaf HTMLElement to animate.
   */
  function animateLeaf(clonedLeaf: HTMLElement) {
    let x = 0;
    let y = 0;
    let o = 1; // Start fully opaque
    let spinAngle = 0;
    let falling = true;

    // Initial transition settings for a smooth fade-out
    clonedLeaf.style.position = "absolute";
    clonedLeaf.style.pointerEvents = "none";
    clonedLeaf.style.transition = "opacity 1s ease-out"; 

    /**
     * Updates the leaf's position, rotation, and opacity on each animation frame.
     */
    function update() {
      if (!falling) return;

      const leafRect = clonedLeaf.getBoundingClientRect();
      const isNearLeftEdge = leafRect.left < 50;
      const isNearRightEdge = leafRect.right > window.innerWidth - 5;

      // Adjust position and opacity based on leaf's location
      if (isNearLeftEdge) {
        x += Math.abs(currentWindPower) * 0.05;
        o -= 0.02;
      } else if (isNearRightEdge) {
        x -= Math.abs(currentWindPower) * 0.05;
        o -= 0.04;
      } else {
        x += currentWindPower * 0.05;
        o -= 0.01;
      }

      y += 0.85;
      spinAngle += Math.random() * 5;

      clonedLeaf.style.transform = `translate(${x}px, ${y}px) rotate(${spinAngle}deg)`;
      clonedLeaf.style.opacity = `${o}`;

      // Remove the leaf if it goes out of viewport or becomes fully transparent
      if (y > window.innerHeight || o < -1) {
        falling = false;
        clonedLeaf.remove();
      } else {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Initiates the leaf falling animation by cloning a random leaf.
   */
  export function leafFall() {
    // Select all elements with the class 'leaf'
    const leafElements = Array.from(
      document.getElementsByClassName("leaf"),
    ) as HTMLElement[];

    // Check if there are any leaves to work with
    if (leafElements.length === 0) return;

    // Select a random leaf
    const randomLeafIndex = Math.floor(Math.random() * leafElements.length);
    const originalLeaf = leafElements[randomLeafIndex];

    // Clone the original leaf
    const clonedLeaf = originalLeaf.cloneNode(true) as HTMLElement;

    // Replace the original leaf's content with a blank space
    originalLeaf.textContent = " ";

    // Append the cloned leaf to the body to position it absolutely
    document.body.appendChild(clonedLeaf);
    clonedLeaves.push(clonedLeaf); // Track cloned leaves for cleanup

    // Get the original leaf's position relative to the viewport
    const rect = originalLeaf.getBoundingClientRect();

    // Remove 'leaf' class from the original leaf
    originalLeaf.classList.remove("leaf");

    clonedLeaf.classList.add("clone", "text-sm");

    // Set the cloned leaf's style to match the original's position
    clonedLeaf.style.position = "absolute";
    clonedLeaf.style.top = rect.top + window.scrollY + "px";
    clonedLeaf.style.left = rect.left + window.scrollX + "px";
    clonedLeaf.style.margin = "0";
    clonedLeaf.style.pointerEvents = "none";

    // Start animating the leaf
    animateLeaf(clonedLeaf);
  }

  /**
   * Regenerates the tree structure, ensuring no wind is currently affecting it.
   */
  export function regenerateTree() {
    if (currentWindPower > 0) {
      return; // Prevent regeneration during active wind events
    }

    const clones = Array.from(
      document.getElementsByClassName("clone"),
    ) as HTMLElement[];

    setTimeout(() => {
      clones.forEach((leaf) => leaf.remove());
    }, 250);

    initCanvas();
    generateTree();
  }

  /**
   * Generates particles on the canvas and starts the animation.
   */
  export function growLeaves() {
    // Select all spots marked as `can-hold-leaf`
    const leafHolders = Array.from(
      document.querySelectorAll(".can-hold-leaf"),
    ) as HTMLElement[];

    // Shuffle leafHolders array to randomize the order
    for (let i = leafHolders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [leafHolders[i], leafHolders[j]] = [leafHolders[j], leafHolders[i]];
    }

    // Choose a random number between 4 and 9 for the number of leaves to grow
    const spotsToGrow = Math.floor(Math.random() * 6) + 4;
    const selectedSpots = leafHolders.slice(0, spotsToGrow);

    selectedSpots.forEach((spot) => {
      const existingLeaf = spot.innerHTML.trim() !== ""; // Check if there's existing content
      const colorClass = `text-summer-leaf${
        Math.floor(Math.random() * colorsPerPalette) + 1
      }`;

      if (existingLeaf) {
        // Update only the color if there's an existing leaf, without adding animation
        const oldColorClass = Array.from(spot.classList).find((cls) =>
          cls.startsWith("text-"),
        );
        if (oldColorClass) {
          spot.classList.remove(oldColorClass); // Remove the old color class
        }
        spot.classList.add(colorClass); // Add the new color class
      } else {
        // If no existing leaf, add a new leaf character with fade-in effect
        const leafChars = ["&", "%", "#", "@"];
        const leafChar =
          leafChars[Math.floor(Math.random() * leafChars.length)];
        spot.innerHTML = `<span class="${colorClass} opacity-0 animate-fade-in">${leafChar}</span>`;

        // Ensure the new leaf fades in smoothly
        setTimeout(() => {
          spot.querySelector("span")?.classList.add("opacity-100");
        }, 0);
      }
    });
  }

  // === Helper Functions ===

  /**
   * Generates a normally distributed random number using the Box-Muller transform.
   * @param mean - Mean of the distribution.
   * @param stdDev - Standard deviation of the distribution.
   * @returns A normally distributed random number.
   */
  function randomNormal(mean: number, stdDev: number): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return (
      mean +
      stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    );
  }

  // === Lifecycle Methods ===

  /**
   * Sets up the component when it is mounted.
   */
  onMount(async () => {
    isMounted = true;
    await tick();

    if (container) {
      updateDimensions();
    } else {
      console.warn("Container is not defined after tick.");
    }
  });

  /**
   * Cleans up intervals and cloned leaves when the component is destroyed.
   */
  onDestroy(() => {
    clearInterval(fallInterval);
    clonedLeaves.forEach((leaf) => leaf.remove());
  });
</script>

<!-- === Markup === -->
{#if isMounted}
  <div
    class="tree-container relative flex flex-col justify-center items-center font-mono whitespace-pre bg-bg leading-none w-screen h-35vh overflow-hidden"
    style="clip-path: inset(0 0 0 0);"
    bind:this={container}
  >
    {@html tree}
  </div>
{/if}
