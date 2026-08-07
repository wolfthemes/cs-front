precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uVelo;
uniform float uAmount;
uniform float uScrollVelo;
uniform vec2 uDir;     // displacement axis: [1,0] horizontal, [0,1] vertical
uniform float uGrain;  // grain strength
uniform float uChroma; // RGB channel-split strength (velocity-scaled)

varying vec2 vUv;

float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
  uv -= disc_center;
  uv*= uResolution;
  float dist = sqrt(dot(uv, uv));
  return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}

float random( vec2 p )
{
  vec2 K1 = vec2(
    23.14069263277926,
    2.665144142690225
  );
  return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main() {
  vec2 newUV = vUv;

  float c = circle(newUV, uMouse, 0.0, 0.6);

  // Ungated scroll distortion — shows on scroll even without the mouse. Zero
  // when not scrolling, so the hover (circle-gated) behaviour is unchanged.
  float s = uScrollVelo;

  // Displace along uDir only (horizontal or vertical), so the warp follows the
  // section's motion axis instead of smearing diagonally.
  float disp = c * uVelo + s;
  newUV += disp * uDir;

  // Very slight chromatic aberration: split the R/B samples a hair along the
  // motion axis, scaled by the same velocity magnitude so it vanishes when the
  // image is at rest (crisp) and only fringes while it moves — the "flexible /
  // 3D" cue. `s` is signed (scroll/marquee direction); the hover circle (c) adds
  // its own gated split under the cursor.
  vec2 off = (abs(s) + c * uVelo) * uChroma * uDir;
  vec4 newColor = vec4(
    texture2D(tMap, newUV + off).r,
    texture2D(tMap, newUV).g,
    texture2D(tMap, newUV - off).b,
    1.0
  );

  newUV.y *= random(vec2(newUV.y, uAmount));
  newColor.rgb += random(newUV) * uGrain;

  gl_FragColor = newColor;
}