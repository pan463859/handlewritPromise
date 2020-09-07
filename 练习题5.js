Promise.resolve()
    .then(() => {
        console.log("then1");
        Promise.resolve()
            .then(() => {
                console.log("then1-1");
                return Promise.resolve();
            })
            .then(() => {
                console.log("then1-2");
                return Promise.resolve();
            }).then(() => {
                console.log("then1-3");
            });
    })
    .then(() => {
        console.log("then2");
    })
    .then(() => {
        console.log("then3");
    })
    .then(() => {
        console.log("then4");
    }).then(() => {
        console.log("then5");
    }).then(() => {
        console.log("then6");
    }).then(() => {
        console.log("then7");
    }).then(() => {
        console.log("then8");
    });
    // 在then中return Promise.resolve会让该任务晚两个微队列
/**
* 打印：then1，then1-1,then2,then3,then4，then1-2，then5，then6,then7，then1-3，then8
* 宏队列 []
* 微队列 [then2]
*/