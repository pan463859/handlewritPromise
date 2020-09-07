console.log('a');
new Promise(resolve => {
    console.log('b')
    resolve()
}).then(() => {
    console.log('c')
    setTimeout(() => {
      console.log('d')
    }, 0)
})

setTimeout(() => {
    console.log('e')
    new Promise(resolve => {
        console.log('f')
        resolve()
    }).then(() => {
        console.log('g')
    })
}, 100)

setTimeout(() => {
    console.log('h')
    new Promise(resolve => {
        resolve()
    }).then(() => {
        console.log('i')
    })
    console.log('j')
}, 0)
/**
 * 打印：a b c  h j i d e f g
 * 宏队列 []
 * 微队列 []
 */