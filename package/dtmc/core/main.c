#include <Python.h>
#include <numpy/arrayobject.h>
#include "core/core.h"

#define GETSTATE(m) ((struct module_state*)PyModule_GetState(m))

struct module_state {
    PyObject* error;
};

static PyObject* calculate(PyObject* self, PyObject* args) {
    int hist;
    long iter;
    double **out_array_data_ptr,
           *out_data_ptr,
           **s0_array_data_ptr,
           *s0_data_ptr,
           **t_array_data_ptr,
           *t_data_ptr;
    NpyIter *out_iter, *s0_iter, *t_iter;
    NpyIter_IterNextFunc *out_iter_next, *s0_iter_next, *t_iter_next;
    PyObject *s0_array, *t_array, *out_array;
    npy_intp dim;
    if (!PyArg_ParseTuple(args, "O!O!lpO!",
                          &PyArray_Type,
                          &s0_array,
                          &PyArray_Type,
                          &t_array,
                          &iter,
                          &hist,
                          &PyArray_Type,
                          &out_array)) {
        return NULL;
    }
    if (!(dim = PyArray_DIM(s0_array, 0))) {
        return NULL;
    }
    if (!(s0_iter = NpyIter_New((PyArrayObject*)s0_array, NPY_ITER_READWRITE,
                                 NPY_KEEPORDER,
                                 NPY_NO_CASTING, NULL))) {
        return NULL;
    }
    if (!(s0_iter_next = NpyIter_GetIterNext(s0_iter, NULL))) {
        NpyIter_Deallocate(s0_iter);
        return NULL;
    }
    if (!(t_iter = NpyIter_New((PyArrayObject*)t_array, NPY_ITER_READWRITE,
                                 NPY_KEEPORDER,
                                 NPY_NO_CASTING, NULL))) {
        NpyIter_Deallocate(s0_iter);
        return NULL;
    }
    if (!(t_iter_next = NpyIter_GetIterNext(t_iter, NULL))) {
        NpyIter_Deallocate(s0_iter);
        NpyIter_Deallocate(t_iter);
        return NULL;
    }
    if (!(out_iter = NpyIter_New((PyArrayObject*)out_array, NPY_ITER_READWRITE,
                                 NPY_KEEPORDER,
                                 NPY_NO_CASTING, NULL))) {
        NpyIter_Deallocate(s0_iter);
        NpyIter_Deallocate(t_iter);
        return NULL;
    }
    if (!(out_iter_next = NpyIter_GetIterNext(out_iter, NULL))) {
        NpyIter_Deallocate(s0_iter);
        NpyIter_Deallocate(t_iter);
        NpyIter_Deallocate(out_iter);
        return NULL;
    }
    double *s0 = malloc(dim * sizeof(double));
    double *t = malloc(dim * dim * sizeof(double));
    double *out = malloc(dim * (hist ? iter : 1) * sizeof(double));

    s0_array_data_ptr = (double**)NpyIter_GetDataPtrArray(s0_iter);
    s0_data_ptr = s0;
    do {
        *(s0_data_ptr++) = **(s0_array_data_ptr);
    } while (s0_iter_next(s0_iter));
    NpyIter_Deallocate(s0_iter);

    t_array_data_ptr = (double**)NpyIter_GetDataPtrArray(t_iter);
    t_data_ptr = t;
    do {
        *(t_data_ptr++) = **(t_array_data_ptr);
    } while (t_iter_next(t_iter));
    NpyIter_Deallocate(t_iter);

    int ret = core_calculate(s0, t, dim, out, iter, hist);
    if (ret) {
        PyErr_SetString(PyExc_RuntimeError, "Core Invocation Failed");
        free(s0);
        free(t);
        free(out);
        NpyIter_Deallocate(out_iter);
        return NULL;
    }

    out_array_data_ptr = (double**)NpyIter_GetDataPtrArray(out_iter);
    out_data_ptr = out;
    do {
        **(out_array_data_ptr) = *(out_data_ptr++);
    } while (out_iter_next(out_iter));

    free(s0);
    free(t);
    free(out);
    NpyIter_Deallocate(out_iter);
    Py_RETURN_NONE;
}


static PyMethodDef _core_methods[] = {
    {"calculate", (PyCFunction)calculate, METH_VARARGS, NULL},
    {0}
};

static int _core_traverse(PyObject *m, visitproc visit, void *arg) {
    Py_VISIT(GETSTATE(m)->error);
    return 0;
}

static int _core_clear(PyObject *m) {
    Py_CLEAR(GETSTATE(m)->error);
    return 0;
}

static struct PyModuleDef moduledef = {
    PyModuleDef_HEAD_INIT,
    "dtmc_core",
    NULL,
    sizeof(struct module_state),
    _core_methods,
    NULL,
    _core_traverse,
    _core_clear,
    NULL
};

PyMODINIT_FUNC PyInit__core(void) {
    PyObject *module = PyModule_Create(&moduledef);
    if (!module) return NULL;
    import_array();
    return module;
}
