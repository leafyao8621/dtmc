#include <stdio.h>
#include "core/core.h"

int main(void) {
    double s0[3] = {1, 0, 0};
    double t[9] = {
        0, 0.5, 0.5,
        0.5, 0, 0.5,
        0.5, 0.5, 0
    };
    double st[300];
    core_calculate(s0, t, 3, st, 100, 1);
    double *iter = st;
    for (unsigned long long i = 0; i < 100; ++i) {
        printf("iter %llu:\n", i + 1);
        for (unsigned long long j = 0; j < 3; ++j, ++iter) {
            printf("%lf ", *iter);
        }
        putchar(10);
    }
    return 0;
}
