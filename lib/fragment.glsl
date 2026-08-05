precision highp float;

uniform sampler2D tMap;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uVelo;
uniform float uAmount;
uniform float uScrollVelo;
uniform vec2 uDir;     // displacement axis: [1,0] horizontal, [0,1] vertical
uniform float uGrain;  // grain strength

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

  // Displace along uDir only (horizontal or vertical), so the RGB split follows
  // the section's motion axis instead of smearing diagonally.
  float r = texture2D(tMap, newUV += (c * (uVelo * .9) + s * .9) * uDir).x;
	float g = texture2D(tMap, newUV += (c * (uVelo * .925) + s * .925) * uDir).y;
	float b = texture2D(tMap, newUV += (c * (uVelo * .95) + s * .95) * uDir).z;

  vec4 newColor = vec4(r, g, b, 1.);

  newUV.y *= random(vec2(newUV.y, uAmount));
  newColor.rgb += random(newUV) * uGrain;

  gl_FragColor = newColor;
}