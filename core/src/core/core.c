#include <stdlib.h>
#include <string.h>
#include <cblas.h>

int core_calculate(double *s0,
                   double *t,
                   unsigned long long dim,
                   double *st,
                   unsigned long long iter,
                   char hist) {
    if (!s0 || !t) {
        return 1;
    }
    double *cur = malloc(dim * sizeof(double));
    memcpy(cur, s0, dim * sizeof(double));
    double *buf = malloc(dim * sizeof(double));
    double *iter_st = 0;
    if (hist) {
        iter_st = st;
    }
    for (unsigned long long i = 0; i < iter; ++i, iter_st += dim) {
        cblas_dgemm(CblasRowMajor,
                    CblasNoTrans,
                    CblasNoTrans,
                    1,
                    dim,
                    dim,
                    1,
                    cur,
                    dim,
                    t,
                    dim,
                    0,
                    buf,
                    dim);
        memcpy(cur, buf, dim * sizeof(double));
        if (hist) {
            memcpy(iter_st, cur, dim * sizeof(double));
        }
    }
    if (!hist) {
        memcpy(st, buf, dim * sizeof(double));
    }
    free(buf);
    free(cur);
    return 0;
}
