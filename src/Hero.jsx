import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const AnimatedEmailDemo = () => {
  const [email, setEmail] = React.useState("");
  const [score, setScore] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const wrapRef = React.useRef(null);

  // Entrance animation
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    const t = setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 60);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!email) {
      setScore(0);
      return;
    }

    const cleaned = email.trim().toLowerCase();
    let base = 60;
    if (cleaned.includes("@gmail")) base += 12;
    if (cleaned.includes("@yahoo")) base += 6;
    if (cleaned.includes("test") || cleaned.includes("invalid")) base -= 20;
    const randomOffset = Math.floor(Math.random() * 18);
    const computed = Math.max(10, Math.min(99, base + randomOffset));
    const t = setTimeout(() => setScore(computed), 120);
    return () => clearTimeout(t);
  }, [email]);

  const dotColor = score > 80 ? "#2ecc71" : score > 65 ? "#f4a261" : "#999";
  const showBadge = focused || Boolean(email);

  return (
    <div style={{
      marginTop: '40px',
      width: '100%',
      maxWidth: '600px',
      marginInline: 'auto'
    }}>
      <div 
        ref={wrapRef}
        style={{
          position: 'relative',
          width: '100%',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Try hello@company.com"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '18px 24px',
            fontSize: '18px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid #9a7bff',
            borderRadius: '16px',
            color: '#fff',
            outline: 'none',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 0 4px rgba(154, 123, 255, 0.1)'
          }}
        />

        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: `translateY(-50%) scale(${showBadge ? 1 : 0.8})`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          opacity: showBadge ? 1 : 0,
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: dotColor,
            boxShadow: `0 0 12px ${dotColor}`,
            transition: 'all 0.3s ease'
          }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff',
              lineHeight: 1.2
            }}>
              {score ? `${score}%` : "--"}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              lineHeight: 1
            }}>
              Quality
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Hero() {  
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const ioRef = useRef(null);
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    material: null,
    clock: null,
    raf: 0,
    inView: false,
    uniforms: null,
  });

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const dprClamp = () =>
      Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    // Build uniforms
    const uniforms = {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uActualResolution: { value: new THREE.Vector2(1, 1) },
      uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
      uCursorSphere: { value: new THREE.Vector3(0, 0, 0) },
      uCursorRadius: { value: 0.1 },
      uSphereCount: { value: isMobile ? 4 : 8 },
      uFixedTopLeftRadius: { value: 0.85 },
      uFixedBottomRightRadius: { value: 0.95 },
      uSmallTopLeftRadius: { value: 0.32 },
      uSmallBottomRightRadius: { value: 0.36 },
      uMergeDistance: { value: 1.5 },
      uSmoothness: { value: 0.6 },
      uAmbientIntensity: { value: 0.1 },
      uDiffuseIntensity: { value: 1.0 },
      uSpecularIntensity: { value: 2.0 },
      uSpecularPower: { value: 4.0 },
      uFresnelPower: { value: 1.0 },
      uBackgroundColor: { value: new THREE.Color(0x000000) },
      uSphereColor: { value: new THREE.Color(0x050510) },
      uLightColor: { value: new THREE.Color(0x9a7bff) },
      uLightPosition: { value: new THREE.Vector3(0.9, 0.9, 1.2) },
      uContrast: { value: 1.6 },
      uFogDensity: { value: 0.06 },
      uAnimationSpeed: { value: 0.6 },
      uMovementScale: { value: 1.2 },
      uMouseProximityEffect: { value: true },
      uMinMovementScale: { value: 0.3 },
      uMaxMovementScale: { value: 1.0 },
      uCursorGlowIntensity: { value: 1.1 },
      uCursorGlowRadius: { value: 2.0 },
      uCursorGlowColor: { value: new THREE.Color(0xaa77ff) },
      uIsMobile: { value: isMobile ? 1.0 : 0.0 },
    };

    function initThree() {
      if (threeRef.current.renderer) return;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        canvas: canvasRef.current,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const clock = new THREE.Clock();

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform float uTime; 
          uniform vec2 uResolution; 
          uniform vec2 uActualResolution;
          uniform vec2 uMousePosition; 
          uniform vec3 uCursorSphere; 
          uniform float uCursorRadius;
          uniform int uSphereCount; 
          uniform float uFixedTopLeftRadius; 
          uniform float uFixedBottomRightRadius;
          uniform float uSmallTopLeftRadius; 
          uniform float uSmallBottomRightRadius; 
          uniform float uMergeDistance;
          uniform float uSmoothness; 
          uniform float uAmbientIntensity; 
          uniform float uDiffuseIntensity;
          uniform float uSpecularIntensity; 
          uniform float uSpecularPower; 
          uniform float uFresnelPower;
          uniform vec3 uBackgroundColor; 
          uniform vec3 uSphereColor; 
          uniform vec3 uLightColor; 
          uniform vec3 uLightPosition;
          uniform float uContrast; 
          uniform float uFogDensity; 
          uniform float uAnimationSpeed; 
          uniform float uMovementScale;
          uniform bool uMouseProximityEffect; 
          uniform float uMinMovementScale; 
          uniform float uMaxMovementScale;
          uniform float uCursorGlowIntensity; 
          uniform float uCursorGlowRadius; 
          uniform vec3 uCursorGlowColor;
          uniform float uIsMobile;

          const float PI=3.14159265359; 
          const float EPS=.001; 
          const float MAXD=100.0;

          float smin(float a,float b,float k){ 
            float h=max(k-abs(a-b),0.0)/k; 
            return min(a,b)-h*h*k*0.25; 
          }
          
          float sdSphere(vec3 p,float r){ 
            return length(p)-r; 
          }

          vec3 screenToWorld(vec2 n){
            // Convert normalized coords [0,1] to NDC [-1,1]
            vec2 uv = n * 2.0 - 1.0;
            // Apply aspect ratio
            float aspect = uResolution.x / uResolution.y;
            uv.x *= aspect;
            // Scale to world space (matching the ray origin calculation)
            return vec3(uv * 2.0, 0.0);
          }

          float sdf(vec3 p){
            float res=MAXD;

            vec3 tl=screenToWorld(vec2(0.08,0.92));
            vec3 stl=screenToWorld(vec2(0.25,0.72));
            vec3 br=screenToWorld(vec2(0.92,0.08));
            vec3 sbr=screenToWorld(vec2(0.72,0.25));

            float t=uTime*uAnimationSpeed;
            float move=uMovementScale;
            if(uMouseProximityEffect){
              float d=length(uMousePosition-vec2(0.5));
              move = mix(uMinMovementScale, uMaxMovementScale, smoothstep(0.0,0.5,d));
            }

            int steps=int(min(float(uSphereCount), uIsMobile>0.5?4.0:10.0));
            for(int i=0;i<10;i++){
              if(i>=steps) break;
              float fi=float(i);
              float speed=.4+fi*.12;
              float rad=.12+mod(fi,3.0)*.06;
              float orbit=(.3+mod(fi,3.0)*.15)*move;
              float ph=fi*PI*.35;
              vec3 off=vec3(
                sin(t*speed+ph)*orbit*.8,
                cos(t*speed*.85+ph*1.3)*orbit*.6,
                sin(t*speed*.5+ph)*.3
              );
              res = smin(res, sdSphere(p-off, rad), .08);
            }

            float g1=smin(sdSphere(p-tl,uFixedTopLeftRadius), sdSphere(p-stl,uSmallTopLeftRadius), .4);
            float g2=smin(sdSphere(p-br,uFixedBottomRightRadius), sdSphere(p-sbr,uSmallBottomRightRadius), .4);
            res=smin(res,g1,.3);
            res=smin(res,g2,.3);
            res=smin(res, sdSphere(p-uCursorSphere,uCursorRadius), uSmoothness);
            return res;
          }

          vec3 nrm(vec3 p){
            float e=.001;
            return normalize(vec3(
              sdf(p+vec3(e,0,0))-sdf(p-vec3(e,0,0)),
              sdf(p+vec3(0,e,0))-sdf(p-vec3(0,e,0)),
              sdf(p+vec3(0,0,e))-sdf(p-vec3(0,0,e))
            ));
          }

          float march(vec3 ro, vec3 rd){
            float t=0.0; 
            int maxS=int(uIsMobile>0.5?16.0:48.0);
            for(int i=0;i<48;i++){
              if(i>=maxS) break;
              vec3 p=ro+rd*t; 
              float d=sdf(p);
              if(d<EPS) return t;
              if(t>5.0) break;
              t+=d*.9;
            }
            return -1.0;
          }

          vec3 shade(vec3 p, vec3 rd, float tt){
            if(tt<0.0) return vec3(0.0);
            vec3 N=nrm(p), V=-rd, L=normalize(uLightPosition);
            float diff=max(dot(N,L),0.0);
            float spec=pow(max(dot(V,reflect(-L,N)),0.0), uSpecularPower);
            float fres=pow(1.0-max(dot(V,N),0.0), uFresnelPower);
            vec3 col = uSphereColor
                     + uLightColor * (uAmbientIntensity + diff*uDiffuseIntensity + spec*uSpecularIntensity)
                     + uLightColor * fres * .35;
            col = pow(col, vec3(uContrast*.9));
            col = col / (col + vec3(.8));
            return col;
          }

          float glow(vec3 ro){
            float d=length(ro.xy - uCursorSphere.xy);
            float g=1.0 - smoothstep(0.0, uCursorGlowRadius, d);
            return pow(g,2.0) * uCursorGlowIntensity;
          }

          void main(){
            // Calculate UV exactly the same way as screenToWorld and handlePointer
            vec2 uv = (gl_FragCoord.xy * 2.0 - uActualResolution.xy) / uActualResolution.y;
            
            vec3 ro = vec3(uv * 2.0, -1.0);
            vec3 rd = vec3(0.0, 0.0, 1.0);

            float t = march(ro, rd);
            vec3 p = ro + rd * t;
            vec3 col = shade(p, rd, t);

            float g = glow(ro);
            vec3 gcol = uCursorGlowColor * g;

            if(t>0.0){
              float fog = 1.0 - exp(-t*uFogDensity);
              col = mix(col, uBackgroundColor, fog*.3);
              col += gcol*.3;
              gl_FragColor = vec4(col, 1.0);
            } else {
              gl_FragColor = vec4(gcol, g*.8);
            }
          }
        `,
        transparent: true,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      Object.assign(threeRef.current, {
        scene,
        camera,
        renderer,
        material,
        clock,
        uniforms,
      });

      resizeToHero();
      handlePointer({ clientX: heroRef.current.clientWidth / 2, clientY: heroRef.current.clientHeight / 2 });
    }

    function resizeToHero() {
      const { renderer, uniforms } = threeRef.current;
      if (!renderer || !heroRef.current) return;
      const pr = dprClamp();
      const rect = heroRef.current.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      
      uniforms.uResolution.value.set(w, h);
      uniforms.uActualResolution.value.set(w * pr, h * pr);
    }

    function handlePointer(evt) {
      if (!threeRef.current.inView || !heroRef.current) return;
      const { uniforms } = threeRef.current;
      const rect = heroRef.current.getBoundingClientRect();
      const clientX = evt.clientX ?? evt.touches?.[0]?.clientX;
      const clientY = evt.clientY ?? evt.touches?.[0]?.clientY;
      if (clientX == null || clientY == null) return;

      // Get pixel ratio
      const pr = dprClamp();
      
      // Mouse position relative to canvas
      const mx = (clientX - rect.left) * pr;
      const my = (clientY - rect.top) * pr;
      
      // Canvas dimensions with pixel ratio
      const w = rect.width * pr;
      const h = rect.height * pr;
      
      // Normalized coordinates [0, 1]
      const nx = (clientX - rect.left) / rect.width;
      const ny = 1 - ((clientY - rect.top) / rect.height);
      uniforms.uMousePosition.value.set(nx, ny);

      // Convert to shader UV space - exact same calculation as in fragment shader
      const uvx = (mx * 2.0 - w) / h;
      const uvy = (my * 2.0 - h) / h;
      
      // Scale to world space (matching shader's ro calculation)
      uniforms.uCursorSphere.value.set(uvx * 2.0, uvy * 2.0, 0);
    }

    function renderLoop() {
      const { renderer, scene, camera, clock, uniforms } = threeRef.current;
      if (!renderer) return;
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      threeRef.current.raf = requestAnimationFrame(renderLoop);
    }

    function start() {
      if (threeRef.current.inView) return;
      threeRef.current.inView = true;
      if (!threeRef.current.renderer) initThree();
      threeRef.current.clock = threeRef.current.clock || new THREE.Clock();
      threeRef.current.raf = requestAnimationFrame(renderLoop);
      window.addEventListener("mousemove", handlePointer, { passive: true });
      window.addEventListener("touchstart", handlePointer, { passive: true });
      window.addEventListener("touchmove", handlePointer, { passive: true });
      window.addEventListener("resize", resizeToHero, { passive: true });
    }

    function stop() {
      if (!threeRef.current.inView) return;
      threeRef.current.inView = false;
      cancelAnimationFrame(threeRef.current.raf);
      window.removeEventListener("mousemove", handlePointer);
      window.removeEventListener("touchstart", handlePointer);
      window.removeEventListener("touchmove", handlePointer);
      window.removeEventListener("resize", resizeToHero);
    }

    ioRef.current = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { root: null, threshold: 0.05 }
    );
    ioRef.current.observe(heroRef.current);

    return () => {
      stop();
      ioRef.current?.disconnect();
      const { renderer } = threeRef.current;
      renderer?.dispose();
      renderer?.forceContextLoss?.();
    };
  }, []);

  const heroStyle = {
    position: "relative",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: "clamp(24px, 4vw, 56px)",
    background: "#000",
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
    marginInline: "auto",
    color: "#fff",
  };
  const h1Style = {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.04,
    fontSize: "clamp(44px, 8vw, 80px)",
    marginBottom: 12,
  };
  const pStyle = {
    color: "#bbbbbb",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
    fontSize: "clamp(18px, 3vw, 24px)",
    lineHeight: 1.6,
    maxWidth: 780,
    margin: "0 auto",
    padding: '20px'
  };

  return (
    <section className="hero" id="hero" ref={heroRef} style={heroStyle}>
      <div id="hero-canvas-wrap" style={canvasWrapStyle}>
        <canvas id="hero-canvas" ref={canvasRef} />
      </div>

      <div className="hero-content" style={contentStyle}>
        <h1 style={h1Style}>The Ultimate Email Verification</h1>
        <p style={pStyle}>
          Ensure your emails reach the inbox. Our real-time verification cleans
          your lists, reduces bounces, and protects your sender reputation.
        </p>
        <AnimatedEmailDemo />
      </div>
    </section>
  );
}