import numpy
import dtmc

if __name__ == "__main__":
    out = dtmc.calculate(numpy.array([1, 0, 0], dtype=numpy.double),
                         numpy.array([[0, 0.5, 0.5],
                                      [0.5, 0, 0.5],
                                      [0.5, 0.5, 0]]),
                         100,
                         True)
    print(out)
