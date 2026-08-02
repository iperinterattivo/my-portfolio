export const footerVertexShader = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec2 vFluidUv;
  varying vec3 vViewPosition;

  // --- Utility per Pseudo-Random & Noise 2D ---
  vec2 hash2D(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2D(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                   dot(hash2D(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
               mix(dot(hash2D(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                   dot(hash2D(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
  }

  // Domain Warping per simulare la turbolenza del fluido
  float fluidNoise(vec2 p, float time) {
    vec2 q = vec2(noise(p + vec2(0.0, time * 0.2)), noise(p + vec2(5.2, time * 0.13)));
    vec2 r = vec2(noise(p + 4.0 * q + vec2(1.7 - time * 0.15, 9.2 + time * 0.15)),
                  noise(p + 4.0 * q + vec2(8.3 - time * 0.1, 2.8 + time * 0.2)));
    return noise(p + 2.5 * r);
  }

  void main() {
    vUv = uv;
    
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 uvScaled = vUv * aspect;

    // --- CALCOLO POSIZIONE RANDOM AD OGNI PULSE ---
    float pulseSpeed = 1.2;
    float pulseTime = u_time * pulseSpeed;
    float cycleIndex = floor(pulseTime / (2.0 * 3.14159265));
    
    vec2 randomCenter = hash2D(vec2(cycleIndex, 78.23)) * aspect;

    float distFromRandom = length(uvScaled);
    float pulseEnvelope = sin(pulseTime) * 0.5 + 0.75;

    // --- SIMULAZIONE DISPLACE FLUIDO ---
    float fluidPattern = fluidNoise(uvScaled * 6.0, u_time * 0.8);
    float wavePattern = sin(distFromRandom * 8.0 - u_time * 2.5 + fluidPattern * 4.0) * 0.5 + 0.5;

    float displacement = wavePattern * pulseEnvelope * (1.0 + fluidPattern * 0.5);

    vec3 displacedPosition = position;
    displacedPosition.z += displacement * 0.28;

    vDisplacement = displacement;
    vFluidUv = uvScaled;

    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const footerFragmentShader = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec2 vFluidUv;
  varying vec3 vViewPosition;

  // --- ACES FILM-TONEMAPPING (Mantiene le luci morbide senza bruciature) ---
  vec3 ACESFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  // --- DITHERING (Previene il color-banding) ---
  float randomDither(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  }

  void main() {
    float wave = vDisplacement;
    float blend = clamp(wave, 0.0, 1.0);

    // --- 1. PALETTE CROMATICA MORBIDA (TONE SHADING) ---
    vec3 colorBaseDark        = vec3(0.03, 0.03, 0.04); // Neri metallici morbidi
    vec3 colorSilver          = vec3(0.50, 0.54, 0.58); // Alluminio satinato
    vec3 colorChromeHighlight = vec3(0.82, 0.86, 0.90); // Luce speculare morbida

    // Transizione della base alluminio
    float aluminumStep = smoothstep(0.02, 0.55, blend);
    vec3 aluminumBase = mix(colorBaseDark, colorSilver, aluminumStep);
    
    // Transizione sfumata sulle cime
    float highlightFactor = pow(smoothstep(0.45, 0.90, blend), 1.8);
    aluminumBase = mix(aluminumBase, colorChromeHighlight, highlightFactor);

    // --- 2. RIFLESSI CROMATICI RGB (DISPERSIONE IRIDESCENTE CORRETTA) ---
    float waveOffset = blend * 6.28318;
    
    float rReflect = sin(waveOffset + 0.0) * 0.5 + 0.5;
    float gReflect = sin(waveOffset + 2.094) * 0.5 + 0.5; 
    float bReflect = sin(waveOffset + 4.188) * 0.5 + 0.5; // Corretto bug +5.5 dell'originale

    vec3 rgbDispersion = vec3(rReflect, gReflect, bReflect);

    // Maschera controllata sulle creste dell'onda
    float rgbMask = pow(smoothstep(0.20, 0.85, blend), 1.4);
    vec3 iridescence = rgbDispersion * rgbMask * 0.28;

    // --- 3. COMBINAZIONE FINALE ---
    vec3 finalColor = aluminumBase + iridescence;

    // Bagliore speculare graduale ed elegante
    float specularGlint = pow(smoothstep(0.55, 0.98, blend), 4.0);
    finalColor += vec3(specularGlint * 0.25);

    // --- 4. POST-PRODUZIONE & TONEMAPPING ---
    
    // A) Tonemapping ACES Filmico per evitare totalmente colori bruciati
    finalColor = ACESFilm(finalColor);

    // B) Vignettatura sottile ai bordi
    vec2 uvCentered = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(uvCentered, uvCentered) * 2.22;
    vignette = smoothstep(0.0, 1.0, vignette);
    float vignettefT = vUv.y;
    finalColor *= vignette;

    // C) Gamma Correction (Spazio di colore naturale)
    //finalColor = pow(finalColor, vec3(1.0 / 2.2));

    // D) Grain/Dithering impercettibile contro le bande di colore
    float dither = randomDither(gl_FragCoord.xy) * (1.0 / 255.0);
    finalColor += dither*55.;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;