// Node.js事件循环演示

// 示例1: 展示同步代码与异步回调的执行顺序
console.log('--- 示例1: 同步与异步基础 ---');
console.log('同步代码开始');

setTimeout(() => {
    console.log('setTimeout 回调 (timers阶段)');
}, 0);

setImmediate(() => {
    console.log('setImmediate 回调 (check阶段)');
});

// 微任务 - Promise.then属于微任务，会在当前操作完成后立即执行
Promise.resolve().then(() => {
    console.log('Promise.then 回调 (微任务)');
});

console.log('同步代码结束');

// 等待示例1完成
setTimeout(() => {
    // 示例2: 展示事件循环的阶段执行顺序
    console.log('\n--- 示例2: 事件循环阶段顺序 ---');

    // timers阶段回调
    setTimeout(() => {
        console.log('1. setTimeout (timers阶段)');

        // 在timers阶段内添加的setImmediate会在check阶段执行
        setImmediate(() => {
            console.log('1.1 setImmediate (check阶段)');
        });
    }, 0);

    // check阶段回调
    setImmediate(() => {
        console.log('2. setImmediate (check阶段)');

        // 在check阶段添加的setTimeout会在下一轮timers阶段执行
        setTimeout(() => {
            console.log('2.1 setTimeout (下一轮timers阶段)');
        }, 0);
    });

    // I/O回调 (poll阶段)
    const fs = require('fs');
    fs.readFile(__filename, () => {
        console.log('3. fs.readFile 回调 (poll阶段)');

        // 在I/O回调中，setImmediate总是先于setTimeout执行
        setTimeout(() => {
            console.log('3.1 setTimeout (timers阶段)');
        }, 0);

        setImmediate(() => {
            console.log('3.2 setImmediate (check阶段)');
        });
    });

    // 关闭回调
    const net = require('net');
    const server = net.createServer(() => { }).listen(3000);
    server.on('close', () => {
        console.log('4. 服务器关闭回调 (close阶段)');
    });
    server.close();

}, 100);

// 等待示例2完成
setTimeout(() => {
    // 示例3: 微任务与宏任务的执行顺序
    console.log('\n--- 示例3: 微任务与宏任务 ---');

    console.log('同步代码开始');

    // 宏任务
    setTimeout(() => {
        console.log('setTimeout 回调 (宏任务)');

        // 宏任务中的微任务
        Promise.resolve().then(() => {
            console.log('setTimeout中的Promise (微任务)');
        });
    }, 0);

    // 宏任务
    setImmediate(() => {
        console.log('setImmediate 回调 (宏任务)');
    });

    // 微任务
    Promise.resolve().then(() => {
        console.log('Promise 1 (微任务)');

        // 微任务中添加的微任务
        Promise.resolve().then(() => {
            console.log('Promise 2 (微任务)');
        });

        // 微任务中添加的宏任务
        setTimeout(() => {
            console.log('Promise中的setTimeout (宏任务)');
        }, 0);
    });

    console.log('同步代码结束');

}, 300);
