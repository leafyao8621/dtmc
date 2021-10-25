from setuptools import setup, Extension
import numpy

core = Extension('dtmc._core',
                 sources=["dtmc/core/core/core.c",
                          "dtmc/core/main.c"],
                 include_dirs=[numpy.get_include(), "/usr/include/openblas"],
                 libraries=["openblas"])

setup(name="dtmc",
      version="0.1",
      packages=["dtmc"],
      ext_modules=[core])
