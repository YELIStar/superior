// console.log('----0----');
// const lpro = new Promise((resolve, reject) => {
//     console.log("----1----");
//     setTimeout(() => { console.log("----4----") }, 1000);
//     resolve(3);
// })
// lpro.then((a) => { console.log("----" + a + "----") });
// console.log('----2----');
// -----------------------------------------
// console.log('----0----');
// const asyncT = async () => {
//     console.log("----1----");
//     const nom = await new Promise((resolve, reject) => {
//         console.log("-----8-----");
//         setTimeout((abc) => {
//             console.log("-----5----");
//             // resolve(abc);
//             console.log("-----7----");
//         }, 1000, 6);
//         console.log("-----9-----");
//     });
//     console.log("----" + "6" + "----");
// }
// asyncT();
// console.log("----2----");
// -----------------------------------------
// const ffffff = {
//     name: "Tom",
//     age: 10,
//     habbits: ["eat", "drink", "sleep"],
//     getAge: function () {
//         return this.age;
//     }
// }
// const jsfff = JSON.stringify(ffffff);
// console.log(JSON.parse(jsfff));
// console.log(jsfff);