package com.graphapp.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class EdgeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Edge getEdgeSample1() {
        return new Edge().id(1L);
    }

    public static Edge getEdgeSample2() {
        return new Edge().id(2L);
    }

    public static Edge getEdgeRandomSampleGenerator() {
        return new Edge().id(longCount.incrementAndGet());
    }
}
