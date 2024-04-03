window.electron = {
  on: jest.fn(),
  send: jest.fn(),
}

class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}

window.ResizeObserver = ResizeObserverMock
