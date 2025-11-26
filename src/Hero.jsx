// Hero.jsx
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { Link } from "react-router-dom";
import AnimatedEmailVerification from "./AnimatedEmailVerification";
// =================== Constants ===================
const BG_PARTICLES_COUNT = 10000; // number of stars
const BG_PARTICLE_SIZE = 3; // star size
const MORPH_DURATION = 1000; // ms

const canvasWidth = 240;
const canvasHeight = 240;
const graphicOffsetX = canvasWidth / 2;
const graphicOffsetY = canvasHeight / 2;

// Scale factor for the star-image size (bigger value = bigger image)
const IMAGE_SCALE = 3;

// Fraction of stars that morph into the image (rest stay scattered)
const MORPHING_STAR_FRACTION = 0.7;

// =================== Global Three.js State ===================
let scene;
let renderer;
let camera;

let cameraLookAt = new THREE.Vector3(0, 0, 0);
let cameraTarget = new THREE.Vector3(0, 0, 800);

let windowWidth;
let windowHeight;
let windowHalfWidth;
let windowHalfHeight;

let mouseX = 0;
let mouseY = 0;

// pixels of the logo/image
let graphicPixels = [];

// Background starfield
let bgParticles;
let bgOriginalPositions;
let bgTargetPositions;
let bgMorphMask; // 1 = this star morphs into image, 0 = stays background

// Morphing control
let isMorphingToImage = false; // true = go to image shape, false = go back to scattered
let morphProgress = 0; // 0 = original scattered, 1 = image shape
let lastMorphTime = 0;

// Canvas/image handling
let currentGraphic = 0;
let graphicCanvas;
let gctx;
let graphics;

