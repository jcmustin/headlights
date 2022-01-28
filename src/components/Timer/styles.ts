import styled from '@emotion/styled';
import { PRIMARY_COLOR } from '../../constants/constants';

export const Progress = styled.progress<{ isComplete?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5.1vh;
  max-height: 70px;
  border-radius: 0;
  &::-webkit-progress-bar {
    background: transparent;
  }
  &::-webkit-progress-value {
    background: ${({ isComplete }) => (isComplete ? '#fffb' : PRIMARY_COLOR)};
    box-shadow: ${({ isComplete }) =>
      isComplete ? '0 0 5px 6px #fffb, inset 0 0 25px 6px #fff' : 'none'};
    transition: background-color 0.2s, box-shadow 0.6s;
    animation-play-state: running;
  }
`;

export const TaskTitle = styled.div`
  width: fit-content;
  font-family: 'Roboto Slab', sans-serif;
  font-weight: bolder;
  text-align: center;
  color: #fff7;
  text-shadow: 0px 2px 0px #0004;
  box-shadow: 0px 3px 0px #0003;
  font-size: 4em;
  position: fixed;
  left: 50%;
  background: #8883;
  border-radius: 3px;
  border-top: none;
  top: 0;
  padding: 0.3em 0.5em;
  transform: translateX(-50%);
  &:hover: {
    background: #0000;
  }
`;
