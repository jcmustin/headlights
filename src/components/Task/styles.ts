import styled from '@emotion/styled';
import { lighten, darken, opacify } from 'polished';
import milkyWay from '../../../assets/milky-way.jpg';

// const BASE_COLOR = `#d80d6c`;
const BASE_COLOR = `#811c5c`;
const PRIMARY_COLOR = BASE_COLOR;
const SECONDARY_COLOR = lighten(0.63, BASE_COLOR);
// const PRIMARY_COLOR = lighten(0.63, BASE_COLOR);
// const SECONDARY_COLOR = lighten(.2, BASE_COLOR);

export const TaskView = styled.div`
  position: fixed;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10% 0;
  background-image: linear-gradient(
      ${opacify(-0.3, BASE_COLOR)},
      ${opacify(-0.1, BASE_COLOR)}
    ),
    url(${milkyWay});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Input = styled.input`
  &::selection {
    background: #fffffffe;
    color: ${lighten(0.1, PRIMARY_COLOR)};
  }
  border: none;
  border-bottom: 1px solid #fffd;
  outline: none;
  background: transparent;
  padding: 0.5em;
  font-family: 'Roboto Slab', sans-serif;
  font-size: 3rem;
  display: block;
  color: ${SECONDARY_COLOR};
  text-shadow: 0px 1.4px 0px ${darken(0.18, SECONDARY_COLOR)}, 0px 5px 2px #0002;
`;

export const NameInput = styled(Input)`
  width: 20em;
`;

export const DurationInput = styled(Input)`
  text-align: center;
  width: 3em;
`;

export const StartTaskButton = styled.button`
  font-size: 3rem;
  font-family: 'Roboto Slab', sans-serif;
  text-shadow: 0px -2px 0px #0002;
  box-shadow: 0px 3px 0px ${darken(0.1, SECONDARY_COLOR)}, 0px 7px 3px #0002;
  padding: 1.5rem 3rem;
  color: ${lighten(0.1, PRIMARY_COLOR)};
  border: none;
  background: ${SECONDARY_COLOR};
  border-radius: 0.2rem;
  &:hover {
    transform: none;
  }
  user-select: none;
  outline: none;
`;
