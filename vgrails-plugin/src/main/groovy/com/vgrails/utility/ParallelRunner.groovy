package com.vgrails.utility

import grails.compiler.GrailsCompileStatic
import grails.compiler.GrailsTypeChecked
import groovy.time.TimeCategory
import groovy.time.TimeDuration

/**
 * 并行任务执行工具
 */
@GrailsCompileStatic
@GrailsTypeChecked
class ParallelRunner {

    int elapseInseconds
    BigDecimal operationPerSecond

    void Run(int tNum, int oNum, Closure closure){
        List<Thread> threads = []

        Date start = new Date()
        for (int i = 0; i < tNum; i++) {
            threads.add(Thread.start {
                for (int j = 0; j < oNum; j++) {
                    closure.call(i, j)
                }
            })
        }

        threads*.join()
        Date stop = new Date()
        TimeDuration duration = TimeCategory.minus(stop, start)

        elapseInseconds=duration.seconds
        operationPerSecond = tNum * oNum / (duration.toMilliseconds() / 1000)
    }

    String toString(){
        return "Elapsed:${elapseInseconds}s, OPS:${operationPerSecond}"
    }
}
