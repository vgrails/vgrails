package com.vgrails.interfaces

import java.lang.invoke.MethodHandleImpl.BindCaller.T

interface Treeable {

    def getRoot()
    def getParent()
    def getChildren()
}