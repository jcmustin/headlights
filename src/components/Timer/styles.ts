import styled from '@emotion/styled';
import { PRIMARY_COLOR } from '../../constants/constants';

export const Progress = styled.progress<{ isComplete?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5.1vh;
  max-height: 120px;
  border-radius: 0;
  &::-webkit-progress-bar {
    background: transparent;
  }
  &::-webkit-progress-value {
    background: ${({ isComplete }) => (isComplete ? '#fffa' : PRIMARY_COLOR)};
    transition: background-color 1s ease-in-out;
    animation-play-state: running;
  }
`;

export const TaskTitle = styled.div`
  font-family: 'Roboto Slab', sans-serif;
  font-weight: bolder;
  text-align: center;
  color: #fff6;
  text-shadow: 0px 3px 0px #0003;
  box-shadow: 0px 3px 0px #0003;
  font-size: 5em;
  position: fixed;
  left: 50%;
  background: #fff2;
  border-radius: 3px;
  border-top: none;
  top: 0;
  padding: 0.3em 0.5em;
  transform: translateX(-50%);
  &:hover: {
    background: #0000;
  }
`;
