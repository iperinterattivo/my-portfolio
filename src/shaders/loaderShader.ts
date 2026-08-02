export const loaderVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
  vUv = (uv - 0.5) * 1.5 + 0.5;
    gl_Position = vec4(position, 1.0);
  }
`;

export const loaderFragmentShader = /* glsl */ `
  uniform float u_fill;
  uniform float u_explode;
  uniform sampler2D u_mask;
  uniform sampler2D u_mask_blur; // La nuova texture pre-sfocata
  uniform vec2 u_resolution;
  
  varying vec2 vUv;

  // Noise procedurale per dare matericità all'espansione
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 bgColor = vec3(0.957, 0.957, 0.961); // #f4f4f5
    vec3 textColor = vec3(0.02, 0.02, 0.02);  // #050505

    // 1. MANTENIMENTO PROPORZIONI MASCHERA (Aspect Ratio 1:1)
    vec2 maskUv = vUv;
    float screenAspect = u_resolution.x / u_resolution.y;
    float maskAspect = 1.0; 
    
    if (screenAspect > maskAspect) {
        maskUv.x = (vUv.x - 0.5) * (screenAspect / maskAspect) + 0.5;
    } else {
        maskUv.y = (vUv.y - 0.5) * (maskAspect / screenAspect) + 0.5;
    }

    // 2. LETTURA DELLE TEXTURE
    float cleanAlpha = 0.0;
    float blurAlpha = 0.0;
    if (maskUv.x >= 0.0 && maskUv.x <= 1.0 && maskUv.y >= 0.0 && maskUv.y <= 1.0) {
        cleanAlpha = texture2D(u_mask, maskUv).a;
        blurAlpha = texture2D(u_mask_blur, maskUv).a;
    }

    // 3. FASE 1: TRANSIZIONE PULITO -> BLUR (u_explode 0.0 a 0.3)
    float blurProgress = smoothstep(0.0, 0.5, u_explode);
    float currentAlpha = mix(cleanAlpha, blurAlpha, blurProgress);

    // 4. FASE RIEMPIMENTO LIQUIDO VERTICALE (u_fill)
    float fillProgress = smoothstep(vUv.y - 0.05, vUv.y + 0.105, u_fill);
    float filledText = currentAlpha * fillProgress;

    // 5. FASE 2: ESPANSIONE RADIALE (Distance Field) (u_explode 0.3 a 0.7)
    float expandProgress = smoothstep(0.3, .9, u_explode);
    float n = noise(vUv * 6.0 - u_explode * 3.0); // Rumore animato
    
    // Distanza radiale dal centro per forzare il riempimento degli angoli dello schermo
    vec2 centerUv = (vUv - 0.5) * vec2(screenAspect, 1.0);
    float dist = length(centerUv);
    float radialGrowth = smoothstep(.45, 0.0, dist - expandProgress * .5) * expandProgress;

    // Uniamo il testo, il Distance Field (blurAlpha amplificato) e la crescita radiale
    float expansionForce = expandProgress * 3.0;
    float combinedSDF = filledText + (blurAlpha * expansionForce) + (radialGrowth  * 2.0) + (expandProgress * 1.5);

    // Taglio (Thresholding) per trasformare il gradiente in nero solido
    float finalShape = smoothstep(0.01, 0.3, combinedSDF);
    vec3 finalColor = mix(bgColor, textColor, finalShape);

   // 6. FASE 3: DISSOLVENZA FINALE (Anticipata e velocizzata)
    // Inizia a sfumare già a 0.55 e conclude a 0.9
    float fadeOut = smoothstep(0.55, 0.9, u_explode);
    float canvasAlpha = 1.0 - fadeOut;


    gl_FragColor = vec4(finalColor, canvasAlpha);
  }
`;