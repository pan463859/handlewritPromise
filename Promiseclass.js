//自定义promise的函数模块 
const PENDIING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'
class Promise {
    constructor(excutor) {
        /**
           * Promise 构造函数
           * excutor 执行器函数（同步执行）
           */
        this.status = PENDIING
        this.data = undefined
        this.callbacks = []
        resolve = (value) => {
            //如果当前状态不是PENDIING，直接结束
            if (this.status != PENDIING) {
                return
            }
            //状态修改为RESOLVED
            this.status = RESOLVED
            //保存value数据
            this.data = value
            //如果有待执行的callback函数，立即异步执行回调函数onRESOLVED
            if (this.callbacks.length > 0) {
                setTimeout(() => {//放入队列中执行
                    this.callbacks.forEach(callbackobj => {
                        callbackobj.onresolved(value)
                    });
                }, 0);
            }
        }
        reject = (reason) => {
            //如果当前状态不是PENDIING，直接结束
            if (this.status != PENDIING) {
                return
            }
            //状态修改为RESOLVED
            this.status = REJECTED
            //保存value数据
            this.data = reason
            //如果有待执行的callback函数，立即异步执行回调函数onReject
            if (this.callbacks.length > 0) {
                setTimeout(() => {//放入队列中执行
                    this.callbacks.forEach(callbackobj => {
                        callbackobj.onrejected(reason)
                    });
                }, 0);
            }
        }

        //立即同步执行excutor
        try {
            excutor(resolve, reject)
        }
        catch (erro) {
            reject(erro)
        }
    }
    /**
    * Promise的原型对象的then()
    * 指定成功和失败的回调函数
    * 返回一个新的promise对象
    */
    then(onresolved, onrejected) {
        //必须保持this为调用对象的上下文，不能使用箭头函数
        const _this = this
        onresolved = typeof onresolved === 'function' ? onresolved : value => value

        //指定默认的失败回调，传递reason实现异常穿透
        onrejected = typeof onrejected === 'function' ? onrejected : reason => {
            throw reason
        }

        //返回一个新的Promise对象
        return new Promise((resolve, reject) => {
            /**
            * 1.如果抛出异常，return的promise就会失败 reason就是erro
            * 2.如果回调函数执行返回非promise，return的promise就会成功，value就是返回值
            * 3.如果回调函数执行返回的是promise,return的promise的结果就是这个promise的结果
             */
            //调用指定的函数处理,根据执行结果改变return的promise的状态
            function handle(callback) {
                try {
                    const result = callback(_this.data)
                    if (result instanceof Promise) {
                        // result.then(
                        //     value => resolve(value),//当result成功时，让return的promise也成功
                        //     reason => reject(reason)//当result失败时，当return的promise也失败
                        // )
                        result.then(resolve, reject)
                    } else {
                        resolve(result)
                    }

                } catch (error) {
                    reject(error)
                }
            }

            //当前状态还是PENDIING的状态，将回调函数保存起来
            if (_this.status == PENDIING) {
                _this.callbacks.push({
                    onresolved() {
                        handle(onresolved)
                    },
                    onrejected() {
                        handle(onrejected)
                    }
                })
            } else if (_this.status == RESOLVED) {
                setTimeout(() => {
                    //如果当前是resoved状态，异步执行 onResolved 并改变return的promise的状态
                    handle(onresolved)
                }, 0);
            } else {
                setTimeout(() => {
                    handle(onrejected)//如果当前是rejected状态，异步执行 onRejected 并改变return的promise状态
                }, 0);
            }
        })
    }
    /**
     * Promise的原型对象的catch()
     * 指定失败的回调函数
     * 返回一个新的promise
     */
    catch(onReject) {
        return this.then(undefined, onReject)
    }
    /**
     * Promise的函数对象的方法 resolve reject all race 
     */
    //返回一个指定结果的promise
    static resolve = function (value) {
        //返回一个失败的promise
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })

    }
    //返回一个指定reason的失败promise
    static reject = function (reason) {
        //返回一个失败的promise
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }
    /**
     * 
     * @param {Promise} promises 
     * 返回一个promise，当所有promise都成功时候才成功，否则失败
     */
    static all = function (promises) {
        //用来保存所有成功的数据
        const values = new Array(promises.length)
        let count = 0
        return new Promise((resolve, reject) => {
            //遍历获取每个promise的结果
            promises.forEach((item, index) => {
                Promise.resolve(item).then(
                    value => {//成功的value到values中
                        values[index] = value
                        //如果全部成功了，讲return的promise改变成功
                        count++
                        if (count == promises.length) {
                            resolve(values)
                        }
                    },
                    reason => {//只要有一个失败了，return的promise就失败了
                        reject(reason)
                    }
                )
            })
        }
        )
    }
    //返回一个promise，结果由第一个完成的primise决定
    static race = function (promises) {
        return new Promise((resolve, reject) => {
            promises.forEach((item, index) => {
                Promise.resolve(item).then(
                    value => {//一旦成功了，将return变成成功
                        resolve(value)
                    },
                    reason => {//一旦失败了，将return变为失败
                        reject(reason)
                    }
                )
            })
        })
    }
}

