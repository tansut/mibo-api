
async function printDelayed(elements: string[]) {
    for (const element of elements) {
        await delay(200);
        console.log(element);
    }
}

function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function doit() {
    await printDelayed(["Hello", "beautiful", "asynchronous", "world"]).then(() => {

    });
    console.log();
    console.log("Printed every element!");
}

doit().then(() => console.log('SSSS'));