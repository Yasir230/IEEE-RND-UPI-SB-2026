import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_causticsSpeed;
uniform float u_lightIntensity;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

float warpedNoise(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + t * 0.04, 3),
    fbm(p + vec2(5.2, 1.3) + t * 0.03, 3)
  );
  return fbm(p + 4.0 * q, 4);
}

float waterSurface(vec2 p, float t) {
  float waves = 0.0;
  waves += sin(p.x * 2.0 + t * 0.8) * cos(p.y * 1.5 + t * 0.6) * 0.04;
  waves += sin(p.x * 3.5 - t * 1.2 + p.y * 2.0) * 0.03;
  waves += sin(p.x * 1.2 + p.y * 3.0 + t * 0.4) * 0.035;
  waves += sin(p.x * 5.0 - p.y * 4.0 + t * 1.5) * 0.015;
  waves += warpedNoise(p * 1.5, t * 0.5) * 0.03;
  return waves;
}

float caustics(vec2 p, float t) {
  float c1 = pow(0.5 + 0.5 * sin(p.x * 12.0 + t * 2.0 + sin(p.y * 8.0 + t) * 0.5), 3.0);
  float c2 = pow(0.5 + 0.5 * sin(p.y * 15.0 - t * 1.8 + sin(p.x * 10.0 - t * 0.5) * 0.4), 3.0);
  return (c1 * 0.5 + c2 * 0.5) * 0.4;
}

float godRays(vec2 uv, float t) {
  float angle = 0.7 + sin(t * 0.05) * 0.1;
  vec2 rayDir = vec2(cos(angle), sin(angle));
  float rays = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float offset = fi * 0.3;
    vec2 rayOrigin = vec2(-0.5 + sin(t * 0.1 + fi * 2.0) * 0.2, -0.5);
    float proj = dot(uv - rayOrigin, rayDir);
    vec2 perp = uv - rayOrigin - rayDir * proj;
    float width = 0.02 + fi * 0.008;
    float ray = smoothstep(width, 0.0, length(perp));
    float fade = smoothstep(-0.5, 0.5, proj) * smoothstep(2.0, 0.5, proj);
    float intensity = 0.15 + sin(t * 0.3 + fi * 1.5) * 0.05;
    rays += ray * fade * intensity;
  }
  return rays;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time * u_causticsSpeed;

  vec2 mouseShift = vec2(0.0);
  if (u_mouse.x > 0.0) {
    vec2 mUV = (u_mouse / u_res - 0.5) * vec2(aspect, 1.0);
    mouseShift = -mUV * 0.15;
  }

  vec3 colDeep = vec3(0.012, 0.016, 0.37);
  vec3 colMid = vec3(0.008, 0.24, 0.54);
  vec3 colSurface = vec3(0.0, 0.47, 0.71);
  vec3 colLight = vec3(0.28, 0.79, 0.89);

  float surfaceY = 0.1 + waterSurface(p, t) * 0.5;

  vec3 waterColor;
  if (p.y > surfaceY) {
    waterColor = mix(colSurface, colLight, smoothstep(surfaceY, surfaceY + 0.3, p.y));
  } else if (p.y > surfaceY - 0.4) {
    waterColor = mix(colMid, colSurface, smoothstep(surfaceY - 0.4, surfaceY, p.y));
  } else {
    waterColor = mix(colDeep, colMid, smoothstep(surfaceY - 0.8, surfaceY - 0.4, p.y));
  }

  waterColor = mix(waterColor, colDeep * 0.5, smoothstep(0.0, -0.6, p.y));

  vec2 causticUV = p * 2.0 + mouseShift * 2.0;
  float c = caustics(causticUV, t);
  vec3 causticColor = mix(vec3(0.3, 0.85, 0.95), vec3(0.2, 0.5, 0.85), c);
  float causticMask = smoothstep(surfaceY - 0.1, surfaceY, p.y) * smoothstep(surfaceY + 0.5, surfaceY, p.y) * 0.7
                    + smoothstep(surfaceY, surfaceY + 0.3, p.y) * 0.3;
  waterColor += causticColor * c * causticMask * u_lightIntensity;

  waterColor += vec3(0.6, 0.85, 1.0) * godRays(p + mouseShift, u_time) * u_lightIntensity;

  float surfaceDetail = warpedNoise(p * 4.0 + vec2(t * 0.1, t * 0.08), t * 0.2);
  float surfaceHighlight = smoothstep(0.4, 0.6, surfaceDetail) * smoothstep(surfaceY + 0.05, surfaceY - 0.02, p.y);
  waterColor += vec3(0.5, 0.9, 1.0) * surfaceHighlight * 0.3 * u_lightIntensity;

  float murk = fbm(p * 3.0 + t * 0.02, 3);
  waterColor = mix(waterColor, colDeep * 1.5, murk * smoothstep(0.0, -0.8, p.y) * 0.4);

  float vig = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.8;
  waterColor *= max(vig, 0.0);

  waterColor = mix(waterColor, vec3(0.05, 0.1, 0.4), 0.15);

  gl_FragColor = vec4(pow(waterColor, vec3(0.95, 1.0, 1.05)), 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uCausticsSpeed = gl.getUniformLocation(program, 'u_causticsSpeed');
    const uLightIntensity = gl.getUniformLocation(program, 'u_lightIntensity');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    gl.uniform1f(uCausticsSpeed, 0.6);
    gl.uniform1f(uLightIntensity, 1.0);

    let mouseX = -1;
    let mouseY = -1;
    let mouseActive = false;
    let lastMouseTime = 0;
    let animId = 0;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouseX = (e.clientX - rect.left) * dpr;
      mouseY = (rect.height - (e.clientY - rect.top)) * dpr;
      mouseActive = true;
    };

    const onLeave = () => {
      mouseActive = false;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const now = performance.now() * 0.001;
      gl.uniform1f(uTime, now);

      if (mouseActive) {
        gl.uniform2f(uMouse, mouseX, mouseY);
        lastMouseTime = performance.now();
      } else if (performance.now() - lastMouseTime > 100) {
        gl.uniform2f(uMouse, -1, -1);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
