import { css, keyframes } from '@emotion/react'
import { darken, lighten, opacify, mix } from 'polished'

/** timing */
export const COOLDOWN_DURATION = 10
export const TICKS_PER_SECOND = 10
export const FADE_IN_DURATION = 1

/** styles */
// dark mode: const BASE_COLOR = '#541130' //'#761240'
const BASE_COLOR = '#ff0049' //'#761240'
export const PRIMARY_COLOR = BASE_COLOR
export const SECONDARY_COLOR = '#fb0'
export const UI_COLOR = '#fff'; // lighten(0.1, PRIMARY_COLOR)

export const SHADOW_STYLE = '0 4px 3px #0003'
export const FONT_STYLE = css`
  font-family: 'Roboto Slab', sans-serif;
  color: ${opacify(-0.1, UI_COLOR)};
  -webkit-text-stroke: 1px ${lighten(0.05, UI_COLOR)};
  text-shadow: 0px 1.25px 0px ${opacify(-0.4, darken(0.1, UI_COLOR))},
    0px 2.5px 0px ${opacify(-0.4, darken(0.2, UI_COLOR))},
    ${SHADOW_STYLE};
  font-size: 1.5rem;
  &::selection {
    background: ${opacify(-0.9, darken(0.05, UI_COLOR))};
  }
`

export const FADE_IN_KEYFRAMES = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

// const BASE_COLOR =  '#811c5c';
// const BASE_COLOR = '#b54c0b'; // '#811c5c';
// const PRIMARY_COLOR = lighten(0.63, BASE_COLOR);
// const SECONDARY_COLOR = lighten(.2, BASE_COLOR);