// =================== Helper: star texture (round, glowing) ===================
const createStarTexture = () => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const center = size / 2;
  const radius = size / 2;

  // transparent background
  ctx.clearRect(0, 0, size, size);

  // radial gradient for glow
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    radius
  );
  // bright core
  gradient.addColorStop(0, "rgba(0, 180, 255, 1)"); // bright blue
  gradient.addColorStop(0.4, "rgba(0, 180, 255, 0.8)");
  gradient.addColorStop(0.8, "rgba(0, 180, 255, 0.0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// =================== Hero Component ===================
const Hero = () => {
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Container where the Three.js canvas will be injected
  const backgroundRef = useRef(null);
  const flickityRef = useRef(null);
  const animationFrameRef = useRef(0);

  // Hover behavior: morph background stars in/out of image
  const handleMouseEnter = () => {
    setIsHovered(true);
    isMorphingToImage = true;
    lastMorphTime = performance.now();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isMorphingToImage = false;
    lastMorphTime = performance.now();
  };

  // Initial setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsClient(true);
    initStage();
    initScene();
    initCanvas();
    initCamera();
    updateGraphic();
    animate();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide the source <img> elements so you don't see a square logo box
  useEffect(() => {
    if (!isClient) return;
    const imgs = document.querySelectorAll(".intro-cell > img");
    imgs.forEach((img) => {
      img.style.display = "none";
      img.style.visibility = "hidden";
    });
  }, [isClient]);

  // Flickity only on client (if used elsewhere)
  useEffect(() => {
    if (isClient) {
      initSlider();
    }
  }, [isClient]);

  // =================== Init Functions ===================

  const initStage = () => {
    setWindowSize();
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("mousemove", onMouseMove, false);
  };

  const createBackgroundParticles = () => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colorArray = [];
    const color = new THREE.Color();

    const maxX = windowWidth;
    const maxY = windowHeight;

    for (let i = 0; i < BG_PARTICLES_COUNT; i++) {
      const x = (Math.random() * 2 - 1) * maxX;
      const y = (Math.random() * 2 - 1) * maxY;
      const z = (Math.random() - 0.5) * 1500;

      positions.push(x, y, z);

      // Bright shining blue for all stars
      color.set(0x00b4ff);
      colorArray.push(color.r, color.g, color.b);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colorArray, 3)
    );

    const positionsAttr = geometry.getAttribute("position");

    // Save original scattered positions
    bgOriginalPositions = positionsAttr.array.slice();
    // Prepare array for target (image) positions
    bgTargetPositions = new Float32Array(bgOriginalPositions.length);

    // Decide which stars will morph into the image
    const totalStars = positionsAttr.count; // number of vertices
    bgMorphMask = new Uint8Array(totalStars);
    for (let starIndex = 0; starIndex < totalStars; starIndex++) {
      bgMorphMask[starIndex] = Math.random() < MORPHING_STAR_FRACTION ? 1 : 0;
    }

    // Use round, glowing star texture instead of square points
    const starTexture = createStarTexture();

    const material = new THREE.PointsMaterial({
      size: BG_PARTICLE_SIZE * 2, // bigger & brighter stars
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending, // makes glow stack & intensify visually
    });

    bgParticles = new THREE.Points(geometry, material);
    scene.add(bgParticles);
  };

  // Spread stars across the full image (only for morphing stars)
  const updateBgTargetPositionsFromGraphic = () => {
    if (!bgParticles || graphicPixels.length === 0 || !bgOriginalPositions)
      return;

    const positionsAttr = bgParticles.geometry.getAttribute("position");
    const positions = positionsAttr.array;

    if (!bgTargetPositions || bgTargetPositions.length !== positions.length) {
      bgTargetPositions = new Float32Array(positions.length);
    }

    const totalStars = positions.length / 3;
    const totalPixels = graphicPixels.length;

    if (totalPixels === 0) return;

    // This makes stars cover the whole image nicely
    const step = totalPixels / totalStars;

    for (let starIndex = 0; starIndex < totalStars; starIndex++) {
      const i = starIndex * 3;

      if (bgMorphMask && bgMorphMask[starIndex]) {
        // This star will form part of the image
        const pixelIndex = Math.floor(starIndex * step) % totalPixels;
        const pixel = graphicPixels[pixelIndex];
        const vec = getGraphicPos(pixel);

        bgTargetPositions[i] = vec.x;
        bgTargetPositions[i + 1] = vec.y;
        bgTargetPositions[i + 2] = vec.z;
      } else {
        // This star stays in the background – its "target" is its original pos
        bgTargetPositions[i] = bgOriginalPositions[i];
        bgTargetPositions[i + 1] = bgOriginalPositions[i + 1];
        bgTargetPositions[i + 2] = bgOriginalPositions[i + 2];
      }
    }
  };

  const updateBackgroundParticles = () => {
    if (!bgParticles || !bgOriginalPositions || !bgTargetPositions) return;

    const positionsAttr = bgParticles.geometry.getAttribute("position");
    const positions = positionsAttr.array;

    const now = performance.now();

    if (!lastMorphTime) lastMorphTime = now;
    const delta = now - lastMorphTime;
    lastMorphTime = now;

    const step = delta / MORPH_DURATION;

    if (isMorphingToImage) {
      morphProgress = Math.min(1, morphProgress + step);
    } else {
      morphProgress = Math.max(0, morphProgress - step);
    }

    const t = morphProgress;

    for (let i = 0; i < positions.length; i += 3) {
      const ox = bgOriginalPositions[i];
      const oy = bgOriginalPositions[i + 1];
      const oz = bgOriginalPositions[i + 2];

      const tx = bgTargetPositions[i];
      const ty = bgTargetPositions[i + 1];
      const tz = bgTargetPositions[i + 2];

      // Interpolate between scattered and image positions
      positions[i] = ox + (tx - ox) * t;
      positions[i + 1] = oy + (ty - oy) * t;
      positions[i + 2] = oz + (tz - oz) * t;
    }

    positionsAttr.needsUpdate = true;
  };

  const initScene = () => {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);

    // Hide the canvas
    renderer.domElement.style.display = "none";

    if (backgroundRef.current) {
      backgroundRef.current.appendChild(renderer.domElement);
    }

    scene.background = new THREE.Color(0x000000);
    createBackgroundParticles();
    initLights();
  };

  const initLights = () => {
    const shadowLight = new THREE.DirectionalLight(0xffffff, 2);
    shadowLight.position.set(20, 0, 10);
    scene.add(shadowLight);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(-20, 0, 20);
    scene.add(light);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(0, 0, -20);
    scene.add(backLight);
  };

  const initCamera = () => {
    const fieldOfView = 75;
    const aspectRatio = windowWidth / windowHeight;
    const nearPlane = 1;
    const farPlane = 5000;
    camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    camera.position.z = 800;
  };

  const initCanvas = () => {
    graphicCanvas = document.createElement("canvas");
    graphicCanvas.width = canvasWidth;
    graphicCanvas.height = canvasHeight;
    gctx = graphicCanvas.getContext("2d");
    graphics = document.querySelectorAll(".intro-cell > img");

    // Make sure this helper canvas is never visible or clickable
    graphicCanvas.style.position = "absolute";
    graphicCanvas.style.left = "-9999px";
    graphicCanvas.style.top = "-9999px";
    graphicCanvas.style.pointerEvents = "none";
    graphicCanvas.style.display = "none";
  };

  const initSlider = async () => {
    if (typeof window === "undefined") return;

    try {
      const Flickity = (await import("flickity")).default;
      await import("flickity/css/flickity.css");

      const elem = document.querySelector(".intro-carousel");
      if (elem) {
        const flkty = new Flickity(elem, {
          cellAlign: "center",
          pageDots: false,
          wrapAround: true,
          resize: true,
        });

        flkty.on("select", () => {
          currentGraphic = flkty.selectedIndex;
          updateGraphic();
        });

        flickityRef.current = flkty;
      }
    } catch (error) {
      console.error("Error initializing Flickity:", error);
    }
  };

  // =================== Image -> Pixels -> Background Stars ===================

  const updateGraphic = () => {
    const img = graphics && graphics[currentGraphic];
    if (!img || !gctx) return;

    gctx.clearRect(0, 0, canvasWidth, canvasHeight);
    gctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    const gData = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    graphicPixels = [];

    for (let i = 0; i < gData.length; i += 4) {
      const alpha = gData[i + 3];
      if (alpha > 0) {
        const index = i / 4;
        const x = index % canvasWidth;
        const y = Math.floor(index / canvasWidth);

        // downsample – tweak/remove for more / fewer stars in the shape
        if (x % 2 === 0 && y % 2 === 0) {
          graphicPixels.push({ x, y });
        }
      }
    }

    // Update where stars should go when forming the image
    updateBgTargetPositionsFromGraphic();
  };

  // Map 2D pixel to 3D position (uses IMAGE_SCALE)
  const getGraphicPos = (pixel) => {
    const posX =
      (pixel.x - graphicOffsetX - Math.random() * 4 - 2) * IMAGE_SCALE;
    const posY =
      (graphicOffsetY - pixel.y - Math.random() * 4 - 2) * IMAGE_SCALE;
    const posZ = -20 * Math.random() + 40;

    return new THREE.Vector3(posX, posY, posZ);
  };

  // =================== Events & Loop ===================

  const onMouseMove = (event) => {
    mouseX = event.clientX - windowHalfWidth;
    mouseY = event.clientY - windowHalfHeight;

    // parallax camera move
    cameraTarget.x = (mouseX * -1) / 2;
    cameraTarget.y = mouseY / 2;
  };

  const onWindowResize = () => {
    setWindowSize();
    if (!camera || !renderer) return;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(windowWidth, windowHeight);
  };

  const setWindowSize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    windowHalfWidth = windowWidth / 2;
    windowHalfHeight = windowHeight / 2;
  };

  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    updateBackgroundParticles();

    // Smooth 3D camera parallax
    if (camera) {
      camera.position.lerp(cameraTarget, 0.12);
      camera.lookAt(cameraLookAt);
    }

    // Extra 3D tilt of scene based on mouse
    if (scene && windowWidth && windowHeight) {
      const targetRotY = (mouseX / windowWidth) * 0.4; // left/right tilt
      const targetRotX = (-mouseY / windowHeight) * 0.3; // up/down tilt

      scene.rotation.y = THREE.MathUtils.lerp(
        scene.rotation.y,
        targetRotY,
        0.08
      );
      scene.rotation.x = THREE.MathUtils.lerp(
        scene.rotation.x,
        targetRotX,
        0.08
      );
    }

    renderScene();
  };

  const renderScene = () => {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (flickityRef.current) {
      flickityRef.current.destroy();
    }

    window.removeEventListener("resize", onWindowResize, false);
    window.removeEventListener("mousemove", onMouseMove, false);

    if (bgParticles && scene) {
      scene.remove(bgParticles);
      bgParticles.geometry.dispose();
      if (Array.isArray(bgParticles.material)) {
        bgParticles.material.forEach((m) => m.dispose());
      } else {
        bgParticles.material.dispose();
      }
    }

    if (renderer) {
      renderer.dispose();
    }
  };

  // =================== Simple inline styles for hero ===================
  const heroStyle = {
    position: "relative",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: "clamp(24px, 4vw, 56px)",
    background: "#000",
    cursor: isHovered ? "pointer" : "default",
    transition: "all 0.3s ease-in-out",
  };

  const canvasWrapStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  };

  const contentStyle = {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: 900,
    marginBottom: "8vw",
    marginInline: "auto",
    color: "#fff",
  };

  const h1Style = {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    fontSize: "8vw",
    marginBottom: "1vw",
  };

  const pStyle = {
    color: "#bbbbbb",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
    fontSize: "clamp(18px, 3vw, 24px)",
    lineHeight: 1.6,
    maxWidth: 780,
    margin: "0 auto",
  };

  return (
    <section
      className="hero"
      id="hero"
      style={heroStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three.js background */}
      <div ref={backgroundRef} className="intro-cell" style={canvasWrapStyle}>
        <img
          src="data:image/png;base64,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"
          className="intro-graphic"
          alt="Founders"
          style={{
            display: "none", // keep it in DOM but invisible
            visibility: "hidden",
          }}
        />
      </div>

      {/* Foreground content */}
      <div className="hero-content" style={contentStyle}>
        <h1 style={h1Style}>
          Make Every Email <br />
          Reach Its Inbox
        </h1>
        <p style={pStyle}>
          Ensure your emails reach the inbox. Our real-time verification cleans
          <br />
          your lists, reduces bounces, and protects your sender reputation.
        </p>
        <AnimatedEmailVerification />
        <div style={{ marginTop: "32px" }}>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <button
              className="herobutton"
              style={{
                padding: "1.2vw 2.4vw",
                fontSize: "1.1vw",
                fontWeight: 700,
                fontFamily:
                  "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
                background: "black",
                color: "#fff",
                border: "none",
                borderRadius: "1.2vw",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 0.45vw 1.5vw rgba(220, 220, 220, 1)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-0.15vw)";
                e.currentTarget.style.boxShadow =
                  "0 0.6vw 1.8vw rgba(220, 220, 220, 1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 0.45vw 1.5vw rgba(220, 220, 220, 1)";
              }}
            >
              Get Started Free
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;