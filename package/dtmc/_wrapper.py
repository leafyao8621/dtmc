import numpy
import dtmc._core

def calculate(s0: numpy.ndarray,
              t: numpy.ndarray,
              iter: int,
              hist: bool) -> numpy.ndarray:
    out = numpy.empty_like(s0) if not hist else numpy.empty((iter, s0.shape[0]))
    print(s0)
    dtmc._core.calculate(s0, t, iter, hist, out)
    return out
