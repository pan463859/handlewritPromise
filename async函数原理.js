/**
async函数就是将Generator函数的星号(*)替换成async，将yield换成await
async函数是Generator函数的语法糖，对Generator函数的改进体现在以下四点：
1.内置执行器：Generator函数的执行必须靠执行器，所以才有co模块，async函数自带执行器。也就是说，async函数的执行与普通函数的一模一样，只要一行
    asyncReadFile（）
2.更好的语义：async和await比起星号和yield，语义更清楚。async表示函数里有异步操作，await表示紧跟后面的表达式需要等待 结果
3.更广的适应性：co模块约定，yield命令后面只能是Thunk函数或Promise对象，而async函数的await命令后面，可以是Promise对象金和原始类型的值
4.返回值是Promise async函数的返回值是Promise对象，这比Generator函数的返回值是Iterator对象方便了许多，可以用then方法指定下一步的操作。
 */
// async函数的实现原理
async function fn(args) {
    //....
}
//等同于
function fn(args) {
    return spawn(function* () {
        //...
    });
}
/**
 * 
 * @param {*} genF 生成器函数
 */
function spawn(genF) {
    //返回值是一个Promise
    return new Promise(
        function (resolve, reject) {

            //拿到迭代器
            var gen = genF()
            step(function () {
                //给步进器一个初始值undefined
                return gen.next(undefined)
            })
            //步进器
            function step(nextF) {
                try {
                    var next = nextF()
                } catch (e) {
                    return reject(e)
                }
                if (next.done) {
                    return resolve(next.value)
                } else {
                    Promise.resolve(next.value).then(
                        //以上一个yield的返回值作为参数继续执行迭代器
                        function (value) {
                            step(function () {
                                return gen.next(value)
                            })
                        },
                        function (e) {
                            step(function () {
                                return gen.throw(e)
                            })
                        }
                    )
                }

            }



        }
    )
}