import styled from '@emotion/styled'
import { lighten, opacify, saturate } from 'polished'
import { FONT_STYLE, PRIMARY_COLOR } from '../../constants/constants'

export const Progress = styled.progress<{ isComplete?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3.5vh; // 5.1vh;
  max-height: 220px;
  border-radius: 0;
  &::-webkit-progress-bar {
    background: transparent;
  }
  &::-webkit-progress-value {
    background: ${({ isComplete }) =>
      saturate(
        1,
        lighten(0.3, opacify(-0.3, isComplete ? '#fff' : PRIMARY_COLOR)),
      )};
    box-shadow: ${({ isComplete }) =>
      isComplete ? '0 0 2px 3px #fffb, inset 0 0 80px 6px #fff' : 'none'};
    transition: background-color 0.2s, box-shadow 0.3s;
    animation-play-state: running;
  }
`

export const TaskTitle = styled.div`
  width: fit-content;
  font-weight: bolder;
  ${FONT_STYLE};
  text-align: center;
  opacity: 0.5;
  box-shadow: 0px 3px 0px #0003;
  font-size: 3.5em;
  position: fixed;
  left: 50%;
  background: #8884;
  border-radius: 3px;
  border-top: none;
  top: 0;
  padding: 0.3em 0.5em;
  transform: translateX(-50%);
  &:hover: {
    background: #0000;
  }
`
